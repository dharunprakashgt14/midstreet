import type { MenuCategory, MenuItem } from "./types";

export const CATEGORIES: MenuCategory[] = [
  { id: "signatures", label: "Signatures" },
  { id: "coffee", label: "Coffee Bar" },
  { id: "coolers", label: "Cold & Cool" },
  { id: "bites", label: "Bites" },
  { id: "desserts", label: "Desserts" }
];

export const MENU_ITEMS: MenuItem[] = [
  {
    id: "ms-black-smoke",
    name: "Mid Street Black Smoke",
    description: "Slow-brewed coffee over smoked ice with citrus mist.",
    price: 220,
    categoryId: "signatures",
    isAvailable: true,
    tag: "Signature"
  },
  {
    id: "ms-spiced-mocha",
    name: "Cinder Mocha",
    description: "Dark chocolate mocha with warm spice ribbon.",
    price: 210,
    categoryId: "signatures",
    isAvailable: true,
    tag: "Chef's pick"
  },
  {
    id: "classic-cappuccino",
    name: "Classic Cappuccino",
    description: "Balanced espresso with a dense, silky foam cap.",
    price: 160,
    categoryId: "coffee",
    isAvailable: true
  },
  {
    id: "flat-white",
    name: "Flat White",
    description: "Velvety microfoam over a concentrated espresso base.",
    price: 170,
    categoryId: "coffee",
    isAvailable: true
  },
  {
    id: "cold-brew-tonic",
    name: "Cold Brew Tonic",
    description: "House cold brew over tonic with citrus peel.",
    price: 190,
    categoryId: "coolers",
    isAvailable: true
  },
  {
    id: "mid-street-fizz",
    name: "Mid Street Fizz",
    description: "Sparkling lime cooler with herb mist.",
    price: 180,
    categoryId: "coolers",
    isAvailable: false,
    tag: "New"
  },
  {
    id: "smoked-fries",
    name: "Smoked Sea Salt Fries",
    description: "Twice-cooked fries with smoked sea salt and aioli.",
    price: 150,
    categoryId: "bites",
    isAvailable: true
  },
  {
    id: "chipotle-sandwich",
    name: "Chipotle Street Sandwich",
    description: "Grilled sandwich with chipotle mayo and crisp veggies.",
    price: 210,
    categoryId: "bites",
    isAvailable: true
  },
  {
    id: "burnt-cheesecake",
    name: "Midnight Cheesecake",
    description: "Basque-style burnt cheesecake slice.",
    price: 230,
    categoryId: "desserts",
    isAvailable: true
  },
  {
    id: "choco-lava",
    name: "Slow Melt Lava",
    description: "Warm chocolate cake with molten center.",
    price: 220,
    categoryId: "desserts",
    isAvailable: true
  }
];


