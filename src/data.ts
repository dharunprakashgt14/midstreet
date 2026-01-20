import type { MenuCategory, MenuItem } from "./types";

export const CATEGORIES: MenuCategory[] = [
  { id: "pizza", label: "Pizza" },
  { id: "pav-bhaji", label: "Pav Bhaji" },
  { id: "burger", label: "Burger" },
  { id: "garlic-toast", label: "Garlic Toast" },
  { id: "sandwich", label: "Sandwich" },
  { id: "finger-foods", label: "Finger Foods" },
  { id: "momos", label: "Momos" },
  { id: "chaats", label: "Chaats" },
  { id: "thatu-vadai-set", label: "Thatu Vadai Set" },
  { id: "soup", label: "Soup" },
  { id: "starters", label: "Starters" },
  { id: "special-starters", label: "Special Starters" },
  { id: "sizzler", label: "Sizzler" },
  { id: "tandoori-hariyali", label: "Tandoori / Hariyali" },
  { id: "indian-breads", label: "Indian Breads" },
  { id: "gravy", label: "Gravy" },
  { id: "curries", label: "Curries" },
  { id: "north-indian-thali", label: "North Indian Thali" },
  { id: "rice", label: "Rice" },
  { id: "noodles", label: "Noodles" },
  { id: "nutty-street", label: "Nutty Street" },
  { id: "jelly-street", label: "Jelly Street" },
  { id: "special-street", label: "Special Street" },
  { id: "royal-street", label: "Royal Street" },
  { id: "delights-99", label: "Delights – 99" },
  { id: "softies-with-cake", label: "Softies with Cake" },
  { id: "falooda", label: "Falooda" },
  { id: "royal-shakes", label: "Royal Shakes" },
  { id: "milk-shakes", label: "Milk Shakes" },
  { id: "mojitos", label: "Mojitos" }
];

