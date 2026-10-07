import axios from "axios";

export async function sendOrderWhatsApp(
  phone: string,
  customerName: string,
  orderToken: string,
  totalAmount: number,
  trackingUrl = `https://track.nfcorders.in/order/${orderToken}`
): Promise<void> {
  const token = process.env.META_WA_TOKEN?.trim();
  const phoneNumberId = process.env.META_WA_PHONE_NUMBER_ID?.trim();
  const templateName = process.env.META_WA_TEMPLATE_NAME?.trim() || "order_confirmation";

  const rawNumber = phone.replace(/[^0-9]/g, "");
  const recipient = rawNumber.startsWith("91")
    ? rawNumber
    : `91${rawNumber.slice(-10)}`;

  // Agar Meta keys add nahi hain toh mock print hoga
  if (!token || !phoneNumberId) {
    console.log(
      `[Mock WhatsApp (Meta Cloud API)]: To +${recipient} -> Hi ${customerName}, order #${orderToken} of Rs.${totalAmount} is placed! Track: ${trackingUrl}`
    );
    return;
  }

  try {
    const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;

    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipient,
      type: "template",
      template: {
        name: templateName,
        language: {
          code: "en",
        },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: customerName },
              { type: "text", text: `#${orderToken}` },
              { type: "text", text: `Rs.${totalAmount}. Track: ${trackingUrl}` },
            ],
          },
        ],
      },
    };

    const res = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log(
      `[Meta WhatsApp Success]: Sent to +${recipient} | Message ID: ${res.data?.messages?.[0]?.id}`
    );
  } catch (err: unknown) {
    const errorDetails = axios.isAxiosError(err)
      ? err.response?.data || err.message
      : err instanceof Error
      ? err.message
      : err;
    console.error("[Meta WhatsApp Error]:", errorDetails);
  }
}
