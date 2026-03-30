const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const bcrypt = require('bcryptjs');

const users = [
  { name: 'Admin User',    email: 'admin@store.com',  password: 'admin123', role: 'admin'    },
  { name: 'John Customer', email: 'john@example.com', password: 'john123',  role: 'customer' },
  { name: 'Priya Sharma',  email: 'priya@example.com',password: 'priya123', role: 'customer' },
];

const products = [
  // ── GROCERIES (12) ─────────────────────────────────────────────────────────
  { name: 'Basmati Rice 5kg',         category: 'Groceries', price: 450, stock: 120, isFeatured: true,
    description: 'Premium long-grain basmati rice with rich aroma. Perfect for biryani and pulao.',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80' },
  { name: 'Wheat Flour (Atta) 10kg',  category: 'Groceries', price: 380, stock: 90,  isFeatured: false,
    description: 'Whole wheat flour milled from premium wheat. Ideal for rotis and parathas.',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80' },
  { name: 'Toor Dal 1kg',             category: 'Groceries', price: 120, stock: 80,  isFeatured: false,
    description: 'High-quality split pigeon peas. Rich in protein and essential nutrients.',
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80' },
  { name: 'Sunflower Cooking Oil 1L', category: 'Groceries', price: 120, stock: 100, isFeatured: true,
    description: 'Refined sunflower oil. Light, healthy and ideal for everyday cooking.',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80' },
  { name: 'Sugar 1kg',                category: 'Groceries', price: 45,  stock: 150, isFeatured: false,
    description: 'Pure refined white sugar. Perfect for tea, sweets and baking.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },
  { name: 'Iodized Salt 1kg',         category: 'Groceries', price: 20,  stock: 200, isFeatured: false,
    description: 'Iodized table salt. Essential mineral for everyday cooking.',
    image: 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=400&q=80' },
  { name: 'Chana Dal 1kg',            category: 'Groceries', price: 95,  stock: 75,  isFeatured: false,
    description: 'Split Bengal gram dal. High in fibre and protein, great for curries.',
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80' },
  { name: 'Mustard Oil 1L',           category: 'Groceries', price: 140, stock: 60,  isFeatured: false,
    description: 'Cold-pressed mustard oil with a pungent aroma. Popular in North Indian cooking.',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80' },
  { name: 'Turmeric Powder 200g',     category: 'Groceries', price: 55,  stock: 110, isFeatured: false,
    description: 'Pure ground turmeric with high curcumin content. Adds colour and health benefits.',
    image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&q=80' },
  { name: 'Red Chilli Powder 200g',   category: 'Groceries', price: 60,  stock: 95,  isFeatured: false,
    description: 'Finely ground red chilli powder. Adds heat and colour to any dish.',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80' },
  { name: 'Poha (Flattened Rice) 1kg',category: 'Groceries', price: 65,  stock: 85,  isFeatured: false,
    description: 'Light and easy-to-cook flattened rice. Perfect for breakfast poha.',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80' },
  { name: 'Moong Dal 1kg',            category: 'Groceries', price: 110, stock: 70,  isFeatured: false,
    description: 'Split green gram dal. Easy to digest and packed with nutrients.',
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80' },

  // ── DAIRY (8) ──────────────────────────────────────────────────────────────
  { name: 'Fresh Full-Cream Milk 1L', category: 'Dairy', price: 30,  stock: 60,  isFeatured: true,
    description: 'Farm-fresh full-cream milk. Rich in calcium and vitamins for the whole family.',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80' },
  { name: 'Amul Butter 500g',         category: 'Dairy', price: 250, stock: 45,  isFeatured: false,
    description: 'Creamy pasteurized butter made from fresh cream. Great on toast and in cooking.',
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80' },
  { name: 'Paneer 200g',              category: 'Dairy', price: 80,  stock: 35,  isFeatured: true,
    description: 'Fresh cottage cheese made from whole milk. Soft, creamy and protein-rich.',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80' },
  { name: 'Set Curd 500g',            category: 'Dairy', price: 40,  stock: 50,  isFeatured: false,
    description: 'Thick and creamy set curd. Probiotic-rich and great with every meal.',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80' },
  { name: 'Amul Cheese Slices 200g',  category: 'Dairy', price: 120, stock: 40,  isFeatured: false,
    description: 'Processed cheese slices. Perfect for sandwiches, burgers and grilled dishes.',
    image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&q=80' },
  { name: 'Ghee 500ml',               category: 'Dairy', price: 320, stock: 55,  isFeatured: true,
    description: 'Pure cow ghee with a rich golden colour and nutty aroma. Ideal for cooking and tempering.',
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80' },
  { name: 'Flavoured Yogurt 100g',    category: 'Dairy', price: 25,  stock: 80,  isFeatured: false,
    description: 'Creamy strawberry-flavoured yogurt. A healthy and delicious snack.',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80' },
  { name: 'Skimmed Milk Powder 500g', category: 'Dairy', price: 210, stock: 30,  isFeatured: false,
    description: 'Low-fat skimmed milk powder. Great for baking, smoothies and protein shakes.',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80' },

  // ── SNACKS (10) ────────────────────────────────────────────────────────────
  { name: "Lay's Classic Chips 100g",  category: 'Snacks', price: 30,  stock: 200, isFeatured: true,
    description: 'Crispy salted potato chips. The perfect snack for any time of day.',
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80' },
  { name: 'Maggi Noodles 12-Pack',     category: 'Snacks', price: 180, stock: 120, isFeatured: true,
    description: '2-minute instant noodles. Quick, tasty and loved by all ages.',
    image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&q=80' },
  { name: 'Parle-G Biscuits 800g',     category: 'Snacks', price: 50,  stock: 180, isFeatured: false,
    description: 'Classic glucose biscuits. A timeless Indian snack enjoyed with tea.',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80' },
  { name: 'Mixed Dry Fruits 250g',     category: 'Snacks', price: 220, stock: 60,  isFeatured: false,
    description: 'Premium mix of cashews, almonds, raisins and pistachios.',
    image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400&q=80' },
  { name: 'Kurkure Masala Munch 90g',  category: 'Snacks', price: 20,  stock: 250, isFeatured: false,
    description: 'Crunchy corn puffs with a spicy masala flavour. Irresistibly tasty.',
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80' },
  { name: 'Haldiram Bhujia 400g',      category: 'Snacks', price: 130, stock: 90,  isFeatured: true,
    description: 'Crispy and spicy moth bean noodles. A classic Indian namkeen.',
    image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400&q=80' },
  { name: 'Oreo Cookies 300g',         category: 'Snacks', price: 90,  stock: 140, isFeatured: false,
    description: 'Chocolate sandwich cookies with a creamy vanilla filling. Twist, lick, dunk!',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80' },
  { name: 'Roasted Peanuts 500g',      category: 'Snacks', price: 75,  stock: 110, isFeatured: false,
    description: 'Salted roasted peanuts. A protein-rich snack perfect for munching.',
    image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400&q=80' },
  { name: 'Dark Chocolate Bar 100g',   category: 'Snacks', price: 150, stock: 70,  isFeatured: false,
    description: '70% dark chocolate with rich cocoa flavour. A guilt-free indulgence.',
    image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400&q=80' },
  { name: 'Popcorn Butter Flavour 50g',category: 'Snacks', price: 35,  stock: 160, isFeatured: false,
    description: 'Light and fluffy microwave popcorn with a rich buttery flavour.',
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80' },

  // ── BEVERAGES (8) ──────────────────────────────────────────────────────────
  { name: 'Coca-Cola 2 Litre',          category: 'Beverages', price: 90,  stock: 150, isFeatured: false,
    description: 'Refreshing carbonated soft drink. Best served chilled.',
    image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&q=80' },
  { name: 'Tata Tea Premium 500g',       category: 'Beverages', price: 220, stock: 80,  isFeatured: true,
    description: 'Strong and aromatic CTC tea. Perfect for a refreshing cup every morning.',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80' },
  { name: 'Tropicana Orange Juice 1L',   category: 'Beverages', price: 110, stock: 70,  isFeatured: false,
    description: '100% pure orange juice with no added sugar. Rich in Vitamin C.',
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80' },
  { name: 'Nescafe Classic Coffee 100g', category: 'Beverages', price: 280, stock: 65,  isFeatured: true,
    description: 'Rich and aromatic instant coffee. Brews a perfect cup every time.',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80' },
  { name: 'Sprite 1.5 Litre',           category: 'Beverages', price: 65,  stock: 130, isFeatured: false,
    description: 'Crisp lemon-lime flavoured carbonated drink. Refreshing and light.',
    image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&q=80' },
  { name: 'Real Mango Juice 1L',         category: 'Beverages', price: 95,  stock: 85,  isFeatured: false,
    description: 'Thick and pulpy mango juice made from Alphonso mangoes.',
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80' },
  { name: 'Green Tea 25 Bags',           category: 'Beverages', price: 120, stock: 90,  isFeatured: false,
    description: 'Premium green tea bags with antioxidants. Light, refreshing and healthy.',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80' },
  { name: 'Bournvita 500g',              category: 'Beverages', price: 230, stock: 75,  isFeatured: false,
    description: 'Chocolate malt drink mix. Packed with vitamins and minerals for kids.',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80' },

  // ── BAKERY (7) ─────────────────────────────────────────────────────────────
  { name: 'Britannia Whole Wheat Bread', category: 'Bakery', price: 45,  stock: 40,  isFeatured: true,
    description: 'Soft and fresh sandwich bread. Made with whole wheat for added nutrition.',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80' },
  { name: 'Butter Croissant 4-Pack',     category: 'Bakery', price: 80,  stock: 25,  isFeatured: false,
    description: 'Buttery, flaky croissants baked fresh. Great for breakfast.',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80' },
  { name: 'Chocolate Muffin 2-Pack',     category: 'Bakery', price: 60,  stock: 30,  isFeatured: false,
    description: 'Moist chocolate muffins with chocolate chips. A perfect teatime treat.',
    image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&q=80' },
  { name: 'Pav Buns 6-Pack',             category: 'Bakery', price: 35,  stock: 50,  isFeatured: false,
    description: 'Soft and fluffy pav buns. Perfect for vada pav, pav bhaji and burgers.',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80' },
  { name: 'Multigrain Bread 400g',       category: 'Bakery', price: 55,  stock: 35,  isFeatured: false,
    description: 'Nutritious multigrain bread with seeds. High in fibre and great for health.',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80' },
  { name: 'Cinnamon Rolls 4-Pack',       category: 'Bakery', price: 120, stock: 20,  isFeatured: true,
    description: 'Soft cinnamon rolls with cream cheese frosting. A bakery favourite.',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80' },
  { name: 'Rusk Toast 300g',             category: 'Bakery', price: 40,  stock: 70,  isFeatured: false,
    description: 'Crispy double-baked rusk. Perfect with morning tea or coffee.',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80' },

  // ── PERSONAL CARE (8) ──────────────────────────────────────────────────────
  { name: 'Dove Moisturizing Soap 3-Pack', category: 'Personal Care', price: 180, stock: 60,  isFeatured: true,
    description: 'Moisturizing beauty bar with ¼ cream. Leaves skin soft and smooth.',
    image: 'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=400&q=80' },
  { name: 'Colgate Strong Teeth 200g',     category: 'Personal Care', price: 85,  stock: 90,  isFeatured: false,
    description: 'Strong teeth protection with fluoride. Fights cavities and freshens breath.',
    image: 'https://images.unsplash.com/photo-1559591937-abc3f3b9b9e4?w=400&q=80' },
  { name: 'Head & Shoulders Shampoo 340ml',category: 'Personal Care', price: 220, stock: 55,  isFeatured: true,
    description: 'Anti-dandruff shampoo with zinc pyrithione. Leaves hair clean and flake-free.',
    image: 'https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=400&q=80' },
  { name: 'Nivea Body Lotion 400ml',       category: 'Personal Care', price: 260, stock: 45,  isFeatured: false,
    description: 'Deep moisturizing body lotion with almond oil. 48-hour moisture.',
    image: 'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=400&q=80' },
  { name: 'Gillette Mach3 Razor',          category: 'Personal Care', price: 175, stock: 70,  isFeatured: false,
    description: '3-blade razor for a close, comfortable shave. Includes 2 cartridges.',
    image: 'https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=400&q=80' },
  { name: 'Dettol Hand Wash 250ml',        category: 'Personal Care', price: 95,  stock: 100, isFeatured: false,
    description: 'Antibacterial hand wash that kills 99.9% of germs. Gentle on skin.',
    image: 'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=400&q=80' },
  { name: 'Sunscreen SPF 50 100ml',        category: 'Personal Care', price: 310, stock: 40,  isFeatured: false,
    description: 'Broad-spectrum SPF 50 sunscreen. Protects against UVA and UVB rays.',
    image: 'https://images.unsplash.com/photo-1559591937-abc3f3b9b9e4?w=400&q=80' },
  { name: 'Whisper Ultra Pads 30-Pack',    category: 'Personal Care', price: 145, stock: 65,  isFeatured: false,
    description: 'Ultra-thin sanitary pads with wings. Provides all-day comfort and protection.',
    image: 'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=400&q=80' },

  // ── HOUSEHOLD (8) ──────────────────────────────────────────────────────────
  { name: 'Surf Excel Washing Powder 2kg', category: 'Household', price: 320, stock: 5,   isFeatured: false,
    description: 'Powerful washing powder that removes tough stains in one wash.',
    image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&q=80' },
  { name: 'Vim Dishwash Bar 200g',         category: 'Household', price: 30,  stock: 110, isFeatured: false,
    description: 'Effective dishwash bar that cuts through grease. Leaves dishes sparkling.',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80' },
  { name: 'Colin Glass Cleaner 500ml',     category: 'Household', price: 110, stock: 60,  isFeatured: false,
    description: 'Streak-free glass and surface cleaner. Leaves mirrors and windows crystal clear.',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80' },
  { name: 'Harpic Toilet Cleaner 500ml',   category: 'Household', price: 95,  stock: 75,  isFeatured: false,
    description: 'Powerful toilet bowl cleaner that kills 99.9% of germs and removes stains.',
    image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&q=80' },
  { name: 'Good Knight Mosquito Coil 10-Pack', category: 'Household', price: 55, stock: 90, isFeatured: false,
    description: 'Long-lasting mosquito coils. Provides 8 hours of protection.',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80' },
  { name: 'Scotch-Brite Scrub Pad 3-Pack', category: 'Household', price: 65,  stock: 85,  isFeatured: false,
    description: 'Heavy-duty scrubbing pads for tough kitchen cleaning. Long-lasting.',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80' },
  { name: 'Ariel Liquid Detergent 1L',     category: 'Household', price: 280, stock: 50,  isFeatured: true,
    description: 'Concentrated liquid detergent for front-load and top-load machines.',
    image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&q=80' },
  { name: 'Garbage Bags 30-Pack',          category: 'Household', price: 80,  stock: 120, isFeatured: false,
    description: 'Strong and leak-proof garbage bags. Fits standard dustbins.',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80' },

  // ── OTHER (5) ──────────────────────────────────────────────────────────────
  { name: 'AAA Batteries 4-Pack',      category: 'Other', price: 80,  stock: 100, isFeatured: false,
    description: 'Long-lasting alkaline AAA batteries. Works in remotes, toys and clocks.',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&q=80' },
  { name: 'Candles 12-Pack',           category: 'Other', price: 60,  stock: 80,  isFeatured: false,
    description: 'White wax candles for power cuts and decoration. Burns for 4 hours each.',
    image: 'https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=400&q=80' },
  { name: 'Matchbox 10-Pack',          category: 'Other', price: 25,  stock: 200, isFeatured: false,
    description: 'Safety matchboxes. Essential for kitchen and emergency use.',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&q=80' },
  { name: 'Aluminium Foil 10m Roll',   category: 'Other', price: 75,  stock: 65,  isFeatured: false,
    description: 'Heavy-duty aluminium foil for cooking, baking and food storage.',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80' },
  { name: 'Zip-Lock Bags 50-Pack',     category: 'Other', price: 90,  stock: 70,  isFeatured: false,
    description: 'Resealable zip-lock bags for food storage and organisation.',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80' },
];

const seedDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB Connected');

  await Order.deleteMany();
  await Product.deleteMany();
  await User.deleteMany();

  const hashedUsers = await Promise.all(
    users.map(async (u) => ({ ...u, password: await bcrypt.hash(u.password, 12) }))
  );
  await User.insertMany(hashedUsers);
  console.log(`✅ ${hashedUsers.length} users seeded`);

  await Product.insertMany(products);
  console.log(`✅ ${products.length} products seeded across 8 categories`);

  console.log('\n🔑 Login credentials:');
  console.log('   Admin    → admin@store.com   / admin123');
  console.log('   Customer → john@example.com  / john123\n');

  process.exit(0);
};

seedDB().catch((err) => { console.error(err); process.exit(1); });
