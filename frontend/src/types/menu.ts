export interface PriceVariant {
  size: string;
  price: number;
  pieces?: number;
}

export interface MenuAddon {
  id: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  _id?: string;
  name: string;
  category: string;
  description: string;
  desc?: string;
  imageUrl?: string;
  image?: string;
  isVeg: boolean;
  variants: PriceVariant[];
  isAvailable?: boolean;
  available?: boolean;
  badges?: string[];
  rating?: number;
  reviewCount?: number;
  spiceLevel?: 0 | 1 | 2 | 3;
  prepTime?: string;
  addons?: MenuAddon[];
}

export type CategoryName = 'All' | 'Starters' | 'Main Course' | 'Biryani' | 'Roti / Bread';
