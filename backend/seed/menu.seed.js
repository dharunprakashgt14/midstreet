/**
 * Menu Seed Script
 * 
 * Seeds the MongoDB database with the complete menu items.
 * Run with: npm run seed:menu
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MenuItem } from '../models/MenuItem.js';

// Load environment variables
dotenv.config();

// Full menu data
const MENU_ITEMS = [
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

  // STARTERS
  { category: 'starters', name: 'Veg Manchurian', price: 160, isAvailable: true, itemId: 'starter-veg-manchurian' },
  { category: 'starters', name: 'Gobi Manchurian', price: 160, isAvailable: true, itemId: 'starter-gobi-manchurian' },
  { category: 'starters', name: 'Baby Corn Manchurian', price: 160, isAvailable: true, itemId: 'starter-babycorn-manchurian' },
  { category: 'starters', name: 'Paneer Manchurian', price: 180, isAvailable: true, itemId: 'starter-paneer-manchurian' },
  { category: 'starters', name: 'Mushroom Manchurian', price: 160, isAvailable: true, itemId: 'starter-mushroom-manchurian' },
  { category: 'starters', name: 'Aloo Manchurian', price: 140, isAvailable: true, itemId: 'starter-aloo-manchurian' },
  { category: 'starters', name: 'Mixed Veg Manchurian', price: 180, isAvailable: true, itemId: 'starter-mixed-veg-manchurian' },
  { category: 'starters', name: 'Gobi 65', price: 130, isAvailable: true, itemId: 'starter-gobi-65' },
  { category: 'starters', name: 'Paneer 65', price: 150, isAvailable: true, itemId: 'starter-paneer-65' },
  { category: 'starters', name: 'Mushroom 65', price: 140, isAvailable: true, itemId: 'starter-mushroom-65' },
  { category: 'starters', name: 'Baby Corn 65', price: 140, isAvailable: true, itemId: 'starter-babycorn-65' },
  { category: 'starters', name: 'Aloo 65', price: 120, isAvailable: true, itemId: 'starter-aloo-65' },
  { category: 'starters', name: 'Golden Fried Babycorn', price: 140, isAvailable: true, itemId: 'starter-golden-babycorn' },
  { category: 'starters', name: 'Golden Fried Paneer', price: 150, isAvailable: true, itemId: 'starter-golden-paneer' },
  { category: 'starters', name: 'Golden Fried Gobi', price: 130, isAvailable: true, itemId: 'starter-golden-gobi' },
  { category: 'starters', name: 'Honey Paneer Chilli', price: 180, isAvailable: true, itemId: 'starter-honey-paneer-chilli' },
  { category: 'starters', name: 'Honey Babycorn Chilli', price: 170, isAvailable: true, itemId: 'starter-honey-babycorn-chilli' },
  { category: 'starters', name: 'Honey Mushroom Chilli', price: 160, isAvailable: true, itemId: 'starter-honey-mushroom-chilli' },
  { category: 'starters', name: 'Mushroom Pepper Fry', price: 160, isAvailable: true, itemId: 'starter-mushroom-pepper-fry' },
  { category: 'starters', name: 'Paneer Pepper Fry', price: 180, isAvailable: true, itemId: 'starter-paneer-pepper-fry' },
  { category: 'starters', name: 'Gobi Pepper Fry', price: 150, isAvailable: true, itemId: 'starter-gobi-pepper-fry' },
  { category: 'starters', name: 'Dragon Fried Babycorn', price: 180, isAvailable: true, itemId: 'starter-dragon-babycorn' },
  { category: 'starters', name: 'Dragon Fried Paneer', price: 190, isAvailable: true, itemId: 'starter-dragon-paneer' },
  { category: 'starters', name: 'Dragon Fried Gobi', price: 200, isAvailable: true, itemId: 'starter-dragon-gobi' },

  // SPECIAL STARTERS
  { category: 'special-starters', name: 'Mushroom Maharani', price: 180, isAvailable: true, itemId: 'special-mushroom-maharani' },
  { category: 'special-starters', name: 'Mushroom Hot Pepper', price: 180, isAvailable: true, itemId: 'special-mushroom-hot-pepper' },
  { category: 'special-starters', name: 'Paneer Maharani', price: 190, isAvailable: true, itemId: 'special-paneer-maharani' },
  { category: 'special-starters', name: 'Paneer Hot Pepper', price: 190, isAvailable: true, itemId: 'special-paneer-hot-pepper' },
  { category: 'special-starters', name: 'Japan Paneer', price: 200, isAvailable: true, itemId: 'special-japan-paneer' },
  { category: 'special-starters', name: 'Japan Mushroom', price: 190, isAvailable: true, itemId: 'special-japan-mushroom' },
  { category: 'special-starters', name: 'Ghee Podi Paneer', price: 200, isAvailable: true, itemId: 'special-ghee-podi-paneer' },
  { category: 'special-starters', name: 'Ghee Podi Mushroom', price: 190, isAvailable: true, itemId: 'special-ghee-podi-mushroom' },
  { category: 'special-starters', name: 'Mushroom Pallipalayam', price: 160, isAvailable: true, itemId: 'special-mushroom-pallipalayam' },
  { category: 'special-starters', name: 'Mushroom Nallampatti', price: 160, isAvailable: true, itemId: 'special-mushroom-nallampatti' },

  // SIZZLER
  { category: 'sizzler', name: 'Aloo Veg Siz', price: 250, isAvailable: true, itemId: 'sizzler-aloo-veg' },
  { category: 'sizzler', name: 'Gobi Manchurian Siz', price: 250, isAvailable: true, itemId: 'sizzler-gobi-manchurian' },
  { category: 'sizzler', name: 'Mushroom Babycorn Siz', price: 250, isAvailable: true, itemId: 'sizzler-mushroom-babycorn' },
  { category: 'sizzler', name: 'Paneer Tikka Siz', price: 260, isAvailable: true, itemId: 'sizzler-paneer-tikka' },
  { category: 'sizzler', name: 'Chilli Paneer Siz', price: 260, isAvailable: true, itemId: 'sizzler-chilli-paneer' },
  { category: 'sizzler', name: 'Crispy Paneer Siz', price: 260, isAvailable: true, itemId: 'sizzler-crispy-paneer' },
  { category: 'sizzler', name: 'All Veg Siz', price: 260, isAvailable: true, itemId: 'sizzler-all-veg' },
  { category: 'sizzler', name: 'Spl. Jain Siz', price: 260, isAvailable: true, itemId: 'sizzler-spl-jain' },

  // TANDOORI / HARIYALI
  { category: 'tandoori-hariyali', name: 'Paneer Tikka', price: 180, isAvailable: true, itemId: 'tandoori-paneer-tikka' },
  { category: 'tandoori-hariyali', name: 'Schezwan Paneer Tikka', price: 190, isAvailable: true, itemId: 'tandoori-schezwan-paneer-tikka' },
  { category: 'tandoori-hariyali', name: 'Mushroom Tikka', price: 160, isAvailable: true, itemId: 'tandoori-mushroom-tikka' },

  // INDIAN BREADS
  { category: 'indian-breads', name: 'Fulka', price: 30, isAvailable: true, itemId: 'bread-fulka' },
  { category: 'indian-breads', name: 'Tandoori Roti', price: 30, isAvailable: true, itemId: 'bread-tandoori-roti' },
  { category: 'indian-breads', name: 'Butter Roti', price: 40, isAvailable: true, itemId: 'bread-butter-roti' },
  { category: 'indian-breads', name: 'Garlic Roti', price: 55, isAvailable: true, itemId: 'bread-garlic-roti' },
  { category: 'indian-breads', name: 'Garlic Butter Roti', price: 70, isAvailable: true, itemId: 'bread-garlic-butter-roti' },
  { category: 'indian-breads', name: 'Naan', price: 50, isAvailable: true, itemId: 'bread-naan' },
  { category: 'indian-breads', name: 'Butter Naan', price: 60, isAvailable: true, itemId: 'bread-butter-naan' },
  { category: 'indian-breads', name: 'Garlic Naan', price: 65, isAvailable: true, itemId: 'bread-garlic-naan' },
  { category: 'indian-breads', name: 'Stuffed Paneer Naan', price: 80, isAvailable: true, itemId: 'bread-paneer-naan' },
  { category: 'indian-breads', name: 'Stuffed Aloo Naan', price: 70, isAvailable: true, itemId: 'bread-aloo-naan' },
  { category: 'indian-breads', name: 'Kulcha', price: 40, isAvailable: true, itemId: 'bread-kulcha' },
  { category: 'indian-breads', name: 'Masala Kulcha', price: 70, isAvailable: true, itemId: 'bread-masala-kulcha' },
  { category: 'indian-breads', name: 'Stuffed Paneer Kulcha', price: 90, isAvailable: true, itemId: 'bread-paneer-kulcha' },
  { category: 'indian-breads', name: 'Aloo Paratha', price: 70, isAvailable: true, itemId: 'bread-aloo-paratha' },
  { category: 'indian-breads', name: 'Paneer Paratha', price: 90, isAvailable: true, itemId: 'bread-paneer-paratha' },

  // GRAVY
  { category: 'gravy', name: 'Dal Fry', price: 140, isAvailable: true, itemId: 'gravy-dal-fry' },
  { category: 'gravy', name: 'Dal Tadka', price: 150, isAvailable: true, itemId: 'gravy-dal-tadka' },
  { category: 'gravy', name: 'Mutter Paneer Masala', price: 160, isAvailable: true, itemId: 'gravy-mutter-paneer' },
  { category: 'gravy', name: 'Aloo Mutter Masala', price: 160, isAvailable: true, itemId: 'gravy-aloo-mutter' },
  { category: 'gravy', name: 'Paneer Do Pyaza', price: 180, isAvailable: true, itemId: 'gravy-paneer-do-pyaza' },
  { category: 'gravy', name: 'Babycorn Do Pyaza', price: 160, isAvailable: true, itemId: 'gravy-babycorn-do-pyaza' },
  { category: 'gravy', name: 'Irani Mushroom', price: 160, isAvailable: true, itemId: 'gravy-irani-mushroom' },
  { category: 'gravy', name: 'Malwari Kofta', price: 170, isAvailable: true, itemId: 'gravy-malwari-kofta' },
  { category: 'gravy', name: 'Peshawari Kofta', price: 180, isAvailable: true, itemId: 'gravy-peshawari-kofta' },
  { category: 'gravy', name: 'Veg Kolapuri', price: 170, isAvailable: true, itemId: 'gravy-veg-kolapuri' },
  { category: 'gravy', name: 'Reshmi Paneer', price: 180, isAvailable: true, itemId: 'gravy-reshmi-paneer' },
  { category: 'gravy', name: 'Paneer Butter Masala', price: 180, isAvailable: true, itemId: 'gravy-paneer-butter-masala' },
  { category: 'gravy', name: 'Paneer Tikka Masala', price: 180, isAvailable: true, itemId: 'gravy-paneer-tikka-masala' },
  { category: 'gravy', name: 'Kaju Butter Masala', price: 180, isAvailable: true, itemId: 'gravy-kaju-butter-masala' },

  // CURRIES
  { category: 'curries', name: 'Kaju Paneer Butter Masala', price: 190, isAvailable: true, itemId: 'curry-kaju-paneer-butter' },
  { category: 'curries', name: 'Kadai Paneer', price: 190, isAvailable: true, itemId: 'curry-kadai-paneer' },
  { category: 'curries', name: 'Kadai Veg', price: 170, isAvailable: true, itemId: 'curry-kadai-veg' },
  { category: 'curries', name: 'Mushroom Masala', price: 160, isAvailable: true, itemId: 'curry-mushroom-masala' },
  { category: 'curries', name: 'Mushroom Kadai Masala', price: 160, isAvailable: true, itemId: 'curry-mushroom-kadai' },
  { category: 'curries', name: 'Aloo Jeera Gravy', price: 160, isAvailable: true, itemId: 'curry-aloo-jeera' },
  { category: 'curries', name: 'Paneer Bhurji Gravy', price: 180, isAvailable: true, itemId: 'curry-paneer-bhurji' },
  { category: 'curries', name: 'Achari Paneer Gravy', price: 180, isAvailable: true, itemId: 'curry-achari-paneer' },
  { category: 'curries', name: 'Shahi Paneer Gravy', price: 180, isAvailable: true, itemId: 'curry-shahi-paneer' },
  { category: 'curries', name: 'Mix Veg Curry', price: 180, isAvailable: true, itemId: 'curry-mix-veg' },
  { category: 'curries', name: 'Veg Kofta', price: 170, isAvailable: true, itemId: 'curry-veg-kofta' },
  { category: 'curries', name: 'Malai Kofta', price: 180, isAvailable: true, itemId: 'curry-malai-kofta' },
  { category: 'curries', name: 'Paneer Kofta', price: 180, isAvailable: true, itemId: 'curry-paneer-kofta' },

  // NORTH INDIAN THALI
  { category: 'north-indian-thali', name: 'North Indian Thali', price: 230, isAvailable: true, itemId: 'thali-north-indian', description: 'Salad, Starter, Papad, Roti, Poori, Dal Fry, Channa Masala, Rice, Paneer Butter Masala, Jeera Rice, Aloo Fry, Curd' },

  // RICE
  { category: 'rice', name: 'Veg Fried Rice', price: 140, isAvailable: true, itemId: 'rice-veg-fried' },
  { category: 'rice', name: 'Mushroom Fried Rice', price: 160, isAvailable: true, itemId: 'rice-mushroom-fried' },
  { category: 'rice', name: 'Schezwan Fried Rice', price: 150, isAvailable: true, itemId: 'rice-schezwan-fried' },
  { category: 'rice', name: 'Gobi Fried Rice', price: 160, isAvailable: true, itemId: 'rice-gobi-fried' },
  { category: 'rice', name: 'Paneer Fried Rice', price: 180, isAvailable: true, itemId: 'rice-paneer-fried' },
  { category: 'rice', name: 'Garlic Chilli Fried Rice', price: 160, isAvailable: true, itemId: 'rice-garlic-chilli' },
  { category: 'rice', name: 'Garlic Fried Rice', price: 160, isAvailable: true, itemId: 'rice-garlic' },
  { category: 'rice', name: 'Jeera Rice', price: 140, isAvailable: true, itemId: 'rice-jeera' },
  { category: 'rice', name: 'Ghee Rice', price: 140, isAvailable: true, itemId: 'rice-ghee' },
  { category: 'rice', name: 'Sri Lankan Fried Rice', price: 170, isAvailable: true, itemId: 'rice-sri-lankan' },
  { category: 'rice', name: 'Mixed Fried Rice', price: 170, isAvailable: true, itemId: 'rice-mixed' },
  { category: 'rice', name: 'Kaju Pulao', price: 180, isAvailable: true, itemId: 'rice-kaju-pulao' },
  { category: 'rice', name: 'Paneer Pulao', price: 180, isAvailable: true, itemId: 'rice-paneer-pulao' },
  { category: 'rice', name: 'Spl. Curd Rice', price: 140, isAvailable: true, itemId: 'rice-spl-curd' },

  // NOODLES
  { category: 'noodles', name: 'Veg Noodles', price: 150, isAvailable: true, itemId: 'noodles-veg' },
  { category: 'noodles', name: 'Schezwan Noodles', price: 160, isAvailable: true, itemId: 'noodles-schezwan' },
  { category: 'noodles', name: 'Mushroom Noodles', price: 170, isAvailable: true, itemId: 'noodles-mushroom' },
  { category: 'noodles', name: 'Schezwan Mushroom Noodles', price: 180, isAvailable: true, itemId: 'noodles-schezwan-mushroom' },
  { category: 'noodles', name: 'Gobi Noodles', price: 160, isAvailable: true, itemId: 'noodles-gobi' },
  { category: 'noodles', name: 'Schezwan Gobi Noodles', price: 170, isAvailable: true, itemId: 'noodles-schezwan-gobi' },
  { category: 'noodles', name: 'Paneer Noodles', price: 180, isAvailable: true, itemId: 'noodles-paneer' },
  { category: 'noodles', name: 'Schezwan Paneer Noodles', price: 190, isAvailable: true, itemId: 'noodles-schezwan-paneer' },
  { category: 'noodles', name: 'Mixed Veg Noodles', price: 180, isAvailable: true, itemId: 'noodles-mixed-veg' },
  { category: 'noodles', name: 'Garlic Chilli Noodles', price: 170, isAvailable: true, itemId: 'noodles-garlic-chilli' },

  // NUTTY STREET
  { category: 'nutty-street', name: 'Nutty Crunch', price: 100, isAvailable: true, itemId: 'nutty-crunch' },
  { category: 'nutty-street', name: 'Nutty Mania', price: 100, isAvailable: true, itemId: 'nutty-mania' },
  { category: 'nutty-street', name: 'Mixed Nut Sundae', price: 130, isAvailable: true, itemId: 'nutty-mixed-sundae' },
  { category: 'nutty-street', name: 'Butterscotch', price: 120, isAvailable: true, itemId: 'nutty-butterscotch' },
  { category: 'nutty-street', name: 'Melting Moment', price: 130, isAvailable: true, itemId: 'nutty-melting-moment' },
  { category: 'nutty-street', name: 'Rainbow Fiddle', price: 130, isAvailable: true, itemId: 'nutty-rainbow-fiddle' },

  // JELLY STREET
  { category: 'jelly-street', name: 'Strawberry Jello Sundae', price: 160, isAvailable: true, itemId: 'jelly-strawberry-sundae' },
  { category: 'jelly-street', name: 'Pineapple Sundae', price: 160, isAvailable: true, itemId: 'jelly-pineapple-sundae' },
  { category: 'jelly-street', name: 'Double Jello Sundae', price: 170, isAvailable: true, itemId: 'jelly-double-jello' },

  // SPECIAL STREET
  { category: 'special-street', name: 'Night & Day', price: 170, isAvailable: true, itemId: 'special-night-day' },
  { category: 'special-street', name: 'Tall Beauty', price: 180, isAvailable: true, itemId: 'special-tall-beauty' },
  { category: 'special-street', name: 'Titanic Boat', price: 180, isAvailable: true, itemId: 'special-titanic-boat' },

  // ROYAL STREET
  { category: 'royal-street', name: 'Chocolate Sundae', price: 140, isAvailable: true, itemId: 'royal-chocolate-sundae' },
  { category: 'royal-street', name: 'Oreo Fudge', price: 160, isAvailable: true, itemId: 'royal-oreo-fudge' },
  { category: 'royal-street', name: 'Badam E Kash', price: 160, isAvailable: true, itemId: 'royal-badam-e-kash' },
  { category: 'royal-street', name: 'Spl. Dry Fruit Sundae', price: 170, isAvailable: true, itemId: 'royal-dry-fruit-sundae' },
  { category: 'royal-street', name: 'Blackcurrant Almond Sundae', price: 170, isAvailable: true, itemId: 'royal-blackcurrant-almond' },
  { category: 'royal-street', name: 'Butterscotch Caramel', price: 180, isAvailable: true, itemId: 'royal-butterscotch-caramel' },
  { category: 'royal-street', name: 'Mixed Fruit Caramel', price: 170, isAvailable: true, itemId: 'royal-mixed-fruit-caramel' },
  { category: 'royal-street', name: 'Strawberry Mango Tango', price: 170, isAvailable: true, itemId: 'royal-strawberry-mango' },

  // DELIGHTS – 99
  { category: 'delights-99', name: 'Black Currant Delight', price: 99, isAvailable: true, itemId: 'delight-black-currant' },
  { category: 'delights-99', name: 'Fruit Delight', price: 99, isAvailable: true, itemId: 'delight-fruit' },
  { category: 'delights-99', name: 'Pineapple Delight', price: 99, isAvailable: true, itemId: 'delight-pineapple' },
  { category: 'delights-99', name: 'Mango Delight', price: 99, isAvailable: true, itemId: 'delight-mango' },
  { category: 'delights-99', name: 'Pista Delight', price: 99, isAvailable: true, itemId: 'delight-pista' },
  { category: 'delights-99', name: 'Badam Delight', price: 99, isAvailable: true, itemId: 'delight-badam' },
  { category: 'delights-99', name: 'Choco Crunch', price: 99, isAvailable: true, itemId: 'delight-choco-crunch' },
  { category: 'delights-99', name: 'Choco Caramel', price: 99, isAvailable: true, itemId: 'delight-choco-caramel' },

  // SOFTIES WITH CAKE
  { category: 'softies-with-cake', name: 'Death By Brownie', price: 180, isAvailable: true, itemId: 'softies-death-by-brownie' },
  { category: 'softies-with-cake', name: 'Chocolate Dream', price: 180, isAvailable: true, itemId: 'softies-chocolate-dream' },
  { category: 'softies-with-cake', name: 'Truffle Mania', price: 180, isAvailable: true, itemId: 'softies-truffle-mania' },

  // FALOODA
  { category: 'falooda', name: 'Classic Falooda', price: 130, isAvailable: true, itemId: 'falooda-classic' },
  { category: 'falooda', name: 'Fruit Falooda', price: 150, isAvailable: true, itemId: 'falooda-fruit' },
  { category: 'falooda', name: 'Rose Falooda', price: 150, isAvailable: true, itemId: 'falooda-rose' },
  { category: 'falooda', name: 'Strawberry Falooda', price: 150, isAvailable: true, itemId: 'falooda-strawberry' },
  { category: 'falooda', name: 'Dry Fruit Falooda', price: 180, isAvailable: true, itemId: 'falooda-dry-fruit' },
  { category: 'falooda', name: 'Kesar Falooda', price: 150, isAvailable: true, itemId: 'falooda-kesar' },

  // ROYAL SHAKES
  { category: 'royal-shakes', name: 'Royal Badam Pista', price: 160, isAvailable: true, itemId: 'royal-shake-badam-pista' },
  { category: 'royal-shakes', name: 'Hazelnut', price: 170, isAvailable: true, itemId: 'royal-shake-hazelnut' },
  { category: 'royal-shakes', name: 'Oreo', price: 170, isAvailable: true, itemId: 'royal-shake-oreo' },
  { category: 'royal-shakes', name: 'Kit-Kat', price: 170, isAvailable: true, itemId: 'royal-shake-kitkat' },
  { category: 'royal-shakes', name: 'Kit-Kat Brownie', price: 180, isAvailable: true, itemId: 'royal-shake-kitkat-brownie' },

  // MILK SHAKES
  { category: 'milk-shakes', name: 'Vanilla', price: 130, isAvailable: true, itemId: 'milk-vanilla' },
  { category: 'milk-shakes', name: 'Rose', price: 140, isAvailable: true, itemId: 'milk-rose' },
  { category: 'milk-shakes', name: 'Chocolate', price: 140, isAvailable: true, itemId: 'milk-chocolate' },
  { category: 'milk-shakes', name: 'Butterscotch', price: 140, isAvailable: true, itemId: 'milk-butterscotch' },
  { category: 'milk-shakes', name: 'Coffee', price: 130, isAvailable: true, itemId: 'milk-coffee' },
  { category: 'milk-shakes', name: 'Badam', price: 150, isAvailable: true, itemId: 'milk-badam' },
  { category: 'milk-shakes', name: 'Pista', price: 150, isAvailable: true, itemId: 'milk-pista' },
  { category: 'milk-shakes', name: 'Gulkand', price: 140, isAvailable: true, itemId: 'milk-gulkand' },
  { category: 'milk-shakes', name: 'Bubble Gum', price: 140, isAvailable: true, itemId: 'milk-bubble-gum' },
  { category: 'milk-shakes', name: 'Strawberry', price: 160, isAvailable: true, itemId: 'milk-strawberry' },
  { category: 'milk-shakes', name: 'Mango', price: 160, isAvailable: true, itemId: 'milk-mango' },
  { category: 'milk-shakes', name: 'Blueberry', price: 160, isAvailable: true, itemId: 'milk-blueberry' },
  { category: 'milk-shakes', name: 'Blackcurrant', price: 160, isAvailable: true, itemId: 'milk-blackcurrant' },
  { category: 'milk-shakes', name: 'Lichee', price: 160, isAvailable: true, itemId: 'milk-lichee' },
  { category: 'milk-shakes', name: 'Pineapple', price: 160, isAvailable: true, itemId: 'milk-pineapple' },

  // MOJITOS
  { category: 'mojitos', name: 'Deep Blue Sea', price: 110, isAvailable: true, itemId: 'mojito-deep-blue-sea' },
  { category: 'mojitos', name: 'Mint Lemon', price: 110, isAvailable: true, itemId: 'mojito-mint-lemon' },
  { category: 'mojitos', name: 'Lemon Soda', price: 100, isAvailable: true, itemId: 'mojito-lemon-soda' },
  { category: 'mojitos', name: 'Mango Mule', price: 100, isAvailable: true, itemId: 'mojito-mango-mule' },
  { category: 'mojitos', name: 'Jal Jeera', price: 100, isAvailable: true, itemId: 'mojito-jal-jeera' },
  { category: 'mojitos', name: 'Berry Burleque', price: 120, isAvailable: true, itemId: 'mojito-berry-burleque' },
  { category: 'mojitos', name: 'Pinky Blue Berry', price: 110, isAvailable: true, itemId: 'mojito-pinky-blue-berry' }
];

/**
 * Seed the database with menu items
 */
