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
  const frontendUrl = process.env.FRONTEND_URL || "https://siegma-logistics.vercel.app";
  const logoUrl = `${frontendUrl}/logo.jpg`;
  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Admin OTP - Siegma Logistics</title>
      </head>
      <body style="margin:0;padding:0;background:#eef2f7;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f7;padding:40px 16px;">
          <tr>
            <td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 30px rgba(0,0,0,0.10);">

                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 100%);padding:32px 40px;text-align:center;">
                    <img src="${logoUrl}" alt="Siegma Logistics" width="80" height="80"
                      style="border-radius:12px;border:3px solid rgba(255,255,255,0.3);margin-bottom:16px;display:block;margin-left:auto;margin-right:auto;" />
                    <h1 style="margin:0;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">Siegma Logistics</h1>
                    <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.8);letter-spacing:1px;text-transform:uppercase;">Secure Admin Verification</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:40px 40px 24px;">
                    <p style="margin:0 0 8px;font-size:18px;font-weight:600;color:#111827;">Hello, Admin!</p>
                    <p style="margin:0 0 28px;font-size:15px;color:#4b5563;line-height:1.6;">
                      We received a login request for your admin account. Use the one-time password below to complete your sign-in. This code expires in <strong>5 minutes</strong>.
                    </p>

                    <!-- OTP Box -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <div style="background:linear-gradient(135deg,#eff6ff,#dbeafe);border:2px solid #bfdbfe;border-radius:14px;padding:28px 32px;display:inline-block;text-align:center;">
                            <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#3b82f6;letter-spacing:2px;text-transform:uppercase;">One-Time Password</p>
                            <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:42px;font-weight:800;letter-spacing:14px;color:#1e3a8a;">${otp}</p>
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- Timer warning -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                      <tr>
                        <td style="background:#fefce8;border:1px solid #fde68a;border-radius:10px;padding:14px 18px;">
                          <p style="margin:0;font-size:13px;color:#92400e;">
                            &#9200; &nbsp;<strong>This OTP expires in 5 minutes.</strong> Do not share this code with anyone.
                          </p>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:28px 0 0;font-size:14px;color:#6b7280;line-height:1.6;">
                      If you did not attempt to log in, please ignore this email. Your account remains secure and no action is needed.
                    </p>
                  </td>
                </tr>

                <!-- Divider -->
                <tr>
                  <td style="padding:0 40px;">
                    <hr style="border:none;border-top:1px solid #e5e7eb;margin:0;" />
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding:20px 40px 32px;text-align:center;">
                    <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#374151;">Siegma Logistics</p>
                    <p style="margin:0;font-size:12px;color:#9ca3af;">Reliable. Secure. On Time.</p>
                    <p style="margin:12px 0 0;font-size:11px;color:#d1d5db;">
                      &copy; ${new Date().getFullYear()} Siegma Logistics. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
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