// Final menu configuration for Mid Street – do not change without intention.
export const MENU_ITEMS: MenuItem[] = [
  // PIZZA
  {
    id: "pizza-margherita",
    name: "Margherita Pizza",
    description: "",
    price: 160,
    categoryId: "pizza",
    isAvailable: true
  },
  {
    id: "pizza-love-paneer",
    name: "Love with Paneer",
    description: "",
    price: 190,
    categoryId: "pizza",
    isAvailable: true
  },
  {
    id: "pizza-love-corn",
    name: "Love with Corn",
    description: "",
    price: 180,
    categoryId: "pizza",
    isAvailable: true
  },
  {
    id: "pizza-love-spicy",
    name: "Love with Spicy",
    description: "",
    price: 170,
    categoryId: "pizza",
    isAvailable: true
  },
  {
    id: "pizza-love-mushy",
    name: "Love with Mushy",
    description: "",
    price: 180,
    categoryId: "pizza",
    isAvailable: true
  },
  {
    id: "pizza-paneer-babycorn",
    name: "Paneer Babycorn",
    description: "",
    price: 200,
    categoryId: "pizza",
    isAvailable: true
  },
  {
    id: "pizza-all-veg",
    name: "All Veg Pizza",
    description: "",
    price: 220,
    categoryId: "pizza",
    isAvailable: true
  },

  // PAV BHAJI
  { id: "pav-bhaji-plain", name: "Pav Bhaji", description: "", price: 100, categoryId: "pav-bhaji", isAvailable: true },
  { id: "pav-bhaji-vada", name: "Vada Pav", description: "", price: 80, categoryId: "pav-bhaji", isAvailable: true },
  { id: "pav-bhaji-cheese-vada", name: "Cheese Vada Pav", description: "", price: 100, categoryId: "pav-bhaji", isAvailable: true },
  { id: "pav-bhaji-paneer-pav", name: "Paneer Pav", description: "", price: 110, categoryId: "pav-bhaji", isAvailable: true },
  { id: "pav-bhaji-mushroom-pav", name: "Mushroom Pav", description: "", price: 100, categoryId: "pav-bhaji", isAvailable: true },
  { id: "pav-bhaji-cheese-pav-bhaji", name: "Cheese Pav Bhaji", description: "", price: 120, categoryId: "pav-bhaji", isAvailable: true },
  { id: "pav-bhaji-fried", name: "Fried Pav Bhaji", description: "", price: 130, categoryId: "pav-bhaji", isAvailable: true },

  // BURGER
  { id: "burger-veg", name: "Veg Burger", description: "", price: 140, categoryId: "burger", isAvailable: true },
  { id: "burger-veg-cheese", name: "Veg Cheese Burger", description: "", price: 160, categoryId: "burger", isAvailable: true },
  { id: "burger-paneer", name: "Paneer Burger", description: "", price: 170, categoryId: "burger", isAvailable: true },
  { id: "burger-veg-cutlet", name: "Veg Cutlet Burger", description: "", price: 160, categoryId: "burger", isAvailable: true },
  { id: "burger-aloo-tikki", name: "Aloo Tikki Burger", description: "", price: 150, categoryId: "burger", isAvailable: true },
  { id: "burger-double-deck", name: "Double Deck Burger", description: "", price: 170, categoryId: "burger", isAvailable: true },
  { id: "burger-midstreet-special", name: "Midstreet Special Burger", description: "", price: 190, categoryId: "burger", isAvailable: true },

  // GARLIC TOAST
  { id: "garlic-toast-plain", name: "Garlic Toast", description: "", price: 110, categoryId: "garlic-toast", isAvailable: true },
  { id: "garlic-toast-cheese", name: "Cheese Garlic Toast", description: "", price: 120, categoryId: "garlic-toast", isAvailable: true },
  { id: "garlic-toast-chilli-cheese", name: "Chilli Cheese Toast", description: "", price: 120, categoryId: "garlic-toast", isAvailable: true },
  { id: "garlic-toast-paneer", name: "Paneer Garlic Toast", description: "", price: 150, categoryId: "garlic-toast", isAvailable: true },
  { id: "garlic-toast-mushroom", name: "Mushroom Garlic Toast", description: "", price: 150, categoryId: "garlic-toast", isAvailable: true },
  { id: "garlic-toast-corn", name: "Corn Garlic Toast", description: "", price: 140, categoryId: "garlic-toast", isAvailable: true },
  { id: "garlic-toast-paneer-corn", name: "Paneer Corn Toast", description: "", price: 150, categoryId: "garlic-toast", isAvailable: true },

  // SANDWICH
  { id: "sandwich-veg", name: "Veg SW", description: "", price: 130, categoryId: "sandwich", isAvailable: true },
  { id: "sandwich-corn", name: "Corn SW", description: "", price: 130, categoryId: "sandwich", isAvailable: true },
  { id: "sandwich-mushroom", name: "Mushroom SW", description: "", price: 140, categoryId: "sandwich", isAvailable: true },
  { id: "sandwich-nutella", name: "Nutella SW", description: "", price: 150, categoryId: "sandwich", isAvailable: true },
  { id: "sandwich-choco-grilled", name: "Choco Grilled SW", description: "", price: 150, categoryId: "sandwich", isAvailable: true },
  { id: "sandwich-paneer-tikka", name: "Paneer Tikka SW", description: "", price: 160, categoryId: "sandwich", isAvailable: true },
  { id: "sandwich-double-cheese", name: "Double Cheese SW", description: "", price: 160, categoryId: "sandwich", isAvailable: true },
  { id: "sandwich-double-deck", name: "Double Deck SW", description: "", price: 160, categoryId: "sandwich", isAvailable: true },
  { id: "sandwich-triple-deck", name: "Triple Deck SW", description: "", price: 180, categoryId: "sandwich", isAvailable: true },
  { id: "sandwich-paneer-corn", name: "Paneer Corn SW", description: "", price: 160, categoryId: "sandwich", isAvailable: true },
  { id: "sandwich-mid-special", name: "Mid Special SW", description: "", price: 180, categoryId: "sandwich", isAvailable: true },

  // FINGER FOODS
  { id: "finger-classic-fries", name: "Classic Fries", description: "", price: 100, categoryId: "finger-foods", isAvailable: true },
  { id: "finger-peri-peri-fries", name: "Peri Peri Fries", description: "", price: 110, categoryId: "finger-foods", isAvailable: true },
  { id: "finger-smileys", name: "Smileys", description: "", price: 110, categoryId: "finger-foods", isAvailable: true },
  { id: "finger-mayo-fries", name: "Mayo Fries", description: "", price: 110, categoryId: "finger-foods", isAvailable: true },
  { id: "finger-nuggets", name: "Nuggets", description: "", price: 100, categoryId: "finger-foods", isAvailable: true },
  { id: "finger-cheesy-fries", name: "Cheesy Fries", description: "", price: 120, categoryId: "finger-foods", isAvailable: true },
  { id: "finger-tandoori-fries", name: "Tandoori Fries", description: "", price: 110, categoryId: "finger-foods", isAvailable: true },
  { id: "finger-cheesy-corn-nuggets", name: "Cheesy Corn Nuggets", description: "", price: 120, categoryId: "finger-foods", isAvailable: true },
  { id: "finger-loaded-fries", name: "Loaded Fries", description: "", price: 140, categoryId: "finger-foods", isAvailable: true },

  // MOMOS
  { id: "momos-paneer", name: "Paneer Momos", description: "", price: 120, categoryId: "momos", isAvailable: true },
  { id: "momos-paneer-tikka", name: "Paneer Tikka Momos", description: "", price: 130, categoryId: "momos", isAvailable: true },
  { id: "momos-corn", name: "Corn Momos", description: "", price: 100, categoryId: "momos", isAvailable: true },
  { id: "momos-corn-cheese", name: "Corn and Cheese Momos", description: "", price: 120, categoryId: "momos", isAvailable: true },
  { id: "momos-mushroom", name: "Mushroom Momos", description: "", price: 110, categoryId: "momos", isAvailable: true },
  { id: "momos-veg-sez", name: "Veg Sez Momos", description: "", price: 110, categoryId: "momos", isAvailable: true },
  { id: "momos-veg", name: "Veg Momos", description: "", price: 100, categoryId: "momos", isAvailable: true },
  { id: "momos-tandoori", name: "Tandoori Momos", description: "", price: 130, categoryId: "momos", isAvailable: true },
  { id: "momos-choco", name: "Choco Momos", description: "", price: 130, categoryId: "momos", isAvailable: true },

  // CHAATS
  { id: "chaat-pani-poori", name: "Pani Poori", description: "", price: 80, categoryId: "chaats", isAvailable: true },
  { id: "chaat-papadi", name: "Papadi Chaat", description: "", price: 90, categoryId: "chaats", isAvailable: true },
  { id: "chaat-sev-poori", name: "Sev Poori", description: "", price: 90, categoryId: "chaats", isAvailable: true },
  { id: "chaat-bhel-poori", name: "Bhel Poori", description: "", price: 90, categoryId: "chaats", isAvailable: true },
  { id: "chaat-dahi-papadi", name: "Dahi Papadi", description: "", price: 100, categoryId: "chaats", isAvailable: true },
  { id: "chaat-dahi-poori", name: "Dahi Poori", description: "", price: 90, categoryId: "chaats", isAvailable: true },
  { id: "chaat-channa-masala", name: "Channa Masala", description: "", price: 100, categoryId: "chaats", isAvailable: true },
  { id: "chaat-cheese-bhel", name: "Cheese Bhel Poori", description: "", price: 110, categoryId: "chaats", isAvailable: true },
  { id: "chaat-cutlet-channa", name: "Cutlet Channa", description: "", price: 110, categoryId: "chaats", isAvailable: true },
  { id: "chaat-masala-poori", name: "Masala Poori", description: "", price: 100, categoryId: "chaats", isAvailable: true },
  { id: "chaat-corn-bhel", name: "Corn Bhel Poori", description: "", price: 110, categoryId: "chaats", isAvailable: true },
  { id: "chaat-corn-chaat", name: "Corn Chaat", description: "", price: 120, categoryId: "chaats", isAvailable: true },
  { id: "chaat-aloo-tikki", name: "Aloo Tikki Chaat", description: "", price: 100, categoryId: "chaats", isAvailable: true },
  { id: "chaat-bread-channa", name: "Bread Channa", description: "", price: 90, categoryId: "chaats", isAvailable: true },
  { id: "chaat-mixed", name: "Mixed Chaat", description: "", price: 120, categoryId: "chaats", isAvailable: true },

  // THATU VADAI SET
  { id: "thatu-plain-set", name: "Plain Set", description: "", price: 80, categoryId: "thatu-vadai-set", isAvailable: true },
  { id: "thatu-tomato-set", name: "Tomato Set", description: "", price: 90, categoryId: "thatu-vadai-set", isAvailable: true },
  { id: "thatu-cucumber-set", name: "Cucumber Set", description: "", price: 90, categoryId: "thatu-vadai-set", isAvailable: true },
  { id: "thatu-dahi-set", name: "Dahi Set", description: "", price: 90, categoryId: "thatu-vadai-set", isAvailable: true },
  { id: "thatu-cheese-set", name: "Cheese Set", description: "", price: 100, categoryId: "thatu-vadai-set", isAvailable: true },
  { id: "thatu-mixed-combo-set", name: "Mixed Combo Set", description: "", price: 100, categoryId: "thatu-vadai-set", isAvailable: true },
  { id: "thatu-plain-norukkal", name: "Plain Norukkal", description: "", price: 80, categoryId: "thatu-vadai-set", isAvailable: true },
  { id: "thatu-tomato-norukkal", name: "Tomato Norukkal", description: "", price: 90, categoryId: "thatu-vadai-set", isAvailable: true },
  { id: "thatu-dahi-norukkal", name: "Dahi Norukkal", description: "", price: 90, categoryId: "thatu-vadai-set", isAvailable: true },
  { id: "thatu-mixed-norukkal", name: "Mixed Norukkal", description: "", price: 100, categoryId: "thatu-vadai-set", isAvailable: true },
  { id: "thatu-dahi-peanut", name: "Dahi Peanut", description: "", price: 110, categoryId: "thatu-vadai-set", isAvailable: true },

  // SOUP
  { id: "soup-veg", name: "Veg Soup", description: "", price: 70, categoryId: "soup", isAvailable: true },
  { id: "soup-veg-clear", name: "Veg Clear Soup", description: "", price: 70, categoryId: "soup", isAvailable: true },
  { id: "soup-veg-noodles", name: "Veg Noodles Soup", description: "", price: 80, categoryId: "soup", isAvailable: true },
  { id: "soup-tomato", name: "Tomato Soup", description: "", price: 90, categoryId: "soup", isAvailable: true },
  { id: "soup-lime-coriander", name: "Lime & Coriander Soup", description: "", price: 80, categoryId: "soup", isAvailable: true },
  { id: "soup-sweet-corn", name: "Sweet Corn Soup", description: "", price: 80, categoryId: "soup", isAvailable: true },
  { id: "soup-hot-sour", name: "Hot & Sour Soup", description: "", price: 80, categoryId: "soup", isAvailable: true },
  { id: "soup-manchow", name: "Manchow Soup", description: "", price: 90, categoryId: "soup", isAvailable: true },
  { id: "soup-mushroom", name: "Mushroom Soup", description: "", price: 90, categoryId: "soup", isAvailable: true },

  // STARTERS
  { id: "starter-veg-manchurian", name: "Veg Manchurian", description: "", price: 160, categoryId: "starters", isAvailable: true },
  { id: "starter-gobi-manchurian", name: "Gobi Manchurian", description: "", price: 160, categoryId: "starters", isAvailable: true },
  { id: "starter-babycorn-manchurian", name: "Baby Corn Manchurian", description: "", price: 160, categoryId: "starters", isAvailable: true },
  { id: "starter-paneer-manchurian", name: "Paneer Manchurian", description: "", price: 180, categoryId: "starters", isAvailable: true },
  { id: "starter-mushroom-manchurian", name: "Mushroom Manchurian", description: "", price: 160, categoryId: "starters", isAvailable: true },
  { id: "starter-aloo-manchurian", name: "Aloo Manchurian", description: "", price: 140, categoryId: "starters", isAvailable: true },
  { id: "starter-mixed-veg-manchurian", name: "Mixed Veg Manchurian", description: "", price: 180, categoryId: "starters", isAvailable: true },
  { id: "starter-gobi-65", name: "Gobi 65", description: "", price: 130, categoryId: "starters", isAvailable: true },
  { id: "starter-paneer-65", name: "Paneer 65", description: "", price: 150, categoryId: "starters", isAvailable: true },
  { id: "starter-mushroom-65", name: "Mushroom 65", description: "", price: 140, categoryId: "starters", isAvailable: true },
  { id: "starter-babycorn-65", name: "Baby Corn 65", description: "", price: 140, categoryId: "starters", isAvailable: true },
  { id: "starter-aloo-65", name: "Aloo 65", description: "", price: 120, categoryId: "starters", isAvailable: true },
  { id: "starter-golden-babycorn", name: "Golden Fried Babycorn", description: "", price: 140, categoryId: "starters", isAvailable: true },
  { id: "starter-golden-paneer", name: "Golden Fried Paneer", description: "", price: 150, categoryId: "starters", isAvailable: true },
  { id: "starter-golden-gobi", name: "Golden Fried Gobi", description: "", price: 130, categoryId: "starters", isAvailable: true },
  { id: "starter-honey-paneer-chilli", name: "Honey Paneer Chilli", description: "", price: 180, categoryId: "starters", isAvailable: true },
  { id: "starter-honey-babycorn-chilli", name: "Honey Babycorn Chilli", description: "", price: 170, categoryId: "starters", isAvailable: true },
  { id: "starter-honey-mushroom-chilli", name: "Honey Mushroom Chilli", description: "", price: 160, categoryId: "starters", isAvailable: true },
  { id: "starter-mushroom-pepper-fry", name: "Mushroom Pepper Fry", description: "", price: 160, categoryId: "starters", isAvailable: true },
  { id: "starter-paneer-pepper-fry", name: "Paneer Pepper Fry", description: "", price: 180, categoryId: "starters", isAvailable: true },
  { id: "starter-gobi-pepper-fry", name: "Gobi Pepper Fry", description: "", price: 150, categoryId: "starters", isAvailable: true },
  { id: "starter-dragon-babycorn", name: "Dragon Fried Babycorn", description: "", price: 180, categoryId: "starters", isAvailable: true },
  { id: "starter-dragon-paneer", name: "Dragon Fried Paneer", description: "", price: 190, categoryId: "starters", isAvailable: true },
  { id: "starter-dragon-gobi", name: "Dragon Fried Gobi", description: "", price: 200, categoryId: "starters", isAvailable: true },

  // SPECIAL STARTERS
  { id: "special-mushroom-maharani", name: "Mushroom Maharani", description: "", price: 180, categoryId: "special-starters", isAvailable: true },
  { id: "special-mushroom-hot-pepper", name: "Mushroom Hot Pepper", description: "", price: 180, categoryId: "special-starters", isAvailable: true },
  { id: "special-paneer-maharani", name: "Paneer Maharani", description: "", price: 190, categoryId: "special-starters", isAvailable: true },
  { id: "special-paneer-hot-pepper", name: "Paneer Hot Pepper", description: "", price: 190, categoryId: "special-starters", isAvailable: true },
  { id: "special-japan-paneer", name: "Japan Paneer", description: "", price: 200, categoryId: "special-starters", isAvailable: true },
  { id: "special-japan-mushroom", name: "Japan Mushroom", description: "", price: 190, categoryId: "special-starters", isAvailable: true },
  { id: "special-ghee-podi-paneer", name: "Ghee Podi Paneer", description: "", price: 200, categoryId: "special-starters", isAvailable: true },
  { id: "special-ghee-podi-mushroom", name: "Ghee Podi Mushroom", description: "", price: 190, categoryId: "special-starters", isAvailable: true },
  { id: "special-mushroom-pallipalayam", name: "Mushroom Pallipalayam", description: "", price: 160, categoryId: "special-starters", isAvailable: true },
  { id: "special-mushroom-nallampatti", name: "Mushroom Nallampatti", description: "", price: 160, categoryId: "special-starters", isAvailable: true },

  // SIZZLER
  { id: "sizzler-aloo-veg", name: "Aloo Veg Siz", description: "", price: 250, categoryId: "sizzler", isAvailable: true },
  { id: "sizzler-gobi-manchurian", name: "Gobi Manchurian Siz", description: "", price: 250, categoryId: "sizzler", isAvailable: true },
  { id: "sizzler-mushroom-babycorn", name: "Mushroom Babycorn Siz", description: "", price: 250, categoryId: "sizzler", isAvailable: true },
  { id: "sizzler-paneer-tikka", name: "Paneer Tikka Siz", description: "", price: 260, categoryId: "sizzler", isAvailable: true },
  { id: "sizzler-chilli-paneer", name: "Chilli Paneer Siz", description: "", price: 260, categoryId: "sizzler", isAvailable: true },
  { id: "sizzler-crispy-paneer", name: "Crispy Paneer Siz", description: "", price: 260, categoryId: "sizzler", isAvailable: true },
  { id: "sizzler-all-veg", name: "All Veg Siz", description: "", price: 260, categoryId: "sizzler", isAvailable: true },
  { id: "sizzler-spl-jain", name: "Spl. Jain Siz", description: "", price: 260, categoryId: "sizzler", isAvailable: true },

  // TANDOORI / HARIYALI
  { id: "tandoori-paneer-tikka", name: "Paneer Tikka", description: "", price: 180, categoryId: "tandoori-hariyali", isAvailable: true },
  { id: "tandoori-schezwan-paneer-tikka", name: "Schezwan Paneer Tikka", description: "", price: 190, categoryId: "tandoori-hariyali", isAvailable: true },
  { id: "tandoori-mushroom-tikka", name: "Mushroom Tikka", description: "", price: 160, categoryId: "tandoori-hariyali", isAvailable: true },

  // INDIAN BREADS
  { id: "bread-fulka", name: "Fulka", description: "", price: 30, categoryId: "indian-breads", isAvailable: true },
  { id: "bread-tandoori-roti", name: "Tandoori Roti", description: "", price: 30, categoryId: "indian-breads", isAvailable: true },
  { id: "bread-butter-roti", name: "Butter Roti", description: "", price: 40, categoryId: "indian-breads", isAvailable: true },
  { id: "bread-garlic-roti", name: "Garlic Roti", description: "", price: 55, categoryId: "indian-breads", isAvailable: true },
  { id: "bread-garlic-butter-roti", name: "Garlic Butter Roti", description: "", price: 70, categoryId: "indian-breads", isAvailable: true },
  { id: "bread-naan", name: "Naan", description: "", price: 50, categoryId: "indian-breads", isAvailable: true },
  { id: "bread-butter-naan", name: "Butter Naan", description: "", price: 60, categoryId: "indian-breads", isAvailable: true },
  { id: "bread-garlic-naan", name: "Garlic Naan", description: "", price: 65, categoryId: "indian-breads", isAvailable: true },
  { id: "bread-paneer-naan", name: "Stuffed Paneer Naan", description: "", price: 80, categoryId: "indian-breads", isAvailable: true },
  { id: "bread-aloo-naan", name: "Stuffed Aloo Naan", description: "", price: 70, categoryId: "indian-breads", isAvailable: true },
  { id: "bread-kulcha", name: "Kulcha", description: "", price: 40, categoryId: "indian-breads", isAvailable: true },
  { id: "bread-masala-kulcha", name: "Masala Kulcha", description: "", price: 70, categoryId: "indian-breads", isAvailable: true },
  { id: "bread-paneer-kulcha", name: "Stuffed Paneer Kulcha", description: "", price: 90, categoryId: "indian-breads", isAvailable: true },
  { id: "bread-aloo-paratha", name: "Aloo Paratha", description: "", price: 70, categoryId: "indian-breads", isAvailable: true },
  { id: "bread-paneer-paratha", name: "Paneer Paratha", description: "", price: 90, categoryId: "indian-breads", isAvailable: true },

  // GRAVY
  { id: "gravy-dal-fry", name: "Dal Fry", description: "", price: 140, categoryId: "gravy", isAvailable: true },
  { id: "gravy-dal-tadka", name: "Dal Tadka", description: "", price: 150, categoryId: "gravy", isAvailable: true },
  { id: "gravy-mutter-paneer", name: "Mutter Paneer Masala", description: "", price: 160, categoryId: "gravy", isAvailable: true },
  { id: "gravy-aloo-mutter", name: "Aloo Mutter Masala", description: "", price: 160, categoryId: "gravy", isAvailable: true },
  { id: "gravy-paneer-do-pyaza", name: "Paneer Do Pyaza", description: "", price: 180, categoryId: "gravy", isAvailable: true },
  { id: "gravy-babycorn-do-pyaza", name: "Babycorn Do Pyaza", description: "", price: 160, categoryId: "gravy", isAvailable: true },
  { id: "gravy-irani-mushroom", name: "Irani Mushroom", description: "", price: 160, categoryId: "gravy", isAvailable: true },
  { id: "gravy-malwari-kofta", name: "Malwari Kofta", description: "", price: 170, categoryId: "gravy", isAvailable: true },
  { id: "gravy-peshawari-kofta", name: "Peshawari Kofta", description: "", price: 180, categoryId: "gravy", isAvailable: true },
  { id: "gravy-veg-kolapuri", name: "Veg Kolapuri", description: "", price: 170, categoryId: "gravy", isAvailable: true },
  { id: "gravy-reshmi-paneer", name: "Reshmi Paneer", description: "", price: 180, categoryId: "gravy", isAvailable: true },
  { id: "gravy-paneer-butter-masala", name: "Paneer Butter Masala", description: "", price: 180, categoryId: "gravy", isAvailable: true },
  { id: "gravy-paneer-tikka-masala", name: "Paneer Tikka Masala", description: "", price: 180, categoryId: "gravy", isAvailable: true },
  { id: "gravy-kaju-butter-masala", name: "Kaju Butter Masala", description: "", price: 180, categoryId: "gravy", isAvailable: true },

  // CURRIES
  { id: "curry-kaju-paneer-butter", name: "Kaju Paneer Butter Masala", description: "", price: 190, categoryId: "curries", isAvailable: true },
  { id: "curry-kadai-paneer", name: "Kadai Paneer", description: "", price: 190, categoryId: "curries", isAvailable: true },
  { id: "curry-kadai-veg", name: "Kadai Veg", description: "", price: 170, categoryId: "curries", isAvailable: true },
  { id: "curry-mushroom-masala", name: "Mushroom Masala", description: "", price: 160, categoryId: "curries", isAvailable: true },
  { id: "curry-mushroom-kadai", name: "Mushroom Kadai Masala", description: "", price: 160, categoryId: "curries", isAvailable: true },
  { id: "curry-aloo-jeera", name: "Aloo Jeera Gravy", description: "", price: 160, categoryId: "curries", isAvailable: true },
  { id: "curry-paneer-bhurji", name: "Paneer Bhurji Gravy", description: "", price: 180, categoryId: "curries", isAvailable: true },
  { id: "curry-achari-paneer", name: "Achari Paneer Gravy", description: "", price: 180, categoryId: "curries", isAvailable: true },
  { id: "curry-shahi-paneer", name: "Shahi Paneer Gravy", description: "", price: 180, categoryId: "curries", isAvailable: true },
  { id: "curry-mix-veg", name: "Mix Veg Curry", description: "", price: 180, categoryId: "curries", isAvailable: true },
  { id: "curry-veg-kofta", name: "Veg Kofta", description: "", price: 170, categoryId: "curries", isAvailable: true },
  { id: "curry-malai-kofta", name: "Malai Kofta", description: "", price: 180, categoryId: "curries", isAvailable: true },
  { id: "curry-paneer-kofta", name: "Paneer Kofta", description: "", price: 180, categoryId: "curries", isAvailable: true },

  // NORTH INDIAN THALI
  {
    id: "thali-north-indian",
    name: "North Indian Thali",
    description:
      "Salad, Starter, Papad, Roti, Poori, Dal Fry, Channa Masala, Rice, Paneer Butter Masala, Jeera Rice, Aloo Fry, Curd",
    price: 230,
    categoryId: "north-indian-thali",
    isAvailable: true
  },

  // RICE
  { id: "rice-veg-fried", name: "Veg Fried Rice", description: "", price: 140, categoryId: "rice", isAvailable: true },
  { id: "rice-mushroom-fried", name: "Mushroom Fried Rice", description: "", price: 160, categoryId: "rice", isAvailable: true },
  { id: "rice-schezwan-fried", name: "Schezwan Fried Rice", description: "", price: 150, categoryId: "rice", isAvailable: true },
  { id: "rice-gobi-fried", name: "Gobi Fried Rice", description: "", price: 160, categoryId: "rice", isAvailable: true },
  { id: "rice-paneer-fried", name: "Paneer Fried Rice", description: "", price: 180, categoryId: "rice", isAvailable: true },
  { id: "rice-garlic-chilli", name: "Garlic Chilli Fried Rice", description: "", price: 160, categoryId: "rice", isAvailable: true },
  { id: "rice-garlic", name: "Garlic Fried Rice", description: "", price: 160, categoryId: "rice", isAvailable: true },
  { id: "rice-jeera", name: "Jeera Rice", description: "", price: 140, categoryId: "rice", isAvailable: true },
  { id: "rice-ghee", name: "Ghee Rice", description: "", price: 140, categoryId: "rice", isAvailable: true },
  { id: "rice-sri-lankan", name: "Sri Lankan Fried Rice", description: "", price: 170, categoryId: "rice", isAvailable: true },
  { id: "rice-mixed", name: "Mixed Fried Rice", description: "", price: 170, categoryId: "rice", isAvailable: true },
  { id: "rice-kaju-pulao", name: "Kaju Pulao", description: "", price: 180, categoryId: "rice", isAvailable: true },
  { id: "rice-paneer-pulao", name: "Paneer Pulao", description: "", price: 180, categoryId: "rice", isAvailable: true },
  { id: "rice-spl-curd", name: "Spl. Curd Rice", description: "", price: 140, categoryId: "rice", isAvailable: true },

  // NOODLES
  { id: "noodles-veg", name: "Veg Noodles", description: "", price: 150, categoryId: "noodles", isAvailable: true },
  { id: "noodles-schezwan", name: "Schezwan Noodles", description: "", price: 160, categoryId: "noodles", isAvailable: true },
  { id: "noodles-mushroom", name: "Mushroom Noodles", description: "", price: 170, categoryId: "noodles", isAvailable: true },
  { id: "noodles-schezwan-mushroom", name: "Schezwan Mushroom Noodles", description: "", price: 180, categoryId: "noodles", isAvailable: true },
  { id: "noodles-gobi", name: "Gobi Noodles", description: "", price: 160, categoryId: "noodles", isAvailable: true },
  { id: "noodles-schezwan-gobi", name: "Schezwan Gobi Noodles", description: "", price: 170, categoryId: "noodles", isAvailable: true },
  { id: "noodles-paneer", name: "Paneer Noodles", description: "", price: 180, categoryId: "noodles", isAvailable: true },
  { id: "noodles-schezwan-paneer", name: "Schezwan Paneer Noodles", description: "", price: 190, categoryId: "noodles", isAvailable: true },
  { id: "noodles-mixed-veg", name: "Mixed Veg Noodles", description: "", price: 180, categoryId: "noodles", isAvailable: true },
  { id: "noodles-garlic-chilli", name: "Garlic Chilli Noodles", description: "", price: 170, categoryId: "noodles", isAvailable: true },

  // NUTTY STREET
  { id: "nutty-crunch", name: "Nutty Crunch", description: "", price: 100, categoryId: "nutty-street", isAvailable: true },
  { id: "nutty-mania", name: "Nutty Mania", description: "", price: 100, categoryId: "nutty-street", isAvailable: true },
  { id: "nutty-mixed-sundae", name: "Mixed Nut Sundae", description: "", price: 130, categoryId: "nutty-street", isAvailable: true },
  { id: "nutty-butterscotch", name: "Butterscotch", description: "", price: 120, categoryId: "nutty-street", isAvailable: true },
  { id: "nutty-melting-moment", name: "Melting Moment", description: "", price: 130, categoryId: "nutty-street", isAvailable: true },
  { id: "nutty-rainbow-fiddle", name: "Rainbow Fiddle", description: "", price: 130, categoryId: "nutty-street", isAvailable: true },

  // JELLY STREET
  { id: "jelly-strawberry-sundae", name: "Strawberry Jello Sundae", description: "", price: 160, categoryId: "jelly-street", isAvailable: true },
  { id: "jelly-pineapple-sundae", name: "Pineapple Sundae", description: "", price: 160, categoryId: "jelly-street", isAvailable: true },
  { id: "jelly-double-jello", name: "Double Jello Sundae", description: "", price: 170, categoryId: "jelly-street", isAvailable: true },

  // SPECIAL STREET
  { id: "special-night-day", name: "Night & Day", description: "", price: 170, categoryId: "special-street", isAvailable: true },
  { id: "special-tall-beauty", name: "Tall Beauty", description: "", price: 180, categoryId: "special-street", isAvailable: true },
  { id: "special-titanic-boat", name: "Titanic Boat", description: "", price: 180, categoryId: "special-street", isAvailable: true },

  // ROYAL STREET
  { id: "royal-chocolate-sundae", name: "Chocolate Sundae", description: "", price: 140, categoryId: "royal-street", isAvailable: true },
  { id: "royal-oreo-fudge", name: "Oreo Fudge", description: "", price: 160, categoryId: "royal-street", isAvailable: true },
  { id: "royal-badam-e-kash", name: "Badam E Kash", description: "", price: 160, categoryId: "royal-street", isAvailable: true },
  { id: "royal-dry-fruit-sundae", name: "Spl. Dry Fruit Sundae", description: "", price: 170, categoryId: "royal-street", isAvailable: true },
  { id: "royal-blackcurrant-almond", name: "Blackcurrant Almond Sundae", description: "", price: 170, categoryId: "royal-street", isAvailable: true },
  { id: "royal-butterscotch-caramel", name: "Butterscotch Caramel", description: "", price: 180, categoryId: "royal-street", isAvailable: true },
  { id: "royal-mixed-fruit-caramel", name: "Mixed Fruit Caramel", description: "", price: 170, categoryId: "royal-street", isAvailable: true },
  { id: "royal-strawberry-mango", name: "Strawberry Mango Tango", description: "", price: 170, categoryId: "royal-street", isAvailable: true },

  // DELIGHTS – 99
  { id: "delight-black-currant", name: "Black Currant Delight", description: "", price: 99, categoryId: "delights-99", isAvailable: true },
  { id: "delight-fruit", name: "Fruit Delight", description: "", price: 99, categoryId: "delights-99", isAvailable: true },
  { id: "delight-pineapple", name: "Pineapple Delight", description: "", price: 99, categoryId: "delights-99", isAvailable: true },
  { id: "delight-mango", name: "Mango Delight", description: "", price: 99, categoryId: "delights-99", isAvailable: true },
  { id: "delight-pista", name: "Pista Delight", description: "", price: 99, categoryId: "delights-99", isAvailable: true },
  { id: "delight-badam", name: "Badam Delight", description: "", price: 99, categoryId: "delights-99", isAvailable: true },
  { id: "delight-choco-crunch", name: "Choco Crunch", description: "", price: 99, categoryId: "delights-99", isAvailable: true },
  { id: "delight-choco-caramel", name: "Choco Caramel", description: "", price: 99, categoryId: "delights-99", isAvailable: true },

  // SOFTIES WITH CAKE
  { id: "softies-death-by-brownie", name: "Death By Brownie", description: "", price: 180, categoryId: "softies-with-cake", isAvailable: true },
  { id: "softies-chocolate-dream", name: "Chocolate Dream", description: "", price: 180, categoryId: "softies-with-cake", isAvailable: true },
  { id: "softies-truffle-mania", name: "Truffle Mania", description: "", price: 180, categoryId: "softies-with-cake", isAvailable: true },

  // FALOODA
  { id: "falooda-classic", name: "Classic Falooda", description: "", price: 130, categoryId: "falooda", isAvailable: true },
  { id: "falooda-fruit", name: "Fruit Falooda", description: "", price: 150, categoryId: "falooda", isAvailable: true },
  { id: "falooda-rose", name: "Rose Falooda", description: "", price: 150, categoryId: "falooda", isAvailable: true },
  { id: "falooda-strawberry", name: "Strawberry Falooda", description: "", price: 150, categoryId: "falooda", isAvailable: true },
  { id: "falooda-dry-fruit", name: "Dry Fruit Falooda", description: "", price: 180, categoryId: "falooda", isAvailable: true },
  { id: "falooda-kesar", name: "Kesar Falooda", description: "", price: 150, categoryId: "falooda", isAvailable: true },

  // ROYAL SHAKES
  { id: "royal-shake-badam-pista", name: "Royal Badam Pista", description: "", price: 160, categoryId: "royal-shakes", isAvailable: true },
  { id: "royal-shake-hazelnut", name: "Hazelnut", description: "", price: 170, categoryId: "royal-shakes", isAvailable: true },
  { id: "royal-shake-oreo", name: "Oreo", description: "", price: 170, categoryId: "royal-shakes", isAvailable: true },
  { id: "royal-shake-kitkat", name: "Kit-Kat", description: "", price: 170, categoryId: "royal-shakes", isAvailable: true },
  { id: "royal-shake-kitkat-brownie", name: "Kit-Kat Brownie", description: "", price: 180, categoryId: "royal-shakes", isAvailable: true },

  // MILK SHAKES
  { id: "milk-vanilla", name: "Vanilla", description: "", price: 130, categoryId: "milk-shakes", isAvailable: true },
  { id: "milk-rose", name: "Rose", description: "", price: 140, categoryId: "milk-shakes", isAvailable: true },
  { id: "milk-chocolate", name: "Chocolate", description: "", price: 140, categoryId: "milk-shakes", isAvailable: true },
  { id: "milk-butterscotch", name: "Butterscotch", description: "", price: 140, categoryId: "milk-shakes", isAvailable: true },
  { id: "milk-coffee", name: "Coffee", description: "", price: 130, categoryId: "milk-shakes", isAvailable: true },
  { id: "milk-badam", name: "Badam", description: "", price: 150, categoryId: "milk-shakes", isAvailable: true },
  { id: "milk-pista", name: "Pista", description: "", price: 150, categoryId: "milk-shakes", isAvailable: true },
  { id: "milk-gulkand", name: "Gulkand", description: "", price: 140, categoryId: "milk-shakes", isAvailable: true },
  { id: "milk-bubble-gum", name: "Bubble Gum", description: "", price: 140, categoryId: "milk-shakes", isAvailable: true },
  { id: "milk-strawberry", name: "Strawberry", description: "", price: 160, categoryId: "milk-shakes", isAvailable: true },
  { id: "milk-mango", name: "Mango", description: "", price: 160, categoryId: "milk-shakes", isAvailable: true },
  { id: "milk-blueberry", name: "Blueberry", description: "", price: 160, categoryId: "milk-shakes", isAvailable: true },
  { id: "milk-blackcurrant", name: "Blackcurrant", description: "", price: 160, categoryId: "milk-shakes", isAvailable: true },
  { id: "milk-lichee", name: "Lichee", description: "", price: 160, categoryId: "milk-shakes", isAvailable: true },
  { id: "milk-pineapple", name: "Pineapple", description: "", price: 160, categoryId: "milk-shakes", isAvailable: true },

  // MOJITOS
  { id: "mojito-deep-blue-sea", name: "Deep Blue Sea", description: "", price: 110, categoryId: "mojitos", isAvailable: true },
  { id: "mojito-mint-lemon", name: "Mint Lemon", description: "", price: 110, categoryId: "mojitos", isAvailable: true },
  { id: "mojito-lemon-soda", name: "Lemon Soda", description: "", price: 100, categoryId: "mojitos", isAvailable: true },
  { id: "mojito-mango-mule", name: "Mango Mule", description: "", price: 100, categoryId: "mojitos", isAvailable: true },
  { id: "mojito-jal-jeera", name: "Jal Jeera", description: "", price: 100, categoryId: "mojitos", isAvailable: true },
  { id: "mojito-berry-burleque", name: "Berry Burleque", description: "", price: 120, categoryId: "mojitos", isAvailable: true },
  { id: "mojito-pinky-blue-berry", name: "Pinky Blue Berry", description: "", price: 110, categoryId: "mojitos", isAvailable: true }
];

