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

export const getRealisticDishPhoto = (name = '', category = '', isVeg = false): string => {
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
  if (n.includes('changezi') || n.includes('kadai') || n.includes('rara') || n.includes('handi') || n.includes('tawa') || n.includes('qeema')) {
    return 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80';
  }
  if (n.includes('roti') || n.includes('naan') || category.toLowerCase().includes('bread')) {
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
      const explicitImg = item.imageUrl?.trim() || item.image?.trim();
      const img = explicitImg || getRealisticDishPhoto(item.name, item.category, item.isVeg);
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
