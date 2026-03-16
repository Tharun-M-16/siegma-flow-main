import nodemailer from "nodemailer";

export const sendOTPEmail = async (to, otp) => {
  const resendApiKey = process.env.RESEND_API_KEY || process.env.resend_api;
  const resendFrom = process.env.RESEND_FROM || process.env.SMTP_FROM || "onboarding@resend.dev";

  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
  const smtpSecure = (process.env.SMTP_SECURE || "").toLowerCase() === "true" || smtpPort === 465;
  const smtpFamily = parseInt(process.env.SMTP_FAMILY || "4", 10);
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpFrom =
    process.env.SMTP_FROM || (smtpUser && smtpUser.includes("@") ? smtpUser : "onboarding@resend.dev");

  const subject = "Your Admin Login OTP - Siegma Logistics";
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body style="margin:0;padding:20px;background:#f5f7fa;font-family:Arial,sans-serif;">
        <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.08);">
          <div style="background:#1e3a8a;color:#fff;padding:20px;text-align:center;">
            <h1 style="margin:0;font-size:22px;">Siegma Logistics</h1>
            <p style="margin:6px 0 0;font-size:13px;opacity:0.95;">Secure Admin Verification</p>
          </div>
          <div style="padding:24px;text-align:center;">
            <p style="margin:0 0 12px;font-size:16px;color:#111827;">Your one-time password is:</p>
            <div style="display:inline-block;padding:14px 18px;border:2px dashed #d1d5db;border-radius:10px;background:#f9fafb;">
              <span style="font-family:Courier New,monospace;font-size:30px;letter-spacing:8px;font-weight:700;color:#111827;">${otp}</span>
            </div>
            <p style="margin:16px 0 0;font-size:13px;color:#6b7280;">This OTP is valid for 5 minutes.</p>
          </div>
          <div style="padding:14px 20px;border-top:1px solid #e5e7eb;background:#fafafa;color:#9ca3af;font-size:12px;text-align:center;">
            If you did not request this login, you can ignore this email.
          </div>
        </div>
      </body>
    </html>
  `;

  // Prefer Resend API in production when key is provided.
  if (resendApiKey) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Siegma Logistics <${resendFrom}>`,
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Resend API failed (${response.status}): ${errorText}`);
    }

    return;
  }

  if (!smtpUser || !smtpPass) {
    const error = new Error("SMTP_USER/SMTP_PASS not configured");
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEV MODE] OTP for ${to}: ${otp}`);
    }
    throw error;
  }

  const transporter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE || undefined,
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    family: smtpFamily,
    tls: {
      servername: smtpHost,
      rejectUnauthorized: false,
    },
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    connectionTimeout: 10000,
    socketTimeout: 10000,
  });

  const mailOptions = {
    from: `"Siegma Logistics" <${smtpFrom}>`,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("OTP email send failed:", error.message);
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEV MODE] OTP for ${to}: ${otp}`);
    }
    throw error;
  }
};
