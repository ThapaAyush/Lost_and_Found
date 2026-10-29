import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import User from '../models/User.js';

describe('Lost & Found REST API Test Suite', () => {
  let userCookie = '';
  let adminCookie = '';

  beforeAll(async () => {
    // Connect to MongoDB if disconnected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lost_and_found', {
        dbName: process.env.DB_NAME || 'lost_and_found',
      });
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('GET /api/health should return 200 and healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('POST /api/auth/signup should register a new user', async () => {
    const uniqueEmail = `testuser_${Date.now()}@example.com`;
    const res = await request(app).post('/api/auth/signup').send({
      name: 'Test Candidate',
      email: uniqueEmail,
      password: 'Password123!',
      confirmPassword: 'Password123!',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(uniqueEmail);
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('POST /api/auth/signup should reject duplicate email', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      name: 'Duplicate Test',
      email: 'john@example.com', // Seeded user
      password: 'Password123!',
      confirmPassword: 'Password123!',
    });

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/login should reject invalid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'john@example.com',
      password: 'WrongPassword!',
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/login should log in valid user and return HTTP-only cookie', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'john@example.com',
      password: 'Password123!',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('john@example.com');
    expect(res.headers['set-cookie']).toBeDefined();
    userCookie = res.headers['set-cookie'][0];
  });

  it('POST /api/auth/login should authenticate admin', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@lostandfound.com',
      password: 'AdminPassword123!',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.user.role).toBe('admin');
    adminCookie = res.headers['set-cookie'][0];
  });

  it('GET /api/auth/me should fail without authentication', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/auth/me should succeed with authenticated cookie', async () => {
    const res = await request(app).get('/api/auth/me').set('Cookie', [userCookie]);
    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe('john@example.com');
  });

  it('PATCH /api/users/me should update profile and DELETE /api/users/me/avatar should remove avatar', async () => {
    const updateRes = await request(app)
      .patch('/api/users/me')
      .set('Cookie', [userCookie])
      .send({ avatar: 'https://example.com/test-avatar.jpg' });
    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.user.avatar).toBe('https://example.com/test-avatar.jpg');

    const deleteRes = await request(app)
      .delete('/api/users/me/avatar')
      .set('Cookie', [userCookie]);
    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body.user.avatar).toBe('');
  });

  it('GET /api/items should return seeded items', async () => {
    const res = await request(app).get('/api/items').set('Cookie', [userCookie]);
    expect(res.statusCode).toBe(200);
    expect(res.body.items).toBeDefined();
    expect(res.body.items.length).toBeGreaterThan(0);
  });

  it('POST /api/items should create a new lost item', async () => {
    const res = await request(app)
      .post('/api/items')
      .set('Cookie', [userCookie])
      .send({
        type: 'lost',
        title: 'Blue Water Bottle HydroFlask',
        category: 'Accessories',
        description: 'Lost 32oz blue metal hydroflask with sticker near gym.',
        locationDescription: 'Community Recreation Center Locker Room',
        incidentDate: new Date().toISOString(),
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.item.title).toBe('Blue Water Bottle HydroFlask');
  });

  it('GET /api/admin/stats should reject non-admin user with 403 Forbidden', async () => {
    const res = await request(app).get('/api/admin/stats').set('Cookie', [userCookie]);
    expect(res.statusCode).toBe(403);
  });

  it('GET /api/admin/stats should allow admin user', async () => {
    const res = await request(app).get('/api/admin/stats').set('Cookie', [adminCookie]);
    expect(res.statusCode).toBe(200);
    expect(res.body.stats.totalUsers).toBeGreaterThan(0);
  });
});
