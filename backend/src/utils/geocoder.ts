import axios from "axios";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

const FALLBACK_COORDINATES: Coordinates = {
  latitude: 28.4732,
  longitude: 77.5105,
};

const USER_AGENT = "NFC-Order-App/1.0 (noidafriedchicken@gmail.com)";
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const coordinateCache = new Map<string, { coordinates: Coordinates; expiresAt: number }>();

let requestQueue: Promise<void> = Promise.resolve();
let lastRequestAt = 0;

interface NominatimResult {
  lat: string;
  lon: string;
}

const queryNominatim = async (address: string): Promise<Coordinates> => {
  const normalizedAddress = address.trim().toLowerCase();
  const cached = coordinateCache.get(normalizedAddress);
  if (cached && cached.expiresAt > Date.now()) return cached.coordinates;

  const request = requestQueue.then(async () => {
    const delayMs = Math.max(0, 1000 - (Date.now() - lastRequestAt));
    if (delayMs > 0) await new Promise((resolve) => setTimeout(resolve, delayMs));
    lastRequestAt = Date.now();

    const response = await axios.get<NominatimResult[]>(NOMINATIM_URL, {
      params: {
        q: `${address}, Greater Noida, Uttar Pradesh, India`,
        format: "json",
        limit: 1,
      },
      headers: { "User-Agent": USER_AGENT },
      timeout: 5000,
    });

    const result = response.data?.[0];
    const latitude = result ? parseFloat(result.lat) : NaN;
    const longitude = result ? parseFloat(result.lon) : NaN;
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      throw new Error("Nominatim returned no valid coordinates for the address.");
    }

    const coordinates = { latitude, longitude };
    coordinateCache.set(normalizedAddress, {
      coordinates,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
    return coordinates;
  });

  requestQueue = request.then(() => undefined, () => undefined);
  return request;
};

export async function getCoordinatesFromAddress(address: string): Promise<Coordinates> {
  try {
    return await queryNominatim(address);
  } catch (error) {
    console.warn("Nominatim geocoding failed; using NFC Sector Alpha 2 fallback coordinates:", error);
    return FALLBACK_COORDINATES;
  }
}
