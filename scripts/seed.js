/**
 * SEED SCRIPT — Run this to add sample data to your database
 * Usage: node scripts/seed.js
 * 
 * Make sure to set MONGODB_URI in .env.local before running
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

// Define schemas inline for the script
const ProductSchema = new mongoose.Schema({
  name: String, description: String, pricePerUnit: Number, unit: String,
  minOrderQty: Number, maxOrderQty: Number, imageUrl: String, category: String,
  specifications: Object, isAvailable: Boolean, isFeatured: Boolean, sortOrder: Number,
}, { timestamps: true });

const LocationSchema = new mongoose.Schema({
  name: String, district: String, state: String,
  isFixedPrice: Boolean, fixedTransportPrice: Number, distanceKm: Number, isActive: Boolean,
}, { timestamps: true });

const SettingsSchema = new mongoose.Schema({
  key: { type: String, unique: true }, value: mongoose.Schema.Types.Mixed,
  label: String, type: String,
});

const SAMPLE_PRODUCTS = [
  {
    name: 'Standard Cement Brick',
    description: 'Our most popular all-purpose cement brick. Perfect for load-bearing walls, boundary walls, and general construction.',
    pricePerUnit: 8,
    unit: 'piece',
    category: 'Standard',
    minOrderQty: 500,
    maxOrderQty: 100000,
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    isFeatured: true,
    isAvailable: true,
    sortOrder: 1,
    specifications: { 'Size': '230×110×76 mm', 'Weight': '3.5 kg', 'Compressive Strength': '35 MPa', 'Water Absorption': '<15%' },
  },
  {
    name: 'Hollow Cement Block',
    description: 'Lightweight hollow blocks ideal for partition walls and non-load-bearing structures. Excellent thermal insulation.',
    pricePerUnit: 45,
    unit: 'piece',
    category: 'Hollow Block',
    minOrderQty: 100,
    maxOrderQty: 50000,
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
    isFeatured: true,
    isAvailable: true,
    sortOrder: 2,
    specifications: { 'Size': '400×200×200 mm', 'Weight': '8 kg', 'Type': '2-hole hollow', 'Compressive Strength': '5 MPa' },
  },
  {
    name: 'Fly Ash Brick',
    description: 'Eco-friendly bricks made with fly ash. Superior strength, lower water absorption, and environmentally responsible.',
    pricePerUnit: 10,
    unit: 'piece',
    category: 'Eco Friendly',
    minOrderQty: 500,
    maxOrderQty: 100000,
    imageUrl: 'https://images.unsplash.com/photo-1590274853856-f22d5ee3d228?w=400',
    isFeatured: false,
    isAvailable: true,
    sortOrder: 3,
    specifications: { 'Size': '230×110×76 mm', 'Weight': '2.9 kg', 'Strength': '75 kg/cm²', 'Eco Rating': 'Green Certified' },
  },
  {
    name: 'Paver Block (Interlocking)',
    description: 'Durable interlocking paver blocks for driveways, pathways, and outdoor flooring. Available in natural grey finish.',
    pricePerUnit: 25,
    unit: 'piece',
    category: 'Paver Blocks',
    minOrderQty: 200,
    maxOrderQty: 50000,
    imageUrl: 'https://images.unsplash.com/photo-1621193793262-4127d9855c91?w=400',
    isFeatured: false,
    isAvailable: true,
    sortOrder: 4,
    specifications: { 'Size': '200×100×60 mm', 'Thickness': '60 mm', 'Load Capacity': '400 T/m²', 'Finish': 'Natural Grey' },
  },
];

const SAMPLE_LOCATIONS = [
  { name: 'Chittoor', district: 'Chittoor', state: 'Andhra Pradesh', isFixedPrice: true, fixedTransportPrice: 0, isActive: true },
  { name: 'Tirupati', district: 'Tirupati', state: 'Andhra Pradesh', isFixedPrice: true, fixedTransportPrice: 800, distanceKm: 25, isActive: true },
  { name: 'Madanapalle', district: 'Chittoor', state: 'Andhra Pradesh', isFixedPrice: true, fixedTransportPrice: 1200, distanceKm: 60, isActive: true },
  { name: 'Kuppam', district: 'Chittoor', state: 'Andhra Pradesh', isFixedPrice: true, fixedTransportPrice: 1000, distanceKm: 45, isActive: true },
  { name: 'Vellore', district: 'Vellore', state: 'Tamil Nadu', isFixedPrice: true, fixedTransportPrice: 1500, distanceKm: 80, isActive: true },
  { name: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', isFixedPrice: true, fixedTransportPrice: 3500, distanceKm: 140, isActive: true },
  { name: 'Bangalore', district: 'Bengaluru Urban', state: 'Karnataka', isFixedPrice: true, fixedTransportPrice: 4000, distanceKm: 160, isActive: true },
  { name: 'Nellore', district: 'Nellore', state: 'Andhra Pradesh', isFixedPrice: false, distanceKm: 200, isActive: true },
];

const DEFAULT_SETTINGS = [
  { key: 'companyName', value: 'KRISHNATEJA BRICKS', label: 'Company Name', type: 'string' },
  { key: 'companyPhone', value: '+91 93908 50349', label: 'Company Phone', type: 'string' },
  { key: 'companyAddress', value: 'pedha Bommajugunta, nemelur, gummidipoondi tk, tiruvalur district, Tamil Nadu', label: 'Company Address', type: 'string' },
  { key: 'companyEmail', value: 'krishnatejareddy2003@gmail.com', label: 'Company Contact Email', type: 'string' },
  { key: 'logoUrl', value: '', label: 'Company Logo Image (Base64)', type: 'string' },
  { key: 'baseTransportPrice', value: 500, label: 'Base Transport Price (₹)', type: 'number' },
  { key: 'pricePerKm', value: 25, label: 'Price Per KM (₹)', type: 'number' },
  { key: 'labourPricePerDay', value: 800, label: 'Labour Price Per Day (₹)', type: 'number' },
  { key: 'labourBricksPerDay', value: 1000, label: 'Bricks Per Labour Per Day', type: 'number' },
  { key: 'advancePercentage', value: 30, label: 'Minimum Advance Payment (%)', type: 'number' },
  { key: 'upiId', value: '9390850349@upi', label: 'UPI ID', type: 'string' },
  { key: 'upiName', value: 'G.Krishna Teja', label: 'UPI Name', type: 'string' },
  { key: 'announcementBanner', value: '🧱 KRISHNATEJA BRICKS | Premium Cement Bricks | Call G.Krishna Teja at +91 93908 50349', label: 'Announcement Banner', type: 'string' },
  { key: 'minOrderQty', value: 100, label: 'Min Order Qty', type: 'number' },
  { key: 'gstPercentage', value: 0, label: 'GST %', type: 'number' },
];

async function seed() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected!');

  const Product = mongoose.model('Product', ProductSchema);
  const Location = mongoose.model('Location', LocationSchema);
  const Settings = mongoose.model('Settings', SettingsSchema);

  // Clear existing
  await Product.deleteMany({});
  await Location.deleteMany({});
  await Settings.deleteMany({});

  // Insert
  await Product.insertMany(SAMPLE_PRODUCTS);
  console.log(`✅ Inserted ${SAMPLE_PRODUCTS.length} products`);

  await Location.insertMany(SAMPLE_LOCATIONS);
  console.log(`✅ Inserted ${SAMPLE_LOCATIONS.length} locations`);

  await Settings.insertMany(DEFAULT_SETTINGS);
  console.log(`✅ Inserted ${DEFAULT_SETTINGS.length} settings`);

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Summary:');
  console.log('   Products:', SAMPLE_PRODUCTS.map(p => p.name).join(', '));
  console.log('   Locations:', SAMPLE_LOCATIONS.map(l => l.name).join(', '));
  console.log('\n🔐 Admin Login:');
  console.log('   Email:', process.env.ADMIN_EMAIL);
  console.log('   Password:', process.env.ADMIN_PASSWORD);
  console.log('\n🌐 Start the app: npm run dev');
  console.log('   Admin panel: http://localhost:3000/admin');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
