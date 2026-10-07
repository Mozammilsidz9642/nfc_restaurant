import axios from "axios";

export interface ShadowfaxDispatchOrder {
  orderId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  totalAmount: number;
}

export interface ShadowfaxDispatchResult {
  trackingUrl: string;
  riderName?: string;
  riderPhone?: string;
}

interface ShadowfaxResponse {
  tracking_url?: string;
  track_url?: string;
  trackingUrl?: string;
  rider_name?: string;
  rider_phone?: string;
  data?: {
    tracking_url?: string;
    track_url?: string;
    trackingUrl?: string;
    rider_name?: string;
    rider_phone?: string;
  };
}

const isPlaceholder = (value: string | undefined): boolean =>
  !value || /placeholder|sample|dummy|your[_ -]/i.test(value);

export async function dispatchShadowfaxOrder(
  order: ShadowfaxDispatchOrder
): Promise<ShadowfaxDispatchResult> {
  const apiKey = process.env.SHADOWFAX_API_KEY?.trim();
  const clientCode = process.env.SHADOWFAX_CLIENT_CODE?.trim();
  const baseUrl = (process.env.SHADOWFAX_BASE_URL?.trim() || "https://api.shadowfax.in")
    .replace(/\/+$/, "");
  const mockResult: ShadowfaxDispatchResult = {
    trackingUrl: `https://track.shadowfax.in/track/${encodeURIComponent(order.orderId)}`,
    riderName: "Assigning Shadowfax Rider...",
    riderPhone: "--",
  };

  if (isPlaceholder(apiKey) || isPlaceholder(clientCode)) {
    console.log(`[Mock Shadowfax Dispatch]: Order ${order.orderId}`);
    return mockResult;
  }

  try {
    const response = await axios.post<ShadowfaxResponse>(
      `${baseUrl}/api/v2/orders`,
      {
        client_code: clientCode,
        pickup_details: {
          name: "Noida Fried Chicken",
          address: "KB Complex, Alpha 2, Greater Noida",
          city: "Greater Noida",
        },
        delivery_details: {
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          deliveryAddress: order.deliveryAddress,
        },
        order_details: {
          order_id: order.orderId,
          order_value: order.totalAmount,
          paid: true,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    const data = response.data.data ?? response.data;
    return {
      trackingUrl:
        data.tracking_url || data.track_url || data.trackingUrl || mockResult.trackingUrl,
      riderName: data.rider_name || mockResult.riderName,
      riderPhone: data.rider_phone || mockResult.riderPhone,
    };
  } catch (err: unknown) {
    const errorDetails = axios.isAxiosError(err)
      ? err.response?.data || err.message
      : err instanceof Error
        ? err.message
        : err;
    console.error("Shadowfax Dispatch Error:", errorDetails);
    return mockResult;
  }
}
