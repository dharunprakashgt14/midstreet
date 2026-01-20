/**
 * Database Seed Script
 * 
 * This script populates the database with initial data:
 * - Menu items from the frontend data
 * - Default admin user
 * 
 * Run this once after setting up MongoDB Atlas:
 * node backend/scripts/seed.js
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { connectDB } from '../config/db.js';
import { MenuItem } from '../models/MenuItem.js';
import { Admin } from '../models/Admin.js';

// Load environment variables
dotenv.config();

// Full menu items data (from frontend src/data.ts)
// This maps categoryId to category for the backend model
const MENU_ITEMS_DATA = [
  // PIZZA
  { category: 'pizza', name: 'Margherita Pizza', price: 160, isAvailable: true, itemId: 'pizza-margherita' },
  { category: 'pizza', name: 'Love with Paneer', price: 190, isAvailable: true, itemId: 'pizza-love-paneer' },
  { category: 'pizza', name: 'Love with Corn', price: 180, isAvailable: true, itemId: 'pizza-love-corn' },
  { category: 'pizza', name: 'Love with Spicy', price: 170, isAvailable: true, itemId: 'pizza-love-spicy' },
  { category: 'pizza', name: 'Love with Mushy', price: 180, isAvailable: true, itemId: 'pizza-love-mushy' },
  { category: 'pizza', name: 'Paneer Babycorn', price: 200, isAvailable: true, itemId: 'pizza-paneer-babycorn' },
  { category: 'pizza', name: 'All Veg Pizza', price: 220, isAvailable: true, itemId: 'pizza-all-veg' },
  
  // PAV BHAJI
  { category: 'pav-bhaji', name: 'Pav Bhaji', price: 100, isAvailable: true, itemId: 'pav-bhaji-plain' },
  { category: 'pav-bhaji', name: 'Vada Pav', price: 80, isAvailable: true, itemId: 'pav-bhaji-vada' },
  { category: 'pav-bhaji', name: 'Cheese Vada Pav', price: 100, isAvailable: true, itemId: 'pav-bhaji-cheese-vada' },
  { category: 'pav-bhaji', name: 'Paneer Pav', price: 110, isAvailable: true, itemId: 'pav-bhaji-paneer-pav' },
  { category: 'pav-bhaji', name: 'Mushroom Pav', price: 100, isAvailable: true, itemId: 'pav-bhaji-mushroom-pav' },
  { category: 'pav-bhaji', name: 'Cheese Pav Bhaji', price: 120, isAvailable: true, itemId: 'pav-bhaji-cheese-pav-bhaji' },
  { category: 'pav-bhaji', name: 'Fried Pav Bhaji', price: 130, isAvailable: true, itemId: 'pav-bhaji-fried' },
  
  // BURGER
  { category: 'burger', name: 'Veg Burger', price: 140, isAvailable: true, itemId: 'burger-veg' },
  { category: 'burger', name: 'Veg Cheese Burger', price: 160, isAvailable: true, itemId: 'burger-veg-cheese' },
  { category: 'burger', name: 'Paneer Burger', price: 170, isAvailable: true, itemId: 'burger-paneer' },
  { category: 'burger', name: 'Veg Cutlet Burger', price: 160, isAvailable: true, itemId: 'burger-veg-cutlet' },
  { category: 'burger', name: 'Aloo Tikki Burger', price: 150, isAvailable: true, itemId: 'burger-aloo-tikki' },
  { category: 'burger', name: 'Double Deck Burger', price: 170, isAvailable: true, itemId: 'burger-double-deck' },
  { category: 'burger', name: 'Midstreet Special Burger', price: 190, isAvailable: true, itemId: 'burger-midstreet-special' },
  
  // GARLIC TOAST
  { category: 'garlic-toast', name: 'Garlic Toast', price: 110, isAvailable: true, itemId: 'garlic-toast-plain' },
  { category: 'garlic-toast', name: 'Cheese Garlic Toast', price: 120, isAvailable: true, itemId: 'garlic-toast-cheese' },
  { category: 'garlic-toast', name: 'Chilli Cheese Toast', price: 120, isAvailable: true, itemId: 'garlic-toast-chilli-cheese' },
  { category: 'garlic-toast', name: 'Paneer Garlic Toast', price: 150, isAvailable: true, itemId: 'garlic-toast-paneer' },
  { category: 'garlic-toast', name: 'Mushroom Garlic Toast', price: 150, isAvailable: true, itemId: 'garlic-toast-mushroom' },
  { category: 'garlic-toast', name: 'Corn Garlic Toast', price: 140, isAvailable: true, itemId: 'garlic-toast-corn' },
  { category: 'garlic-toast', name: 'Paneer Corn Toast', price: 150, isAvailable: true, itemId: 'garlic-toast-paneer-corn' },
  
  // SANDWICH
  { category: 'sandwich', name: 'Veg SW', price: 130, isAvailable: true, itemId: 'sandwich-veg' },
  { category: 'sandwich', name: 'Corn SW', price: 130, isAvailable: true, itemId: 'sandwich-corn' },
  { category: 'sandwich', name: 'Mushroom SW', price: 140, isAvailable: true, itemId: 'sandwich-mushroom' },
  { category: 'sandwich', name: 'Nutella SW', price: 150, isAvailable: true, itemId: 'sandwich-nutella' },
  { category: 'sandwich', name: 'Choco Grilled SW', price: 150, isAvailable: true, itemId: 'sandwich-choco-grilled' },
  { category: 'sandwich', name: 'Paneer Tikka SW', price: 160, isAvailable: true, itemId: 'sandwich-paneer-tikka' },
  { category: 'sandwich', name: 'Double Cheese SW', price: 160, isAvailable: true, itemId: 'sandwich-double-cheese' },
  { category: 'sandwich', name: 'Double Deck SW', price: 160, isAvailable: true, itemId: 'sandwich-double-deck' },
  { category: 'sandwich', name: 'Triple Deck SW', price: 180, isAvailable: true, itemId: 'sandwich-triple-deck' },
  { category: 'sandwich', name: 'Paneer Corn SW', price: 160, isAvailable: true, itemId: 'sandwich-paneer-corn' },
  { category: 'sandwich', name: 'Mid Special SW', price: 180, isAvailable: true, itemId: 'sandwich-mid-special' },
  
  // FINGER FOODS
  { category: 'finger-foods', name: 'Classic Fries', price: 100, isAvailable: true, itemId: 'finger-classic-fries' },
  { category: 'finger-foods', name: 'Peri Peri Fries', price: 110, isAvailable: true, itemId: 'finger-peri-peri-fries' },
  { category: 'finger-foods', name: 'Smileys', price: 110, isAvailable: true, itemId: 'finger-smileys' },
  { category: 'finger-foods', name: 'Mayo Fries', price: 110, isAvailable: true, itemId: 'finger-mayo-fries' },
  { category: 'finger-foods', name: 'Nuggets', price: 100, isAvailable: true, itemId: 'finger-nuggets' },
  { category: 'finger-foods', name: 'Cheesy Fries', price: 120, isAvailable: true, itemId: 'finger-cheesy-fries' },
  { category: 'finger-foods', name: 'Tandoori Fries', price: 110, isAvailable: true, itemId: 'finger-tandoori-fries' },
  { category: 'finger-foods', name: 'Cheesy Corn Nuggets', price: 120, isAvailable: true, itemId: 'finger-cheesy-corn-nuggets' },
  { category: 'finger-foods', name: 'Loaded Fries', price: 140, isAvailable: true, itemId: 'finger-loaded-fries' },
  
  // MOMOS
  { category: 'momos', name: 'Paneer Momos', price: 120, isAvailable: true, itemId: 'momos-paneer' },
  { category: 'momos', name: 'Paneer Tikka Momos', price: 130, isAvailable: true, itemId: 'momos-paneer-tikka' },
  { category: 'momos', name: 'Corn Momos', price: 100, isAvailable: true, itemId: 'momos-corn' },
  { category: 'momos', name: 'Corn and Cheese Momos', price: 120, isAvailable: true, itemId: 'momos-corn-cheese' },
  { category: 'momos', name: 'Mushroom Momos', price: 110, isAvailable: true, itemId: 'momos-mushroom' },
  { category: 'momos', name: 'Veg Sez Momos', price: 110, isAvailable: true, itemId: 'momos-veg-sez' },
  { category: 'momos', name: 'Veg Momos', price: 100, isAvailable: true, itemId: 'momos-veg' },
  { category: 'momos', name: 'Tandoori Momos', price: 130, isAvailable: true, itemId: 'momos-tandoori' },
  { category: 'momos', name: 'Choco Momos', price: 130, isAvailable: true, itemId: 'momos-choco' },
  
  // CHAATS
  { category: 'chaats', name: 'Pani Poori', price: 80, isAvailable: true, itemId: 'chaat-pani-poori' },
  { category: 'chaats', name: 'Papadi Chaat', price: 90, isAvailable: true, itemId: 'chaat-papadi' },
  { category: 'chaats', name: 'Sev Poori', price: 90, isAvailable: true, itemId: 'chaat-sev-poori' },
  { category: 'chaats', name: 'Bhel Poori', price: 90, isAvailable: true, itemId: 'chaat-bhel-poori' },
  { category: 'chaats', name: 'Dahi Papadi', price: 100, isAvailable: true, itemId: 'chaat-dahi-papadi' },
  { category: 'chaats', name: 'Dahi Poori', price: 90, isAvailable: true, itemId: 'chaat-dahi-poori' },
  { category: 'chaats', name: 'Channa Masala', price: 100, isAvailable: true, itemId: 'chaat-channa-masala' },
  { category: 'chaats', name: 'Cheese Bhel Poori', price: 110, isAvailable: true, itemId: 'chaat-cheese-bhel' },
  { category: 'chaats', name: 'Cutlet Channa', price: 110, isAvailable: true, itemId: 'chaat-cutlet-channa' },
  { category: 'chaats', name: 'Masala Poori', price: 100, isAvailable: true, itemId: 'chaat-masala-poori' },
  { category: 'chaats', name: 'Corn Bhel Poori', price: 110, isAvailable: true, itemId: 'chaat-corn-bhel' },
  { category: 'chaats', name: 'Corn Chaat', price: 120, isAvailable: true, itemId: 'chaat-corn-chaat' },
  { category: 'chaats', name: 'Aloo Tikki Chaat', price: 100, isAvailable: true, itemId: 'chaat-aloo-tikki' },
  { category: 'chaats', name: 'Bread Channa', price: 90, isAvailable: true, itemId: 'chaat-bread-channa' },
  { category: 'chaats', name: 'Mixed Chaat', price: 120, isAvailable: true, itemId: 'chaat-mixed' },
  
  // THATU VADAI SET
  { category: 'thatu-vadai-set', name: 'Plain Set', price: 80, isAvailable: true, itemId: 'thatu-plain-set' },
  { category: 'thatu-vadai-set', name: 'Tomato Set', price: 90, isAvailable: true, itemId: 'thatu-tomato-set' },
  { category: 'thatu-vadai-set', name: 'Cucumber Set', price: 90, isAvailable: true, itemId: 'thatu-cucumber-set' },
  { category: 'thatu-vadai-set', name: 'Dahi Set', price: 90, isAvailable: true, itemId: 'thatu-dahi-set' },
  { category: 'thatu-vadai-set', name: 'Cheese Set', price: 100, isAvailable: true, itemId: 'thatu-cheese-set' },
  { category: 'thatu-vadai-set', name: 'Mixed Combo Set', price: 100, isAvailable: true, itemId: 'thatu-mixed-combo-set' },
  { category: 'thatu-vadai-set', name: 'Plain Norukkal', price: 80, isAvailable: true, itemId: 'thatu-plain-norukkal' },
  { category: 'thatu-vadai-set', name: 'Tomato Norukkal', price: 90, isAvailable: true, itemId: 'thatu-tomato-norukkal' },
  { category: 'thatu-vadai-set', name: 'Dahi Norukkal', price: 90, isAvailable: true, itemId: 'thatu-dahi-norukkal' },
  { category: 'thatu-vadai-set', name: 'Mixed Norukkal', price: 100, isAvailable: true, itemId: 'thatu-mixed-norukkal' },
  { category: 'thatu-vadai-set', name: 'Dahi Peanut', price: 110, isAvailable: true, itemId: 'thatu-dahi-peanut' },
  
  // SOUP
  { category: 'soup', name: 'Veg Soup', price: 70, isAvailable: true, itemId: 'soup-veg' },
  { category: 'soup', name: 'Veg Clear Soup', price: 70, isAvailable: true, itemId: 'soup-veg-clear' },
  { category: 'soup', name: 'Veg Noodles Soup', price: 80, isAvailable: true, itemId: 'soup-veg-noodles' },
  { category: 'soup', name: 'Tomato Soup', price: 90, isAvailable: true, itemId: 'soup-tomato' },
  { category: 'soup', name: 'Lime & Coriander Soup', price: 80, isAvailable: true, itemId: 'soup-lime-coriander' },
  { category: 'soup', name: 'Sweet Corn Soup', price: 80, isAvailable: true, itemId: 'soup-sweet-corn' },
  { category: 'soup', name: 'Hot & Sour Soup', price: 80, isAvailable: true, itemId: 'soup-hot-sour' },
  { category: 'soup', name: 'Manchow Soup', price: 90, isAvailable: true, itemId: 'soup-manchow' },
  { category: 'soup', name: 'Mushroom Soup', price: 90, isAvailable: true, itemId: 'soup-mushroom' },
  
  // STARTERS (sample - add all from data.ts)
  { category: 'starters', name: 'Veg Manchurian', price: 160, isAvailable: true, itemId: 'starter-veg-manchurian' },
  { category: 'starters', name: 'Gobi Manchurian', price: 160, isAvailable: true, itemId: 'starter-gobi-manchurian' },
  { category: 'starters', name: 'Paneer Manchurian', price: 180, isAvailable: true, itemId: 'starter-paneer-manchurian' },
  
  // Add more categories as needed - this is a comprehensive sample
  // You can add all remaining items from your frontend data.ts file
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seed...\n');

    // Connect to database
    await connectDB();

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await MenuItem.deleteMany({});
    await Admin.deleteMany({});
    console.log('✅ Cleared existing data\n');

    // Seed menu items
    console.log('📋 Seeding menu items...');
    const menuItems = await MenuItem.insertMany(MENU_ITEMS_DATA);
    console.log(`✅ Inserted ${menuItems.length} menu items\n`);

    // Seed admin user
    console.log('👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash('midstreet123', 10); // Default password
    const admin = await Admin.create({
      username: 'admin',
      passwordHash: hashedPassword
    });
    console.log(`✅ Created admin user: ${admin.username}`);
    console.log('   Default password: midstreet123\n');

    console.log('✨ Database seeding completed successfully!\n');
    console.log('📝 Next steps:');
    console.log('   1. Start the backend server: npm start (in backend folder)');
    console.log('   2. Start the frontend: npm run dev (in root folder)');
    console.log('   3. Login with username: admin, password: midstreet123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
