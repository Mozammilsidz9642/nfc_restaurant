import axios from "axios";

export async function sendOrderSMS(
  phone: string,
  customerName: string,
  orderToken: string,
  totalAmount: number
): Promise<void> {
  const apiKey = process.env.FAST2SMS_API_KEY?.trim();
  const cleanPhone = phone.replace(/[^0-9]/g, "").slice(-10);
  const message = `Hi ${customerName}, your NFC order #${orderToken} of Rs.${totalAmount} is confirmed!`;

  console.log(`[SMS Initiated] Sending to ${cleanPhone} with key present: ${!!apiKey}`);

  if (!apiKey) {
    console.log("[Mock SMS]: FAST2SMS_API_KEY missing in .env");
    return;
  }

  try {
    const res = await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        route: "q",
        message,
        language: "english",
        flash: 0,
        numbers: cleanPhone,
      },
      {
        headers: {
          authorization: apiKey,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("[Fast2SMS API Response]:", res.data);
  } catch (err: any) {
    console.error(
      "[Fast2SMS API Error]:",
      err.response ? err.response.data : err.message
    );
  }
}