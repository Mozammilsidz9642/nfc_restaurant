import mongoose from "mongoose";
import dotenv from "dotenv";
import MenuItem from "./models/MenuItem";

dotenv.config();
export const fullMenuData = [
  // ==================== VEG DELIGHTS ====================
  // VEG STARTERS
  {
    name: "Paneer Tikka",
    category: "Starters",
    isVeg: true,
    price: 129,
    variants: [
      { name: "Half", price: 129 },
      { name: "Full", price: 239 }
    ],
    description: "Cottage cheese cubes marinated in aromatic spices and char-grilled to perfection."
  },

  // VEG MAIN COURSE
  {
    name: "Tawa Paneer",
    category: "Main Course",
    isVeg: true,
    price: 249,
    variants: [
      { name: "Full", price: 249 }
    ],
    description: "Spicy and tangy paneer tossed on a tawa with crunchy capsicum and onions."
  },
  {
    name: "Kadai Paneer",
    category: "Main Course",
    isVeg: true,
    price: 159,
    variants: [
      { name: "Half", price: 159 },
      { name: "Full", price: 259 }
    ],
    description: "Cottage cheese cooked with freshly ground kadai masala and bell peppers."
  },
  {
    name: "Paneer Butter Masala",
    category: "Main Course",
    isVeg: true,
    price: 149,
    variants: [
      { name: "Half", price: 149 },
      { name: "Full", price: 249 }
    ],
    description: "Soft paneer cubes simmered in rich, buttery makhani tomato gravy."
  },
  {
    name: "Paneer Lawabdar",
    category: "Main Course",
    isVeg: true,
    price: 159,
    variants: [
      { name: "Half", price: 159 },
      { name: "Full", price: 259 }
    ],
    description: "Paneer cooked in a luscious tomato-onion gravy loaded with grated paneer."
  },
  {
    name: "Shahi Paneer",
    category: "Main Course",
    isVeg: true,
    price: 159,
    variants: [
      { name: "Half", price: 159 },
      { name: "Full", price: 259 }
    ],
    description: "Royal cottage cheese prepared in sweet-fragrant creamy cashew gravy."
  },
  {
    name: "Paneer Do-Pyaza",
    category: "Main Course",
    isVeg: true,
    price: 159,
    variants: [
      { name: "Half", price: 159 },
      { name: "Full", price: 259 }
    ],
    description: "Paneer cooked with double layers of crispy sauteed onions and rich spices."
  },
  {
    name: "Mix-Veg",
    category: "Main Course",
    isVeg: true,
    price: 159,
    variants: [
      { name: "Half", price: 159 },
      { name: "Full", price: 259 }
    ],
    description: "Garden fresh assorted vegetables tossed with aromatic Indian spices."
  },

  // VEG RICE / DAAL
  {
    name: "Yellow Daal Tandoori",
    category: "Rice & Daal",
    isVeg: true,
    price: 139,
    variants: [{ name: "Standard", price: 139 }],
    description: "Traditional yellow lentils tempered with cumin, garlic and tandoori smoky tadka."
  },
  {
    name: "Butter Daal Tandoori",
    category: "Rice & Daal",
    isVeg: true,
    price: 169,
    variants: [{ name: "Standard", price: 169 }],
    description: "Smoky lentils finished with generous dollops of butter and spices."
  },
  {
    name: "Plain Rice",
    category: "Rice & Daal",
    isVeg: true,
    price: 69,
    variants: [{ name: "Standard", price: 69 }],
    description: "Steamed fluffy long-grain basmati rice."
  },
  {
    name: "Jeera Rice",
    category: "Rice & Daal",
    isVeg: true,
    price: 79,
    variants: [{ name: "Standard", price: 79 }],
    description: "Aromatic basmati rice tempered with roasted cumin seeds and desi ghee."
  },

  // VEG BIRYANI
  {
    name: "Veg-Biryani",
    category: "Biryani",
    isVeg: true,
    price: 139,
    variants: [
      { name: "Half", price: 139 },
      { name: "Full", price: 249 }
    ],
    description: "Fragrant basmati rice layered with seasoned mixed vegetables and biryani spices."
  },

  // ==================== NON-VEG DELIGHTS ====================
  // NON-VEG STARTERS
  {
    name: "Chicken Seekh Kebab",
    category: "Starters",
    isVeg: false,
    price: 119,
    variants: [
      { name: "Quarter (2 pcs)", price: 119 },
      { name: "Half (4 pcs)", price: 219 },
      { name: "Full (8 pcs)", price: 429 }
    ],
    description: "Juicy minced chicken skewers spiced and flame grilled."
  },
  {
    name: "Chicken Seekh Kebab Gravy",
    category: "Starters",
    isVeg: false,
    price: 129,
    variants: [
      { name: "Quarter (2 pcs)", price: 129 },
      { name: "Half (4 pcs)", price: 239 },
      { name: "Full (8 pcs)", price: 449 }
    ],
    description: "Chicken seekh kebabs tossed in mouth-watering savory gravy."
  },
  {
    name: "Tandoori Chicken",
    category: "Starters",
    isVeg: false,
    price: 150,
    variants: [
      { name: "Quarter (3 pcs)", price: 150 },
      { name: "Half (6 pcs)", price: 279 },
      { name: "Full (12 pcs)", price: 549 }
    ],
    description: "Classic marinated roasted chicken prepared in authentic clay oven."
  },
  {
    name: "Chicken Tangdi Kebab",
    category: "Starters",
    isVeg: false,
    price: 179,
    variants: [
      { name: "Quarter (3 pcs)", price: 179 },
      { name: "Half (5 pcs)", price: 279 },
      { name: "Full (10 pcs)", price: 529 }
    ],
    description: "Grilled chicken drumsticks marinated in rich spice blend."
  },
  {
    name: "Chicken Zafrani",
    category: "Starters",
    isVeg: false,
    price: 169,
    variants: [
      { name: "Quarter (3 pcs)", price: 169 },
      { name: "Half (6 pcs)", price: 289 },
      { name: "Full (12 pcs)", price: 569 }
    ],
    description: "Royal saffron-infused tender tandoori chicken."
  },
  {
    name: "Chicken Afghani",
    category: "Starters",
    isVeg: false,
    price: 179,
    variants: [
      { name: "Quarter (3 pcs)", price: 179 },
      { name: "Half (6 pcs)", price: 299 },
      { name: "Full (12 pcs)", price: 599 }
    ],
    description: "Mild and creamy roasted chicken with curd and cashew paste marinade."
  },
  {
    name: "Chicken Afghani Gravy",
    category: "Starters",
    isVeg: false,
    price: 189,
    variants: [
      { name: "Quarter (3 pcs)", price: 189 },
      { name: "Half (6 pcs)", price: 319 },
      { name: "Full (12 pcs)", price: 579 }
    ],
    description: "Creamy Afghani chicken submerged in velvety white gravy."
  },
  {
    name: "Tandoori Chicken Tikka",
    category: "Starters",
    isVeg: false,
    price: 179,
    variants: [
      { name: "Quarter (4 pcs)", price: 179 },
      { name: "Half (8 pcs)", price: 349 },
      { name: "Full (16 pcs)", price: 649 }
    ],
    description: "Boneless chicken cubes grilled with smoky tandoori flavors."
  },
  {
    name: "Chicken Malai Tikka",
    category: "Starters",
    isVeg: false,
    price: 219,
    variants: [
      { name: "Quarter (4 pcs)", price: 219 },
      { name: "Half (8 pcs)", price: 389 },
      { name: "Full (16 pcs)", price: 699 }
    ],
    description: "Melt-in-mouth chicken chunks with cream, cheese, and cardamom notes."
  },
  {
    name: "Chicken Malai Tikka Gravy",
    category: "Starters",
    isVeg: false,
    price: 249,
    variants: [
      { name: "Quarter (4 pcs)", price: 249 },
      { name: "Half (8 pcs)", price: 399 },
      { name: "Full (16 pcs)", price: 699 }
    ],
    description: "Malai tikka cooked in rich silky sauce."
  },
  {
    name: "NFC Angara Special",
    category: "Starters",
    isVeg: false,
    price: 199,
    variants: [
      { name: "Quarter (4 pcs)", price: 199 },
      { name: "Half (8 pcs)", price: 399 },
      { name: "Full (16 pcs)", price: 699 }
    ],
    description: "Fiery chef-special smoky marinated chicken."
  },
  {
    name: "Chicken Lollipop",
    category: "Starters",
    isVeg: false,
    price: 149,
    variants: [
      { name: "Quarter (3 pcs)", price: 149 },
      { name: "Half (6 pcs)", price: 249 },
      { name: "Full (12 pcs)", price: 469 }
    ],
    description: "Crispy fried frenched chicken winglets coated in spicy masala."
  },

  // NON-VEG MAIN COURSE
  {
    name: "Kadai Chicken",
    category: "Main Course",
    isVeg: false,
    price: 189,
    variants: [
      { name: "Quarter (3 pcs)", price: 189 },
      { name: "Half (6 pcs)", price: 329 },
      { name: "Full (12 pcs)", price: 669 }
    ],
    description: "Chicken pieces tossed with freshly roasted coriander seeds and bell peppers."
  },
  {
    name: "Chicken Do-Pyaza",
    category: "Main Course",
    isVeg: false,
    price: 219,
    variants: [
      { name: "Quarter (3 pcs)", price: 219 },
      { name: "Half (6 pcs)", price: 349 },
      { name: "Full (12 pcs)", price: 679 }
    ],
    description: "Tender chicken cooked in sweet and savory diced onion curry."
  },
  {
    name: "Chicken Changezi",
    category: "Main Course",
    isVeg: false,
    price: 219,
    variants: [
      { name: "Quarter (3 pcs)", price: 219 },
      { name: "Half (6 pcs)", price: 349 },
      { name: "Full (12 pcs)", price: 679 }
    ],
    description: "Old Delhi style rich, thick, tangy, and slow-roasted chicken gravy."
  },
  {
    name: "Tawa Chicken",
    category: "Main Course",
    isVeg: false,
    price: 219,
    variants: [
      { name: "Quarter (3 pcs)", price: 219 },
      { name: "Half (6 pcs)", price: 349 },
      { name: "Full (12 pcs)", price: 679 }
    ],
    description: "Pan-roasted dry-style chicken cooked with onions, green chilies, and fresh tomatoes."
  },
  {
    name: "Handi Chicken",
    category: "Main Course",
    isVeg: false,
    price: 249,
    variants: [
      { name: "Quarter (3 pcs)", price: 249 },
      { name: "Half (6 pcs)", price: 369 },
      { name: "Full (12 pcs)", price: 689 }
    ],
    description: "Earthen clay pot slow-cooked country-style chicken curry."
  },
  {
    name: "Butter Chicken",
    category: "Main Course",
    isVeg: false,
    price: 229,
    variants: [
      { name: "Quarter (3 pcs)", price: 229 },
      { name: "Half (6 pcs)", price: 349 },
      { name: "Full (12 pcs)", price: 679 }
    ],
    description: "Clay-oven grilled chicken simmered in rich creamy tomato and butter gravy."
  },
  {
    name: "NFC Rara Special",
    category: "Main Course",
    isVeg: false,
    price: 249,
    variants: [
      { name: "Quarter (3 pcs)", price: 249 },
      { name: "Half (6 pcs)", price: 379 },
      { name: "Full (12 pcs)", price: 699 }
    ],
    description: "Chicken pieces cooked together with seasoned minced chicken keema."
  },
  {
    name: "Special Chicken Lababdar",
    category: "Main Course",
    isVeg: false,
    price: 249,
    variants: [
      { name: "Quarter (3 pcs)", price: 249 },
      { name: "Half (6 pcs)", price: 379 },
      { name: "Full (12 pcs)", price: 699 }
    ],
    description: "Tender chicken simmered in creamy Mughlai tomato gravy."
  },
  {
    name: "Chicken Haramirch Qeema",
    category: "Main Course",
    isVeg: false,
    price: 299,
    variants: [
      { name: "Full (One Portion)", price: 299 }
    ],
    description: "Spicy chicken mince sauteed with fresh slit green chilies and ginger."
  },
  {
    name: "Chicken Tikka Masala",
    category: "Main Course",
    isVeg: false,
    price: 399,
    variants: [
      { name: "Half (4 pcs)", price: 399 },
      { name: "Full (8 pcs)", price: 699 }
    ],
    description: "Charcoal grilled tikka pieces submerged in thick onion tomato masala."
  },

  // ROTI / BREAD / EXTRAS
  {
    name: "Tandoori Roti",
    category: "Breads",
    isVeg: true,
    price: 10,
    variants: [{ name: "Standard", price: 10 }],
    description: "Crispy whole wheat bread baked in clay tandoor."
  },
  {
    name: "Tandoori Butter Roti",
    category: "Breads",
    isVeg: true,
    price: 15,
    variants: [{ name: "Standard", price: 15 }],
    description: "Clay oven roasted roti brushed with fresh butter."
  },
  {
    name: "Roomali Roti",
    category: "Breads",
    isVeg: true,
    price: 10,
    variants: [{ name: "Standard", price: 10 }],
    description: "Paper-thin soft handkerchief bread cooked over an inverted tawa."
  },
  {
    name: "Plain Naan",
    category: "Breads",
    isVeg: true,
    price: 40,
    variants: [{ name: "Standard", price: 40 }],
    description: "Fluffy leavened refined flour flatbread cooked in tandoor."
  },
  {
    name: "Butter Naan Roti",
    category: "Breads",
    isVeg: true,
    price: 45,
    variants: [{ name: "Standard", price: 45 }],
    description: "Traditional soft naan brushed with melted butter."
  },
  {
    name: "Raita",
    category: "Sides",
    isVeg: true,
    price: 30,
    variants: [{ name: "Standard", price: 30 }],
    description: "Chilled whipped yogurt seasoned with roasted cumin and mint."
  },
  {
    name: "Boondi Raita",
    category: "Sides",
    isVeg: true,
    price: 40,
    variants: [{ name: "Standard", price: 40 }],
    description: "Crunchy fried chickpea pearls soaked in spiced whipped curd."
  },

  // NON-VEG BIRYANI
  {
    name: "Special Chicken Biryani",
    category: "Biryani",
    isVeg: false,
    price: 90,
    variants: [
      { name: "Quarter (2 pcs)", price: 90 },
      { name: "Half (3 pcs)", price: 160 },
      { name: "Full (6 pcs)", price: 280 }
    ],
    description: "Authentic dum biryani prepared with layered long-grain basmati and spiced chicken."
  }
];
export const getDishImageUrl = (name: string, category: string, isVeg: boolean): string => {
  const n = name.toLowerCase();
  if (n.includes('biryani')) {
    return 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80';
  }
  if (n.includes('paneer tikka')) {
    return 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80';
  }
  if (n.includes('paneer')) {
    return 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80';
  }
  if (n.includes('tandoori chicken')) {
    return 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80';
  }
  if (n.includes('tangdi')) {
    return 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80';
  }
  if (n.includes('malai tikka')) {
    return 'https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&w=800&q=80';
  }
  if (n.includes('afghani')) {
    return 'https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&w=800&q=80';
  }
  if (n.includes('seekh') || n.includes('kebab')) {
    return 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80';
  }
  if (n.includes('tikka')) {
    return 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80';
  }
  if (n.includes('lollipop')) {
    return 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80';
  }
  if (n.includes('butter chicken') || n.includes('lababdar') || n.includes('shahi')) {
    return 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80';
  }
  if (n.includes('changezi') || n.includes('kadai') || n.includes('rara') || n.includes('handi') || n.includes('tawa chicken') || n.includes('qeema')) {
    return 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80';
  }
  if (n.includes('roti') || n.includes('naan') || category === 'Breads' || category === 'Roti / Bread') {
    return 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80';
  }
  if (n.includes('daal') || n.includes('dal')) {
    return 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=800&q=80';
  }
  if (n.includes('rice')) {
    return 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=800&q=80';
  }
  if (n.includes('raita')) {
    return 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&q=80';
  }
  if (n.includes('mix-veg') || n.includes('veg')) {
    return 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80';
  }
  return isVeg
    ? 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80'
    : 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80';
};

// Convert the official menu shape into the field names used by MenuItem and checkout.
export const realNFCMenu = fullMenuData.map((item) => ({
  name: item.name,
  category: item.category,
  description: item.description,
  desc: item.description,
  imageUrl: getDishImageUrl(item.name, item.category, item.isVeg),
  isVeg: item.isVeg,
  isAvailable: true,
  price: item.price,
  variants: item.variants.map((variant) => ({
    size: variant.name,
    price: variant.price,
  })),
}));

export const seedDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected to MongoDB...");

    await MenuItem.deleteMany({});
    await MenuItem.insertMany(realNFCMenu);
    console.log(`Seeded ${realNFCMenu.length} official NFC menu items`);

    await mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDB();
}