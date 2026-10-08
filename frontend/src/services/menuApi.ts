import axios from 'axios';
import type { MenuItem } from '../types/menu';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface StoreStatus {
  success: boolean;
  isStoreOpen: boolean;
  message?: string;
}

const DEFAULT_FALLBACK_IMG =
  'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80';

interface RawMenuItem {
  id?: string;
  _id?: string;
  name?: string;
  category?: string;
  description?: string;
  desc?: string;
  imageUrl?: string;
  image?: string;
  isVeg?: boolean;
  isAvailable?: boolean;
  available?: boolean;
  variants?: MenuItem['variants'];
  badges?: string[];
  rating?: number;
  reviewCount?: number;
  spiceLevel?: 0 | 1 | 2 | 3;
  prepTime?: string;
  addons?: MenuItem['addons'];
}

export const menuApi = {
  /**
   * Fetch all menu items from backend GET /api/menu
   */
  async getMenu(): Promise<MenuItem[]> {
    const response = await apiClient.get<RawMenuItem[]>('/api/menu');
    const rawData = response.data;

    if (!Array.isArray(rawData)) {
      throw new Error('Invalid menu response format');
    }

    // Normalize backend data structure for frontend components
    return rawData.map((item) => {
      const img = item.imageUrl || item.image || DEFAULT_FALLBACK_IMG;
      const isAvailable = Boolean(item.isAvailable ?? item.available ?? true);
      const desc = item.description || item.desc || '';

      return {
        id: String(item.id || item._id || Math.random()),
        _id: String(item._id || item.id || ''),
        name: String(item.name || 'Dish'),
        category: String(item.category || 'Main Course'),
        description: desc,
        desc: desc,
        imageUrl: img,
        image: img,
        isVeg: Boolean(item.isVeg),
        isAvailable: isAvailable,
        available: isAvailable,
        variants: Array.isArray(item.variants) && item.variants.length > 0
          ? item.variants
          : [{ size: 'Portion', price: 99 }],
        badges: item.badges || (item.name?.toLowerCase().includes('special') ? ['Chef Special'] : undefined),
        rating: typeof item.rating === 'number' ? item.rating : 4.8,
        reviewCount: typeof item.reviewCount === 'number' ? item.reviewCount : 120,
        spiceLevel: item.spiceLevel !== undefined ? item.spiceLevel : (item.isVeg ? 1 : 2),
        prepTime: item.prepTime || '15-20 min',
        addons: item.addons,
      };
    });
  },

  /**
   * Fetch store opening status from backend GET /api/store/status
   */
  async getStoreStatus(): Promise<StoreStatus> {
    const response = await apiClient.get<StoreStatus>('/api/store/status');
    return response.data;
  },
};

export default menuApi;
