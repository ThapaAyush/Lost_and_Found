import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import User from '../models/User.js';
import Item from '../models/Item.js';
import Claim from '../models/Claim.js';
import Notification from '../models/Notification.js';
import Conversation from '../models/Conversation.js';
import AuditLog from '../models/AuditLog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lost_and_found';
    await mongoose.connect(mongoUri, {
      dbName: process.env.DB_NAME || 'lost_and_found',
    });
    console.log('[Seed] Connected to MongoDB...');

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Item.deleteMany({}),
      Claim.deleteMany({}),
      Notification.deleteMany({}),
      Conversation.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);
    console.log('[Seed] Cleared existing records.');

    // 1. Create Users
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@lostandfound.com',
      password: 'AdminPassword123!',
      phone: '+1 555-0199',
      role: 'admin',
      emailVerified: true,
      accountStatus: 'active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    });

    const userJohn = await User.create({
      name: 'John Reynolds',
      email: 'john@example.com',
      password: 'Password123!',
      phone: '+1 555-0123',
      role: 'user',
      emailVerified: true,
      accountStatus: 'active',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    });

    const userSarah = await User.create({
      name: 'Sarah Jenkins',
      email: 'sarah@example.com',
      password: 'Password123!',
      phone: '+1 555-0144',
      role: 'user',
      emailVerified: true,
      accountStatus: 'active',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
    });

    const userMike = await User.create({
      name: 'Michael Chen',
      email: 'mike@example.com',
      password: 'Password123!',
      phone: '+1 555-0188',
      role: 'user',
      emailVerified: true,
      accountStatus: 'active',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    });

    console.log('[Seed] Users created:');
    console.log(' - Admin: admin@lostandfound.com / AdminPassword123!');
    console.log(' - User 1: john@example.com / Password123!');
    console.log(' - User 2: sarah@example.com / Password123!');
    console.log(' - User 3: mike@example.com / Password123!');

    // 2. Create Items
    // Lost Wallet (John)
    const lostWallet = await Item.create({
      owner: userJohn._id,
      type: 'lost',
      title: 'Black Leather Bellroy Wallet',
      category: 'Wallets and purses',
      description: 'Lost my slim black leather bi-fold wallet. Contains student ID, driver license, and transit pass.',
      brand: 'Bellroy',
      color: 'Black',
      distinguishingFeatures: 'Small scratch on inner seam, contains a blue transit pass card.',
      images: [
        'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
      ],
      locationDescription: 'Central Metro Station platform 2 or nearby coffee kiosk',
      incidentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      incidentTime: '08:45 AM',
      status: 'lost',
      custodyDetails: 'not_applicable',
      history: [
        {
          fromStatus: null,
          toStatus: 'lost',
          changedBy: userJohn._id,
          note: 'Reported lost',
        },
      ],
    });

    // Found Wallet (Sarah) — Great potential match for John's lost wallet!
    const foundWallet = await Item.create({
      owner: userSarah._id,
      type: 'found',
      title: 'Black Leather Bifold Wallet Found at Metro',
      category: 'Wallets and purses',
      description: 'Found a black leather wallet sitting on a bench near Central Metro Station train platform.',
      brand: 'Bellroy',
      color: 'Black',
      distinguishingFeatures: 'Has a blue card visible in card slot.',
      images: [
        'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
      ],
      locationDescription: 'Central Metro Station Platform bench',
      incidentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      incidentTime: '09:10 AM',
      status: 'found',
      custodyDetails: 'still_with_finder',
      custodyNotes: 'Safely kept in finder personal possession until verified owner reaches out.',
      history: [
        {
          fromStatus: null,
          toStatus: 'found',
          changedBy: userSarah._id,
          note: 'Found item report filed',
        },
      ],
    });

    // Lost Laptop (Mike)
    const lostLaptop = await Item.create({
      owner: userMike._id,
      type: 'lost',
      title: 'Space Grey Apple MacBook Pro 14 inch',
      category: 'Electronics',
      description: 'Accidentally left my MacBook Pro laptop in the Main University Library 2nd floor study area.',
      brand: 'Apple',
      color: 'Space Grey',
      distinguishingFeatures: 'Distinctive React and GitHub octocat stickers on the back cover.',
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
      ],
      locationDescription: 'University Main Library, 2nd floor quiet room',
      incidentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      incidentTime: '04:30 PM',
      status: 'lost',
      custodyDetails: 'not_applicable',
      history: [
        {
          fromStatus: null,
          toStatus: 'lost',
          changedBy: userMike._id,
          note: 'Lost report submitted',
        },
      ],
    });

    // Found Laptop (Admin / Security)
    const foundLaptop = await Item.create({
      owner: adminUser._id,
      type: 'found',
      title: 'Apple MacBook Pro Laptop turned into Security Desk',
      category: 'Electronics',
      description: 'A space grey Apple MacBook Pro laptop was turned into the library front reception desk.',
      brand: 'Apple',
      color: 'Space Grey',
      distinguishingFeatures: 'Stickers on outer lid.',
      images: [
        'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80',
      ],
      locationDescription: 'University Main Library Security Desk',
      incidentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      incidentTime: '05:00 PM',
      status: 'found',
      custodyDetails: 'reception_or_security',
      custodyNotes: 'Stored at Building A Security Desk, Room 102.',
      history: [
        {
          fromStatus: null,
          toStatus: 'found',
          changedBy: adminUser._id,
          note: 'Logged by security',
        },
      ],
    });

    // Lost Keys (Sarah)
    await Item.create({
      owner: userSarah._id,
      type: 'lost',
      title: 'Toyota Car Key Fob with Red Lanyard',
      category: 'Keys',
      description: 'Lost a Toyota electronic smart key fob with house keys on a bright red sports lanyard.',
      brand: 'Toyota',
      color: 'Black with Red lanyard',
      distinguishingFeatures: 'Small silver gym membership barcode tag attached.',
      images: [
        'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
      ],
      locationDescription: 'Riverside Community Park jogging trail',
      incidentDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      incidentTime: '07:15 AM',
      status: 'lost',
      custodyDetails: 'not_applicable',
      history: [
        {
          fromStatus: null,
          toStatus: 'lost',
          changedBy: userSarah._id,
          note: 'Filed lost key report',
        },
      ],
    });

    // Found Headphones (John)
    await Item.create({
      owner: userJohn._id,
      type: 'found',
      title: 'Sony WH-1000XM4 Wireless Headphones in Case',
      category: 'Electronics',
      description: 'Found black over-ear Sony noise-canceling headphones in their grey zippered travel case.',
      brand: 'Sony',
      color: 'Black',
      distinguishingFeatures: 'Audio cable and airplane adapter included in mesh pouch inside case.',
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      ],
      locationDescription: 'Downtown Bean & Leaf Coffeehouse corner booth',
      incidentDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      incidentTime: '02:00 PM',
      status: 'found',
      custodyDetails: 'still_with_finder',
      custodyNotes: 'With finder, ready to return upon matching proof.',
      history: [
        {
          fromStatus: null,
          toStatus: 'found',
          changedBy: userJohn._id,
          note: 'Found report filed',
        },
      ],
    });

    console.log('[Seed] Items created.');

    // 3. Create Sample Claim: John claims Sarah's found wallet
    const sampleClaim = await Claim.create({
      item: foundWallet._id,
      claimant: userJohn._id,
      explanation:
        'This is my Bellroy wallet that I lost Monday morning at Central Station. The blue card inside is my city transit card registered under John Reynolds.',
      secretIdentifiers: 'Driver license ending in 8492, small paper loyalty card inside receipt pocket.',
      status: 'pending',
    });

    // 4. Create Notifications
    await Notification.create({
      recipient: userSarah._id,
      type: 'new_claim',
      title: `New Ownership Claim on "${foundWallet.title}"`,
      message: `${userJohn.name} submitted an ownership claim with identifying details for your review.`,
      relatedItem: foundWallet._id,
      relatedClaim: sampleClaim._id,
      isRead: false,
    });

    await Notification.create({
      recipient: userJohn._id,
      type: 'potential_match',
      title: `High Confidence Match Found!`,
      message: `A found report "${foundWallet.title}" closely matches your lost wallet report (85% match score).`,
      relatedItem: foundWallet._id,
      isRead: false,
    });

    // 5. Create Sample Contact Conversation
    await Conversation.create({
      participants: [userJohn._id, userSarah._id],
      initiator: userJohn._id,
      relatedItem: foundWallet._id,
      status: 'accepted',
      subject: 'Regarding found Bellroy wallet at Central Station',
      messages: [
        {
          sender: userJohn._id,
          text: 'Hi Sarah, thank you so much for reporting this! I believe this is my lost wallet.',
          timestamp: new Date(Date.now() - 3600 * 1000),
          isRead: true,
        },
        {
          sender: userSarah._id,
          text: 'Hi John! I saw your claim. Could you verify what transit card name is on it so we can coordinate a safe handover?',
          timestamp: new Date(Date.now() - 1800 * 1000),
          isRead: false,
        },
      ],
      lastMessageAt: new Date(Date.now() - 1800 * 1000),
    });

    console.log('[Seed] Sample claim, notifications, and conversation seeded successfully.');
    console.log('[Seed] Complete! Exiting...');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedDatabase();
