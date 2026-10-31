import mongoose from 'mongoose';

export const ensurePermanentAdmin = async () => {
  try {
    const adminEmail = 'ayush108ayush108@gmail.com';
    const User = (await import('../models/User.js')).default;

    // Strict single-admin policy: Demote any other unauthorized accounts back to 'user'
    await User.updateMany(
      {
        email: { $ne: adminEmail },
        role: 'admin',
      },
      {
        $set: { role: 'user' },
      }
    );

    let admin = await User.findOne({ email: adminEmail }).select('+password');
    if (!admin) {
      admin = new User({
        name: 'Ayush Admin',
        email: adminEmail,
        password: '1234qwer',
        role: 'admin',
        accountStatus: 'active',
        emailVerified: true,
      });
      await admin.save();
      console.log(`[Admin] Permanent admin created: ${adminEmail}`);
    } else {
      let needsSave = false;
      const matchesPassword = await admin.comparePassword('1234qwer');
      if (!matchesPassword) {
        admin.password = '1234qwer';
        needsSave = true;
      }
      if (admin.role !== 'admin') {
        admin.role = 'admin';
        needsSave = true;
      }
      if (admin.accountStatus !== 'active') {
        admin.accountStatus = 'active';
        needsSave = true;
      }
      if (needsSave) {
        await admin.save();
        console.log(`[Admin] Permanent admin credentials secured: ${adminEmail}`);
      }
    }
  } catch (err) {
    console.error('[Admin Init Warning]', err.message);
  }
};

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lost_and_found';
    const conn = await mongoose.connect(uri, {
      dbName: process.env.DB_NAME || 'lost_and_found',
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host} (DB: ${conn.connection.name})`);
    await ensurePermanentAdmin();
  } catch (error) {
    console.error(`[Database Error] ${error.message}`);
    process.exit(1);
  }
};
