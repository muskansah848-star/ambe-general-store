const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const connectDB = require('./config/db');
connectDB().then(() => autoSeed());

const app = express();
const server = http.createServer(app);

// -------- CORS Setup --------
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
    if (/^http:\/\/(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)\d+\.\d+:\d+$/.test(origin)) return callback(null, true);
    if (/\.(netlify\.app|vercel\.app|onrender\.com)$/.test(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------- Socket.io Setup --------
const io = new Server(server, { cors: corsOptions });
app.set('io', io);

io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  socket.on('disconnect', () => console.log('🔌 Client disconnected:', socket.id));
});

// -------- Auto Seed on startup --------
async function autoSeed() {
  try {
    const Product = require('./models/Product');
    const User = require('./models/User');

    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const products = [
        { name: 'Basmati Rice 5kg', category: 'Groceries', price: 450, stock: 120, isFeatured: true, description: 'Premium long-grain basmati rice with rich aroma.', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80' },
        { name: 'Wheat Flour (Atta) 10kg', category: 'Groceries', price: 380, stock: 90, isFeatured: false, description: 'Whole wheat flour milled from premium wheat.', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80' },
        { name: 'Toor Dal 1kg', category: 'Groceries', price: 120, stock: 80, isFeatured: false, description: 'High-quality split pigeon peas.', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80' },
        { name: 'Sunflower Cooking Oil 1L', category: 'Groceries', price: 120, stock: 100, isFeatured: true, description: 'Refined sunflower oil.', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80' },
        { name: 'Sugar 1kg', category: 'Groceries', price: 45, stock: 150, isFeatured: false, description: 'Pure refined white sugar.', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },
        { name: 'Turmeric Powder 200g', category: 'Groceries', price: 55, stock: 110, isFeatured: false, description: 'Pure ground turmeric.', image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&q=80' },
        { name: 'Red Chilli Powder 200g', category: 'Groceries', price: 60, stock: 95, isFeatured: false, description: 'Finely ground red chilli powder.', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80' },
        { name: 'Mustard Oil 1L', category: 'Groceries', price: 140, stock: 60, isFeatured: false, description: 'Cold-pressed mustard oil.', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80' },
        { name: 'Fresh Full-Cream Milk 1L', category: 'Dairy', price: 30, stock: 60, isFeatured: true, description: 'Farm-fresh full-cream milk.', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80' },
        { name: 'Paneer 200g', category: 'Dairy', price: 80, stock: 35, isFeatured: true, description: 'Fresh cottage cheese.', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80' },
        { name: 'Ghee 500ml', category: 'Dairy', price: 320, stock: 55, isFeatured: true, description: 'Pure cow ghee.', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80' },
        { name: 'Amul Butter 500g', category: 'Dairy', price: 250, stock: 45, isFeatured: false, description: 'Creamy pasteurized butter.', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80' },
        { name: 'Set Curd 500g', category: 'Dairy', price: 40, stock: 50, isFeatured: false, description: 'Thick and creamy set curd.', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80' },
        { name: "Lay's Classic Chips 100g", category: 'Snacks', price: 30, stock: 200, isFeatured: true, description: 'Crispy salted potato chips.', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80' },
        { name: 'Maggi Noodles 12-Pack', category: 'Snacks', price: 180, stock: 120, isFeatured: true, description: '2-minute instant noodles.', image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&q=80' },
        { name: 'Parle-G Biscuits 800g', category: 'Snacks', price: 50, stock: 180, isFeatured: false, description: 'Classic glucose biscuits.', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80' },
        { name: 'Haldiram Bhujia 400g', category: 'Snacks', price: 130, stock: 90, isFeatured: true, description: 'Crispy and spicy namkeen.', image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400&q=80' },
        { name: 'Dark Chocolate Bar 100g', category: 'Snacks', price: 150, stock: 70, isFeatured: false, description: '70% dark chocolate.', image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400&q=80' },
        { name: 'Mixed Dry Fruits 250g', category: 'Snacks', price: 220, stock: 60, isFeatured: false, description: 'Premium mix of cashews and almonds.', image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400&q=80' },
        { name: 'Coca-Cola 2 Litre', category: 'Beverages', price: 90, stock: 150, isFeatured: false, description: 'Refreshing carbonated drink.', image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&q=80' },
        { name: 'Tata Tea Premium 500g', category: 'Beverages', price: 220, stock: 80, isFeatured: true, description: 'Strong and aromatic CTC tea.', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80' },
        { name: 'Nescafe Classic Coffee 100g', category: 'Beverages', price: 280, stock: 65, isFeatured: true, description: 'Rich instant coffee.', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80' },
        { name: 'Tropicana Orange Juice 1L', category: 'Beverages', price: 110, stock: 70, isFeatured: false, description: '100% pure orange juice.', image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80' },
        { name: 'Bournvita 500g', category: 'Beverages', price: 230, stock: 75, isFeatured: false, description: 'Chocolate malt drink.', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80' },
        { name: 'Britannia Whole Wheat Bread', category: 'Bakery', price: 45, stock: 40, isFeatured: true, description: 'Soft sandwich bread.', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80' },
        { name: 'Butter Croissant 4-Pack', category: 'Bakery', price: 80, stock: 25, isFeatured: false, description: 'Buttery flaky croissants.', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80' },
        { name: 'Chocolate Muffin 2-Pack', category: 'Bakery', price: 60, stock: 30, isFeatured: false, description: 'Moist chocolate muffins.', image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&q=80' },
        { name: 'Rusk Toast 300g', category: 'Bakery', price: 40, stock: 70, isFeatured: false, description: 'Crispy double-baked rusk.', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80' },
        { name: 'Dove Moisturizing Soap 3-Pack', category: 'Personal Care', price: 180, stock: 60, isFeatured: true, description: 'Moisturizing beauty bar.', image: 'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=400&q=80' },
        { name: 'Colgate Strong Teeth 200g', category: 'Personal Care', price: 85, stock: 90, isFeatured: false, description: 'Fluoride toothpaste.', image: 'https://images.unsplash.com/photo-1559591937-abc3f3b9b9e4?w=400&q=80' },
        { name: 'Head & Shoulders Shampoo 340ml', category: 'Personal Care', price: 220, stock: 55, isFeatured: true, description: 'Anti-dandruff shampoo.', image: 'https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=400&q=80' },
        { name: 'Dettol Hand Wash 250ml', category: 'Personal Care', price: 95, stock: 100, isFeatured: false, description: 'Antibacterial hand wash.', image: 'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=400&q=80' },
        { name: 'Nivea Body Lotion 400ml', category: 'Personal Care', price: 260, stock: 45, isFeatured: false, description: 'Deep moisturizing lotion.', image: 'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=400&q=80' },
        { name: 'Surf Excel Washing Powder 2kg', category: 'Household', price: 320, stock: 50, isFeatured: false, description: 'Powerful washing powder.', image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&q=80' },
        { name: 'Vim Dishwash Bar 200g', category: 'Household', price: 30, stock: 110, isFeatured: false, description: 'Effective dishwash bar.', image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80' },
        { name: 'Colin Glass Cleaner 500ml', category: 'Household', price: 110, stock: 60, isFeatured: false, description: 'Streak-free glass cleaner.', image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80' },
        { name: 'Ariel Liquid Detergent 1L', category: 'Household', price: 280, stock: 50, isFeatured: true, description: 'Concentrated liquid detergent.', image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&q=80' },
        { name: 'Garbage Bags 30-Pack', category: 'Household', price: 80, stock: 120, isFeatured: false, description: 'Strong garbage bags.', image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80' },
        { name: 'AAA Batteries 4-Pack', category: 'Other', price: 80, stock: 100, isFeatured: false, description: 'Long-lasting alkaline batteries.', image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&q=80' },
        { name: 'Candles 12-Pack', category: 'Other', price: 60, stock: 80, isFeatured: false, description: 'White wax candles.', image: 'https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=400&q=80' },
        { name: 'Aluminium Foil 10m Roll', category: 'Other', price: 75, stock: 65, isFeatured: false, description: 'Heavy-duty aluminium foil.', image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80' },
      ];
      await Product.insertMany(products);
      console.log(`✅ Auto-seeded ${products.length} products with images`);
    }

    const adminExists = await User.findOne({ email: 'admin@store.com' });
    if (!adminExists) {
      await User.create({ name: 'Admin User', email: 'admin@store.com', password: 'admin123', role: 'admin' });
      console.log('✅ Auto-seeded admin user: admin@store.com / admin123');
    }
  } catch (err) {
    console.error('Auto-seed error:', err.message);
  }
}

// -------- Uploads Folder --------
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true });
app.use('/uploads', express.static(uploadsPath));

// -------- Routes --------
// One-time seed route — creates admin user if not exists
app.get('/api/seed-admin', async (req, res) => {
  try {
    const User = require('./models/User');
    const exists = await User.findOne({ email: 'admin@store.com' });
    if (exists) return res.json({ message: 'Admin already exists', email: 'admin@store.com' });
    await User.create({ name: 'Admin User', email: 'admin@store.com', password: 'admin123', role: 'admin' });
    res.json({ message: '✅ Admin created', email: 'admin@store.com', password: 'admin123' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// One-time seed route — seeds all products with images
app.get('/api/seed-products', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const count = await Product.countDocuments();
    if (count > 0) return res.json({ message: `Products already exist: ${count} products in database` });

    const products = [
      { name: 'Basmati Rice 5kg', category: 'Groceries', price: 450, stock: 120, isFeatured: true, description: 'Premium long-grain basmati rice with rich aroma.', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80' },
      { name: 'Wheat Flour (Atta) 10kg', category: 'Groceries', price: 380, stock: 90, isFeatured: false, description: 'Whole wheat flour milled from premium wheat.', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80' },
      { name: 'Toor Dal 1kg', category: 'Groceries', price: 120, stock: 80, isFeatured: false, description: 'High-quality split pigeon peas. Rich in protein.', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80' },
      { name: 'Sunflower Cooking Oil 1L', category: 'Groceries', price: 120, stock: 100, isFeatured: true, description: 'Refined sunflower oil. Light and healthy.', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80' },
      { name: 'Sugar 1kg', category: 'Groceries', price: 45, stock: 150, isFeatured: false, description: 'Pure refined white sugar.', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },
      { name: 'Turmeric Powder 200g', category: 'Groceries', price: 55, stock: 110, isFeatured: false, description: 'Pure ground turmeric with high curcumin content.', image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&q=80' },
      { name: 'Red Chilli Powder 200g', category: 'Groceries', price: 60, stock: 95, isFeatured: false, description: 'Finely ground red chilli powder.', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80' },
      { name: 'Mustard Oil 1L', category: 'Groceries', price: 140, stock: 60, isFeatured: false, description: 'Cold-pressed mustard oil.', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80' },
      { name: 'Fresh Full-Cream Milk 1L', category: 'Dairy', price: 30, stock: 60, isFeatured: true, description: 'Farm-fresh full-cream milk.', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80' },
      { name: 'Paneer 200g', category: 'Dairy', price: 80, stock: 35, isFeatured: true, description: 'Fresh cottage cheese made from whole milk.', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80' },
      { name: 'Ghee 500ml', category: 'Dairy', price: 320, stock: 55, isFeatured: true, description: 'Pure cow ghee with rich golden colour.', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80' },
      { name: 'Amul Butter 500g', category: 'Dairy', price: 250, stock: 45, isFeatured: false, description: 'Creamy pasteurized butter.', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80' },
      { name: 'Set Curd 500g', category: 'Dairy', price: 40, stock: 50, isFeatured: false, description: 'Thick and creamy set curd.', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80' },
      { name: "Lay's Classic Chips 100g", category: 'Snacks', price: 30, stock: 200, isFeatured: true, description: 'Crispy salted potato chips.', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80' },
      { name: 'Maggi Noodles 12-Pack', category: 'Snacks', price: 180, stock: 120, isFeatured: true, description: '2-minute instant noodles.', image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&q=80' },
      { name: 'Parle-G Biscuits 800g', category: 'Snacks', price: 50, stock: 180, isFeatured: false, description: 'Classic glucose biscuits.', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80' },
      { name: 'Haldiram Bhujia 400g', category: 'Snacks', price: 130, stock: 90, isFeatured: true, description: 'Crispy and spicy moth bean noodles.', image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400&q=80' },
      { name: 'Dark Chocolate Bar 100g', category: 'Snacks', price: 150, stock: 70, isFeatured: false, description: '70% dark chocolate with rich cocoa flavour.', image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400&q=80' },
      { name: 'Mixed Dry Fruits 250g', category: 'Snacks', price: 220, stock: 60, isFeatured: false, description: 'Premium mix of cashews, almonds, raisins.', image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400&q=80' },
      { name: 'Coca-Cola 2 Litre', category: 'Beverages', price: 90, stock: 150, isFeatured: false, description: 'Refreshing carbonated soft drink.', image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&q=80' },
      { name: 'Tata Tea Premium 500g', category: 'Beverages', price: 220, stock: 80, isFeatured: true, description: 'Strong and aromatic CTC tea.', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80' },
      { name: 'Nescafe Classic Coffee 100g', category: 'Beverages', price: 280, stock: 65, isFeatured: true, description: 'Rich and aromatic instant coffee.', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80' },
      { name: 'Tropicana Orange Juice 1L', category: 'Beverages', price: 110, stock: 70, isFeatured: false, description: '100% pure orange juice.', image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80' },
      { name: 'Bournvita 500g', category: 'Beverages', price: 230, stock: 75, isFeatured: false, description: 'Chocolate malt drink mix.', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80' },
      { name: 'Britannia Whole Wheat Bread', category: 'Bakery', price: 45, stock: 40, isFeatured: true, description: 'Soft and fresh sandwich bread.', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80' },
      { name: 'Butter Croissant 4-Pack', category: 'Bakery', price: 80, stock: 25, isFeatured: false, description: 'Buttery, flaky croissants.', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80' },
      { name: 'Chocolate Muffin 2-Pack', category: 'Bakery', price: 60, stock: 30, isFeatured: false, description: 'Moist chocolate muffins.', image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&q=80' },
      { name: 'Rusk Toast 300g', category: 'Bakery', price: 40, stock: 70, isFeatured: false, description: 'Crispy double-baked rusk.', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80' },
      { name: 'Dove Moisturizing Soap 3-Pack', category: 'Personal Care', price: 180, stock: 60, isFeatured: true, description: 'Moisturizing beauty bar.', image: 'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=400&q=80' },
      { name: 'Colgate Strong Teeth 200g', category: 'Personal Care', price: 85, stock: 90, isFeatured: false, description: 'Strong teeth protection with fluoride.', image: 'https://images.unsplash.com/photo-1559591937-abc3f3b9b9e4?w=400&q=80' },
      { name: 'Head & Shoulders Shampoo 340ml', category: 'Personal Care', price: 220, stock: 55, isFeatured: true, description: 'Anti-dandruff shampoo.', image: 'https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=400&q=80' },
      { name: 'Dettol Hand Wash 250ml', category: 'Personal Care', price: 95, stock: 100, isFeatured: false, description: 'Antibacterial hand wash.', image: 'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=400&q=80' },
      { name: 'Nivea Body Lotion 400ml', category: 'Personal Care', price: 260, stock: 45, isFeatured: false, description: 'Deep moisturizing body lotion.', image: 'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=400&q=80' },
      { name: 'Surf Excel Washing Powder 2kg', category: 'Household', price: 320, stock: 50, isFeatured: false, description: 'Powerful washing powder.', image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&q=80' },
      { name: 'Vim Dishwash Bar 200g', category: 'Household', price: 30, stock: 110, isFeatured: false, description: 'Effective dishwash bar.', image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80' },
      { name: 'Colin Glass Cleaner 500ml', category: 'Household', price: 110, stock: 60, isFeatured: false, description: 'Streak-free glass cleaner.', image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80' },
      { name: 'Ariel Liquid Detergent 1L', category: 'Household', price: 280, stock: 50, isFeatured: true, description: 'Concentrated liquid detergent.', image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&q=80' },
      { name: 'Garbage Bags 30-Pack', category: 'Household', price: 80, stock: 120, isFeatured: false, description: 'Strong and leak-proof garbage bags.', image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80' },
      { name: 'AAA Batteries 4-Pack', category: 'Other', price: 80, stock: 100, isFeatured: false, description: 'Long-lasting alkaline batteries.', image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&q=80' },
      { name: 'Candles 12-Pack', category: 'Other', price: 60, stock: 80, isFeatured: false, description: 'White wax candles.', image: 'https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=400&q=80' },
      { name: 'Aluminium Foil 10m Roll', category: 'Other', price: 75, stock: 65, isFeatured: false, description: 'Heavy-duty aluminium foil.', image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80' },
    ];

    await Product.insertMany(products);
    res.json({ message: `✅ ${products.length} products seeded with images successfully!` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running', timestamp: new Date().toISOString() });
});

app.use('/api/auth',     require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders',   require('./routes/orderRoutes'));
app.use('/api/payment',  require('./routes/paymentRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/users',    require('./routes/userRoutes'));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.message);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// -------- Start Server --------
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
});
