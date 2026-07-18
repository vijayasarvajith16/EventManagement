/**
 * Seed script — creates default admin account
 * Run: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');
const connectDB = require('./config/db');

const seedAdmin = async () => {
  await connectDB();

  const existingAdmin = await Student.findOne({ email: 'admin@csea.com' });
  if (existingAdmin) {
    console.log('ℹ️  Admin account already exists. Skipping seed.');
    process.exit(0);
  }

  const admin = await Student.create({
    name: 'CSEA Admin',
    email: 'admin@csea.com',
    password: 'Admin@123',
    rollNumber: 'ADMIN001',
    department: 'CSE',
    year: 4,
    role: 'admin',
  });

  console.log(`✅ Admin seeded successfully!`);
  console.log(`   Email    : admin@csea.com`);
  console.log(`   Password : Admin@123`);
  console.log(`   Role     : ${admin.role}`);
  process.exit(0);
};

seedAdmin().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
