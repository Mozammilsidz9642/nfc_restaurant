import axios from "axios";

const PICKUP_NAME = "NFC - Noida Fried Chicken";
const PICKUP_ADDRESS = "KB Complex, Sector Alpha 2, Greater Noida";
const PICKUP_CITY = "Greater Noida";

interface GeoPoint {
  latitude: number;
  longitude: number;
}

interface ShadowfaxEnvelope {
  data?: Record<string, any>;
  [key: string]: any;
}

export interface ShadowfaxDeliveryResult {
  sfxOrderId: string;
  trackingUrl: string | null;
  riderName: string | null;
  riderPhone: string | null;
  deliveryStatus: string;
  riderLatitude: number | null;
  riderLongitude: number | null;
}

interface ShadowfaxOrderInput {
  orderId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  totalAmount: number;
  paymentStatus: string;
  items: Array<{ name: string; size: string; price: number; quantity: number }>;
}

const getBaseUrl = (): string => {
  const configuredUrl = process.env.SHADOWFAX_BASE_URL?.trim();
  const defaultUrl = process.env.NODE_ENV === "production"
    ? "https://api.shadowfax.in"
    : "https://hlbackend.staging.shadowfax.in";
  return (configuredUrl || defaultUrl).replace(/\/+$/, "");
};

const getCredentials = (): { apiKey: string; clientCode: string } => {
  const apiKey = process.env.SHADOWFAX_API_KEY?.trim();
  const clientCode = process.env.SHADOWFAX_CLIENT_CODE?.trim();
  if (!apiKey || !clientCode) {
    throw new Error("Configure SHADOWFAX_API_KEY and SHADOWFAX_CLIENT_CODE before dispatching deliveries.");
  }
  return { apiKey, clientCode };
};

const geocode = async (address: string): Promise<GeoPoint> => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Configure GOOGLE_MAPS_API_KEY to resolve pickup and customer delivery coordinates for Shadowfax.");
  }

  const response = await axios.get<{ status: string; results: Array<{ geometry: { location: { lat: number; lng: number } } }> }>(
    "https://maps.googleapis.com/maps/api/geocode/json",
    { params: { address, key: apiKey }, timeout: 10000 }
  );
  const location = response.data.results?.[0]?.geometry?.location;
  if (response.data.status !== "OK" || !location) {
    throw new Error(`Could not resolve delivery coordinates for address: ${address}`);
  }
  return { latitude: location.lat, longitude: location.lng };
};

const getOrderData = (response: ShadowfaxEnvelope): Record<string, any> =>
  response.data && typeof response.data === "object" ? response.data : response;

const asNullableString = (value: unknown): string | null =>
  value === undefined || value === null || value === "" ? null : String(value);

const asNullableNumber = (value: unknown): number | null => {
  if (value === undefined || value === null || value === "") return null;
  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const normalizeOrderData = (
  data: Record<string, any>,
  fallbackSfxOrderId?: string
): ShadowfaxDeliveryResult => {
  const rider = data.rider_details || data.rider || {};
  const location = rider.rider_location || data.rider_location || data.location || {};
  const riderCoords = Array.isArray(location.coordinates)
    ? { longitude: location.coordinates[0], latitude: location.coordinates[1] }
    : location;
  return {
    sfxOrderId: String(data.sfx_order_id ?? data.shadowfax_order_id ?? fallbackSfxOrderId ?? ""),
    trackingUrl: asNullableString(data.track_url ?? data.tracking_url ?? data.trackingUrl),
    riderName: asNullableString(rider.rider_name ?? rider.name ?? data.rider_name),
    riderPhone: asNullableString(rider.rider_phone ?? rider.phone ?? data.rider_phone),
    deliveryStatus: String(data.status ?? data.order_status ?? "ALLOCATING").toUpperCase(),
    riderLatitude: asNullableNumber(riderCoords.latitude ?? riderCoords.lat),
    riderLongitude: asNullableNumber(riderCoords.longitude ?? riderCoords.lng),
  };
};

export async function createShadowfaxDelivery(order: ShadowfaxOrderInput): Promise<ShadowfaxDeliveryResult> {
  const { apiKey, clientCode } = getCredentials();
  const [pickup, drop] = await Promise.all([
    geocode(`${PICKUP_NAME}, ${PICKUP_ADDRESS}`),
    geocode(order.deliveryAddress),
  ]);
  const response = await axios.post<ShadowfaxEnvelope>(
    `${getBaseUrl()}/api/v2/orders/`,
    {
      client_code: clientCode,
      order_details: {
        client_order_id: order.orderId,
        order_value: order.totalAmount,
        paid: order.paymentStatus === "Paid" ? "true" : "false",
      },
      pickup_details: {
        city: PICKUP_CITY,
        name: PICKUP_NAME,
        address: PICKUP_ADDRESS,
        latitude: pickup.latitude,
        longitude: pickup.longitude,
      },
      drop_details: {
        city: PICKUP_CITY,
        name: order.customerName,
        address: order.deliveryAddress,
        contact_number: order.customerPhone,
        latitude: drop.latitude,
        longitude: drop.longitude,
      },
      order_items: order.items.map((item, index) => ({
        id: `${order.orderId}-${index + 1}`,
        name: `${item.name} (${item.size})`,
        price: item.price,
        quantity: item.quantity,
      })),
    },
    {
      headers: { Authorization: `Token ${apiKey}`, "Content-Type": "application/json" },
      timeout: 15000,
    }
  );

  const result = normalizeOrderData(getOrderData(response.data));
  if (!result.sfxOrderId) {
    throw new Error("Shadowfax created no delivery ID in its response.");
  }
  return result;
}

export async function cancelShadowfaxDelivery(sfxOrderId: string): Promise<void> {
  const { apiKey } = getCredentials();
  await axios.put(
    `${getBaseUrl()}/api/v2/orders/${encodeURIComponent(sfxOrderId)}/cancel/`,
    { reason: "Order cancelled by restaurant", user: "Seller" },
    { headers: { Authorization: `Token ${apiKey}`, "Content-Type": "application/json" }, timeout: 10000 }
  );
}

export async function trackShadowfaxDelivery(sfxOrderId: string): Promise<ShadowfaxDeliveryResult> {
  const { apiKey } = getCredentials();
  const response = await axios.get<ShadowfaxEnvelope>(
    `${getBaseUrl()}/api/v2/orders/${encodeURIComponent(sfxOrderId)}/status/`,
    { headers: { Authorization: `Token ${apiKey}` }, timeout: 10000 }
  );
  return normalizeOrderData(getOrderData(response.data), sfxOrderId);
}
