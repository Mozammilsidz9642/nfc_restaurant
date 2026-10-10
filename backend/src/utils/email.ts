import nodemailer from "nodemailer";

function createEmailTransporter() {
  const emailUser = process.env.EMAIL_USER?.trim();
  const emailPass = process.env.EMAIL_PASS?.trim();
  if (!emailUser || !emailPass) {
    throw new Error("Email delivery is not configured");
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: emailUser, pass: emailPass },
  });
}

export async function sendManagerPasswordResetOtp(toEmail: string, otp: string): Promise<void> {
  const emailUser = process.env.EMAIL_USER?.trim();
  if (!emailUser) throw new Error("Email delivery is not configured");
  const transporter = createEmailTransporter();
  await transporter.sendMail({
    from: `"NFC Partner" <${emailUser}>`,
    to: toEmail,
    subject: "NFC Partner - Manager Password Reset OTP",
    text: `Your NFC Partner password reset code is ${otp}. It expires in 10 minutes. If you did not request this, you can ignore this email.`,
    html: `<p>Your NFC Partner password reset code is:</p><p style="font-size:24px;font-weight:bold;letter-spacing:6px">${otp}</p><p>This code expires in 10 minutes. If you did not request this, you can ignore this email.</p>`,
  });
}

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
    const transporter = createEmailTransporter();

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

export async function sendCustomerVerificationOtp(
  toEmail: string,
  customerName: string,
  otp: string
): Promise<void> {
  const emailUser = process.env.EMAIL_USER?.trim();
  const emailPass = process.env.EMAIL_PASS?.trim();

  console.log(`[Customer Verification OTP] Sent to ${toEmail} (${customerName}): ${otp}`);

  if (!emailUser || !emailPass || !toEmail.trim()) {
    console.log("[Mock Email OTP]: Email credentials or recipient missing; using logged OTP.");
    return;
  }

  try {
    const transporter = createEmailTransporter();
    await transporter.sendMail({
      from: `"Noida Fried Chicken" <${emailUser}>`,
      to: toEmail,
      subject: `${otp} is your Noida Fried Chicken verification code`,
      text: `Hello ${customerName || "Customer"},\n\nYour 6-digit verification code to complete your order is: ${otp}\n\nThis code will expire in 10 minutes.\n\nThank you,\nNoida Fried Chicken`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e7e5e4; border-radius: 16px; background-color: #fafaf9;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #991b1b; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">NOIDA FRIED CHICKEN</h1>
            <p style="color: #78716c; margin: 4px 0 0 0; font-size: 13px;">Freshly prepared. Richly spiced.</p>
          </div>
          <div style="background: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #e7e5e4; text-align: center;">
            <p style="color: #292524; font-size: 15px; margin: 0 0 12px 0;">Hello <b>${customerName || "Customer"}</b>,</p>
            <p style="color: #57534e; font-size: 14px; margin: 0 0 20px 0;">Please use this one-time code to verify your email before payment:</p>
            <div style="display: inline-block; background: #fef2f2; border: 2px dashed #dc2626; border-radius: 12px; padding: 12px 28px; margin-bottom: 20px;">
              <span style="font-family: monospace; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #991b1b;">${otp}</span>
            </div>
            <p style="color: #78716c; font-size: 12px; margin: 0;">This code is valid for 10 minutes. Do not share this code with anyone.</p>
          </div>
        </div>
      `,
    });
  } catch (err: unknown) {
    console.error("Customer OTP Email Dispatch Warning:", err);
  }
}

