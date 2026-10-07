import nodemailer from "nodemailer";

export async function sendOrderEmail(
  toEmail: string,
  customerName: string,
  orderToken: string,
  totalAmount: number,
  trackingUrl: string
): Promise<void> {
  const emailUser = process.env.EMAIL_USER?.trim();
  const emailPass = process.env.EMAIL_PASS?.trim();

  if (!emailUser || !emailPass || !toEmail.trim()) {
    console.log("[Mock Email]: Email credentials or recipient missing.");
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: emailUser, pass: emailPass },
    });

    await transporter.sendMail({
      from: `"Noida Fried Chicken" <${emailUser}>`,
      to: toEmail,
      subject: `Order Confirmed #${orderToken} - Noida Fried Chicken`,
      html: `
        <h2>Thank you for your order, ${customerName}!</h2>
        <p>Your order worth <b>Rs.${totalAmount}</b> is confirmed and being prepared fresh.</p>
        <p><b>Live Order Tracking:</b> <a href="${trackingUrl}">${trackingUrl}</a></p>
      `,
    });
  } catch (err: unknown) {
    console.error("Email Dispatch Error:", err);
  }
}