const seedMenu = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }

    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB Atlas');

    // Check if reset flag is set (RESET_MENU=true)
    const shouldReset = process.env.RESET_MENU === 'true';
    
    if (shouldReset) {
      console.log('🗑️  Deleting existing menu items...');
      const deleteResult = await MenuItem.deleteMany({});
      console.log(`✅ Deleted ${deleteResult.deletedCount} existing menu items`);
    } else {
      // Check for existing items
      const existingCount = await MenuItem.countDocuments();
      if (existingCount > 0) {
        console.log(`⚠️  Found ${existingCount} existing menu items in database`);
        console.log('💡 To reset and re-seed, run: RESET_MENU=true npm run seed:menu');
        console.log('📝 Attempting to insert new items (duplicates will be skipped)...');
      }
    }

    // Insert menu items (will skip duplicates if itemId already exists)
    console.log(`📝 Inserting ${MENU_ITEMS.length} menu items...`);
    let insertedCount = 0;
    let skippedCount = 0;
    
    for (const item of MENU_ITEMS) {
      try {
        await MenuItem.findOneAndUpdate(
          { itemId: item.itemId },
          item,
          { upsert: true, new: true }
        );
        insertedCount++;
      } catch (error) {
        if (error.code === 11000) {
          skippedCount++;
        } else {
          throw error;
        }
      }
    }
    
    console.log(`✅ Successfully processed ${insertedCount} menu items`);
    if (skippedCount > 0) {
      console.log(`⏭️  Skipped ${skippedCount} duplicate items`);
    }
    console.log(`📊 Total menu items in database: ${await MenuItem.countDocuments()}`);

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding menu:', error);
    
    // Handle duplicate key errors gracefully
    if (error.code === 11000) {
      console.error('⚠️  Some items already exist. Use deleteMany() first to reset, or update items individually.');
    }
    
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the seed function
seedMenu();

