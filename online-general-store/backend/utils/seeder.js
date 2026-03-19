const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const connectDB = require('../config/db');

const bcrypt = require('bcryptjs');

const users = [
  { name: 'Admin User',    email: 'admin@store.com',   password: 'admin123', role: 'admin'    },
  { name: 'John Customer', email: 'john@example.com',  password: 'john123',  role: 'customer' },
];

const products = [
  // ── Groceries ──────────────────────────────────────────────────────────────
  {
    name: 'Basmati Rice 5kg',
    description: 'Premium long-grain basmati rice with a rich aroma. Perfect for biryani and pulao.',
    price: 450,
    category: 'Groceries',
    stock: 120,
    isFeatured: true,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80',
  },
  {
    name: 'Wheat Flour (Atta) 10kg',
    description: 'Whole wheat flour milled from premium wheat. Ideal for rotis and parathas.',
    price: 380,
    category: 'Groceries',
    stock: 90,
    isFeatured: false,
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80',
  },
  {
    name: 'Toor Dal 1kg',
    description: 'High-quality split pigeon peas. Rich in protein and essential nutrients.',
    price: 120,
    category: 'Groceries',
    stock: 80,
    isFeatured: false,
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80',
  },
  {
    name: 'Cooking Oil 1 Litre',
    description: 'Refined sunflower cooking oil. Light, healthy and ideal for everyday cooking.',
    price: 120,
    category: 'Groceries',
    stock: 100,
    isFeatured: true,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80',
  },
  {
    name: 'Sugar 1kg',
    description: 'Pure refined white sugar. Perfect for tea, sweets and baking.',
    price: 45,
    category: 'Groceries',
    stock: 150,
    isFeatured: false,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  },
  {
    name: 'Salt 1kg',
    description: 'Iodized table salt. Essential mineral for everyday cooking.',
    price: 20,
    category: 'Groceries',
    stock: 200,
    isFeatured: false,
    image: 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=400&q=80',
  },

  // ── Dairy ──────────────────────────────────────────────────────────────────
  {
    name: 'Fresh Milk 1 Litre',
    description: 'Farm-fresh full-cream milk. Rich in calcium and vitamins.',
    price: 30,
    category: 'Dairy',
    stock: 60,
    isFeatured: true,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80',
  },
  {
    name: 'Amul Butter 500g',
    description: 'Creamy pasteurized butter made from fresh cream. Great on toast and in cooking.',
    price: 250,
    category: 'Dairy',
    stock: 45,
    isFeatured: false,
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80',
  },
  {
    name: 'Paneer 200g',
    description: 'Fresh cottage cheese made from whole milk. Soft, creamy and protein-rich.',
    price: 80,
    category: 'Dairy',
    stock: 35,
    isFeatured: false,
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80',
  },
  {
    name: 'Curd 500g',
    description: 'Thick and creamy set curd. Probiotic-rich and great with meals.',
    price: 40,
    category: 'Dairy',
    stock: 50,
    isFeatured: false,
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80',
  },

  // ── Snacks ─────────────────────────────────────────────────────────────────
  {
    name: "Lay's Classic Chips 100g",
    description: 'Crispy salted potato chips. The perfect snack for any time of day.',
    price: 30,
    category: 'Snacks',
    stock: 200,
    isFeatured: true,
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80',
  },
  {
    name: 'Maggi Noodles 12-Pack',
    description: '2-minute instant noodles. Quick, tasty and loved by all ages.',
    price: 180,
    category: 'Snacks',
    stock: 120,
    isFeatured: true,
    image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&q=80',
  },
  {
    name: 'Parle-G Biscuits 800g',
    description: 'Classic glucose biscuits. A timeless Indian snack enjoyed with tea.',
    price: 50,
    category: 'Snacks',
    stock: 180,
    isFeatured: false,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80',
  },
  {
    name: 'Mixed Dry Fruits 250g',
    description: 'Premium mix of cashews, almonds, raisins and pistachios.',
    price: 220,
    category: 'Snacks',
    stock: 60,
    isFeatured: false,
    image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400&q=80',
  },

  // ── Beverages ──────────────────────────────────────────────────────────────
  {
    name: 'Coca-Cola 2 Litre',
    description: 'Refreshing carbonated soft drink. Best served chilled.',
    price: 90,
    category: 'Beverages',
    stock: 150,
    isFeatured: false,
    image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&q=80',
  },
  {
    name: 'Tata Tea Premium 500g',
    description: 'Strong and aromatic CTC tea. Perfect for a refreshing cup every morning.',
    price: 220,
    category: 'Beverages',
    stock: 80,
    isFeatured: true,
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80',
  },
  {
    name: 'Tropicana Orange Juice 1L',
    description: '100% pure orange juice with no added sugar. Rich in Vitamin C.',
    price: 110,
    category: 'Beverages',
    stock: 70,
    isFeatured: false,
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80',
  },

  // ── Bakery ─────────────────────────────────────────────────────────────────
  {
    name: 'Britannia Bread 400g',
    description: 'Soft and fresh sandwich bread. Made with whole wheat for added nutrition.',
    price: 45,
    category: 'Bakery',
    stock: 40,
    isFeatured: true,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
  },
  {
    name: 'Croissant 4-Pack',
    description: 'Buttery, flaky croissants baked fresh. Great for breakfast.',
    price: 80,
    category: 'Bakery',
    stock: 25,
    isFeatured: false,
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80',
  },

  // ── Personal Care ──────────────────────────────────────────────────────────
  {
    name: 'Dove Soap 3-Pack',
    description: 'Moisturizing beauty bar with ¼ cream. Leaves skin soft and smooth.',
    price: 180,
    category: 'Personal Care',
    stock: 60,
    isFeatured: true,
    image: 'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=400&q=80',
  },
  {
    name: 'Colgate Toothpaste 200g',
    description: 'Strong teeth protection with fluoride. Fights cavities and freshens breath.',
    price: 85,
    category: 'Personal Care',
    stock: 90,
    isFeatured: false,
    image: 'https://images.unsplash.com/photo-1559591937-abc3f3b9b9e4?w=400&q=80',
  },

  // ── Household ──────────────────────────────────────────────────────────────
  {
    name: 'Surf Excel 2kg',
    description: 'Powerful washing powder that removes tough stains in one wash.',
    price: 320,
    category: 'Household',
    stock: 5,
    isFeatured: false,
    image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&q=80',
  },
  {
    name: 'Vim Dishwash Bar 200g',
    description: 'Effective dishwash bar that cuts through grease and leaves dishes sparkling.',
    price: 30,
    category: 'Household',
    stock: 110,
    isFeatured: false,
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80',
  },
];

const seedDB = async () => {
  await connectDB();

  await Order.deleteMany();
  await Product.deleteMany();
  await User.deleteMany();

  // Hash passwords manually since insertMany skips pre('save') hooks
  const hashedUsers = await Promise.all(
    users.map(async (u) => ({
      ...u,
      password: await bcrypt.hash(u.password, 12),
    }))
  );

  await User.insertMany(hashedUsers);
  console.log(`✅ ${users.length} users seeded`);

  await Product.insertMany(products);
  console.log(`✅ ${products.length} products seeded`);

  console.log('\n🔑 Admin credentials:');
  console.log('   Email   : admin@store.com');
  console.log('   Password: admin123\n');

  process.exit(0);
};

seedDB().catch((err) => { console.error(err); process.exit(1); });
