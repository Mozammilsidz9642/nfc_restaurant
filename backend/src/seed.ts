import mongoose from "mongoose";
import dotenv from "dotenv";
import MenuItem from "./models/MenuItem";

dotenv.config();

export const realNFCMenu = [
  {
    name: "Chicken Seekh Kebab",
    category: "Starters",
    description: "Tender minced chicken blended with royal awadhi spices and fresh herbs, skewered and grilled over glowing charcoal embers.",
    desc: "Tender minced chicken blended with royal awadhi spices and fresh herbs, skewered and grilled over glowing charcoal embers.",
    imageUrl: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80",
    isVeg: false,
    isAvailable: true,
    variants: [
      { size: "QTR", price: 119, pieces: 2 },
      { size: "Half", price: 219, pieces: 4 },
      { size: "Full", price: 429, pieces: 8 },
    ],
  },
  {
    name: "Tandoori Chicken",
    category: "Starters",
    description: "Whole chicken marinated overnight in Kashmiri deggi mirch, hung curd, and stone-ground spices, roasted crisp in clay tandoor.",
    desc: "Whole chicken marinated overnight in Kashmiri deggi mirch, hung curd, and stone-ground spices, roasted crisp in clay tandoor.",
    imageUrl: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80",
    isVeg: false,
    isAvailable: true,
    variants: [
      { size: "QTR", price: 150, pieces: 3 },
      { size: "Half", price: 279, pieces: 6 },
      { size: "Full", price: 549, pieces: 12 },
    ],
  },
  {
    name: "Chicken Tangdi Kebab",
    category: "Starters",
    description: "Succulent chicken drumsticks stuffed with aromatic spices, marinated in spiced curd, and roasted over slow charcoal embers.",
    desc: "Succulent chicken drumsticks stuffed with aromatic spices, marinated in spiced curd, and roasted over slow charcoal embers.",
    imageUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
    isVeg: false,
    isAvailable: true,
    variants: [
      { size: "QTR", price: 179, pieces: 3 },
      { size: "Half", price: 279, pieces: 5 },
      { size: "Full", price: 529, pieces: 10 },
    ],
  },
  {
    name: "Chicken Malai Tikka",
    category: "Starters",
    description: "Boneless chicken morsels steeped in rich clotted malai cream, cashew paste, and royal cardamom, gently grilled to perfection.",
    desc: "Boneless chicken morsels steeped in rich clotted malai cream, cashew paste, and royal cardamom, gently grilled to perfection.",
    imageUrl: "https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&w=800&q=80",
    isVeg: false,
    isAvailable: true,
    variants: [
      { size: "QTR", price: 169, pieces: 4 },
      { size: "Half", price: 299, pieces: 8 },
      { size: "Full", price: 569, pieces: 16 },
    ],
  },
  {
    name: "Paneer Tikka Shashlik",
    category: "Starters",
    description: "Fresh artisanal cottage cheese cubes skewered with crisp bell peppers and glazed onions, in ajwain yellow tandoori marinade.",
    desc: "Fresh artisanal cottage cheese cubes skewered with crisp bell peppers and glazed onions, in ajwain yellow tandoori marinade.",
    imageUrl: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80",
    isVeg: true,
    isAvailable: true,
    variants: [
      { size: "Half", price: 189, pieces: 6 },
      { size: "Full", price: 349, pieces: 12 },
    ],
  },
  {
    name: "Butter Chicken",
    category: "Main Course",
    description: "Charcoal-roasted tandoori chicken simmered in an opulent velvet tomato-butter gravy with kasuri methi, honey, and fresh cream.",
    desc: "Charcoal-roasted tandoori chicken simmered in an opulent velvet tomato-butter gravy with kasuri methi, honey, and fresh cream.",
    imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80",
    isVeg: false,
    isAvailable: true,
    variants: [
      { size: "QTR", price: 229, pieces: 3 },
      { size: "Half", price: 349, pieces: 6 },
      { size: "Full", price: 679, pieces: 12 },
    ],
  },
  {
    name: "Kadai Chicken",
    category: "Main Course",
    description: "Juicy chicken chunks wok-tossed with crunchy bell peppers, onions, freshly roasted coriander seeds, and fiery Kashmiri red chilies.",
    desc: "Juicy chicken chunks wok-tossed with crunchy bell peppers, onions, freshly roasted coriander seeds, and fiery Kashmiri red chilies.",
    imageUrl: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80",
    isVeg: false,
    isAvailable: true,
    variants: [
      { size: "QTR", price: 189, pieces: 3 },
      { size: "Half", price: 329, pieces: 6 },
      { size: "Full", price: 669, pieces: 12 },
    ],
  },
  {
    name: "Chicken Changezi",
    category: "Main Course",
    description: "Legendary Old Delhi recipe. Tender chicken braised in roasted tomato, yogurt reduction, whole spices, and rich Mughlai gravy.",
    desc: "Legendary Old Delhi recipe. Tender chicken braised in roasted tomato, yogurt reduction, whole spices, and rich Mughlai gravy.",
    imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
    isVeg: false,
    isAvailable: true,
    variants: [
      { size: "QTR", price: 249, pieces: 3 },
      { size: "Half", price: 369, pieces: 6 },
      { size: "Full", price: 689, pieces: 12 },
    ],
  },
  {
    name: "Dal Makhani",
    category: "Main Course",
    description: "Whole black urad lentils and red kidney beans slow-simmered for 24 hours on charcoal embers, enriched with farm butter and cream.",
    desc: "Whole black urad lentils and red kidney beans slow-simmered for 24 hours on charcoal embers, enriched with farm butter and cream.",
    imageUrl: "https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=800&q=80",
    isVeg: true,
    isAvailable: true,
    variants: [
      { size: "Half", price: 160 },
      { size: "Full", price: 280 },
    ],
  },
  {
    name: "Special Chicken Biryani",
    category: "Biryani",
    description: "Aged long-grain royal basmati rice layered with succulent marinated chicken, saffron strands, and fried barista onions, cooked in sealed handi.",
    desc: "Aged long-grain royal basmati rice layered with succulent marinated chicken, saffron strands, and fried barista onions, cooked in sealed handi.",
    imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
    isVeg: false,
    isAvailable: true,
    variants: [
      { size: "QTR", price: 90, pieces: 2 },
      { size: "Half", price: 160, pieces: 3 },
      { size: "Full", price: 280, pieces: 6 },
    ],
  },
  {
    name: "Tandoori Butter Roti",
    category: "Roti / Bread",
    description: "Whole wheat traditional roti baked crisp in earthen tandoor and brushed with fresh melted butter.",
    desc: "Whole wheat traditional roti baked crisp in earthen tandoor and brushed with fresh melted butter.",
    imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
    isVeg: true,
    isAvailable: true,
    variants: [{ size: "Piece", price: 15, pieces: 1 }],
  },
  {
    name: "Butter Naan",
    category: "Roti / Bread",
    description: "Fine leavened flatbread slapped onto inner clay tandoor walls, baked golden, and generously brushed with salted butter.",
    desc: "Fine leavened flatbread slapped onto inner clay tandoor walls, baked golden, and generously brushed with salted butter.",
    imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
    isVeg: true,
    isAvailable: true,
    variants: [{ size: "Piece", price: 45, pieces: 1 }],
  },
  {
    name: "Roomali Roti",
    category: "Roti / Bread",
    description: "Paper-thin, handkerchief-soft bread tossed in the air and baked over an inverted smoking hot iron griddle.",
    desc: "Paper-thin, handkerchief-soft bread tossed in the air and baked over an inverted smoking hot iron griddle.",
    imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80",
    isVeg: true,
    isAvailable: true,
    variants: [{ size: "Piece", price: 10, pieces: 1 }],
  },
  {
    name: "Garlic Butter Naan",
    category: "Roti / Bread",
    description: "Soft tandoori naan encrusted with minced roasted garlic, fresh coriander leaves, and dripping with melted butter.",
    desc: "Soft tandoori naan encrusted with minced roasted garlic, fresh coriander leaves, and dripping with melted butter.",
    imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
    isVeg: true,
    isAvailable: true,
    variants: [{ size: "Piece", price: 55, pieces: 1 }],
  },
];

export const seedDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/nfc_db";
    await mongoose.connect(mongoUri);
    await MenuItem.deleteMany({});
    await MenuItem.insertMany(realNFCMenu);
    console.log("NFC Menu Database me Seed ho gya! Items inserted:", realNFCMenu.length);
    if (require.main === module) {
      process.exit(0);
    }
  } catch (err) {
    console.error("Seed Error:", err);
    if (require.main === module) {
      process.exit(1);
    }
  }
};

if (require.main === module) {
  seedDB();
}
