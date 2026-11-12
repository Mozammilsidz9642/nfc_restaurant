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

  // Biryani
  if (n.includes('biryani')) {
    return 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80';
  }

  // Paneer Dishes
  if (n.includes('paneer tikka')) {
    return 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80';
  }
  if (n.includes('kadai paneer') || n.includes('paneer do-pyaza')) {
    return 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80';
  }
  if (n.includes('paneer butter') || n.includes('paneer lawabdar') || n.includes('shahi paneer') || n.includes('tawa paneer') || n.includes('paneer')) {
    return 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80';
  }

  // Kebabs & Tandoori Starters
  if (n.includes('seekh') || n.includes('kebab')) {
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Chicken_Seekh_Kabab.jpg/800px-Chicken_Seekh_Kabab.jpg';
  }
  if (n.includes('tangdi')) {
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Chicken_Tandoori_Tangri_Kabab_01.jpg/800px-Chicken_Tandoori_Tangri_Kabab_01.jpg';
  }
  if (n.includes('tandoori chicken')) {
    return 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&w=800&q=80';
  }
  if (n.includes('zafrani')) {
    return 'https://images.unsplash.com/photo-1617692855027-33b14f061079?auto=format&fit=crop&w=800&q=80';
  }
  if (n.includes('afghani')) {
    return 'https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&w=800&q=80';
  }
  if (n.includes('malai tikka')) {
    return 'https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&w=800&q=80';
  }
  if (n.includes('tikka masala')) {
    return 'https://images.unsplash.com/photo-1772730064970-a7b2735c93b9?auto=format&fit=crop&w=800&q=80';
  }
  if (n.includes('tikka')) {
    return 'https://images.unsplash.com/photo-1705359573325-f2006d5e459f?auto=format&fit=crop&w=800&q=80';
  }
  if (n.includes('lollipop') || n.includes('angara')) {
    return 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80';
  }

  // Non-Veg Main Course
  if (n.includes('butter chicken')) {
    return 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80';
  }
  if (n.includes('lababdar')) {
    return 'https://images.unsplash.com/photo-1772730064951-89b427965dbc?auto=format&fit=crop&w=800&q=80';
  }
  if (n.includes('changezi') || n.includes('kadai') || n.includes('rara') || n.includes('handi') || n.includes('tawa') || n.includes('qeema') || n.includes('do-pyaza')) {
    return 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80';
  }

  // Breads / Roti
  if (n.includes('roomali') || n.includes('rumali')) {
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Food-Rumali-Roti.jpg/800px-Food-Rumali-Roti.jpg';
  }
  if (n.includes('butter naan')) {
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Butter_Naan_2.jpg/800px-Butter_Naan_2.jpg';
  }
  if (n.includes('plain naan') || n.includes('naan')) {
    return 'https://images.unsplash.com/photo-1756821752957-00bfcadc3748?auto=format&fit=crop&w=800&q=80';
  }
  if (n.includes('butter roti')) {
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Tandoori_Roti-MB54.jpg/800px-Tandoori_Roti-MB54.jpg';
  }
  if (n.includes('roti') || category.toLowerCase().includes('bread')) {
    return 'https://images.unsplash.com/photo-1560336749-ad3058381e3f?auto=format&fit=crop&w=800&q=80';
  }

  // Rice & Dal
  if (n.includes('yellow daal') || n.includes('yellow dal')) {
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Yellow_Dal_Tadka_-_The_Indismart_Hotel_-_Salt_Lake_City_-_Kolkata_2023-08-13_3308.jpg/800px-Yellow_Dal_Tadka_-_The_Indismart_Hotel_-_Salt_Lake_City_-_Kolkata_2023-08-13_3308.jpg';
  }
  if (n.includes('daal') || n.includes('dal')) {
    return 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Dal_Makhani..JPG/800px-Dal_Makhani..JPG';
  }
  if (n.includes('plain rice')) {
    return 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=800&q=80';
  }
  if (n.includes('rice')) {
    return 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=800&q=80';
  }

  // Sides / Raita
  if (n.includes('raita')) {
    return 'https://images.unsplash.com/photo-1591120583691-49d2741e55da?auto=format&fit=crop&w=800&q=80';
  }

  // Veggies
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
      // Check if image is missing or is one of the previously reported incorrect URLs
      const isBadImage = !explicitImg || 
        explicitImg.includes('photo-1599487488170-d11ec9c172f0') || // fish
        explicitImg.includes('photo-1601050690597-df0568f70950') || // samosas
        explicitImg.includes('photo-1626082927389-6cd097cdc6ec') || // fried chicken
        explicitImg.includes('photo-1755090154817-58d9d36ec988') || // escalator
        explicitImg.includes('photo-1780907084884-ded9fddbb474');   // pan duplicate

      const img = (!isBadImage && explicitImg) ? explicitImg : getRealisticDishPhoto(item.name, item.category, item.isVeg);
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
