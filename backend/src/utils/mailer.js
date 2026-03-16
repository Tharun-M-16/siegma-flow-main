import nodemailer from "nodemailer";

export const sendOTPEmail = async (to, otp) => {
  const resendApiKey = process.env.RESEND_API_KEY || process.env.resend_api;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
  const smtpSecure = (process.env.SMTP_SECURE || "").toLowerCase() === "true" || smtpPort === 465;
  const smtpFamily = parseInt(process.env.SMTP_FAMILY || "4", 10);
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const resendFrom = process.env.RESEND_FROM || process.env.SMTP_FROM || "onboarding@resend.dev";
  const smtpFrom =
    process.env.SMTP_FROM || (smtpUser && smtpUser.includes("@") ? smtpUser : "onboarding@resend.dev");

  const subject = "🔐 Your Admin Login OTP - Siegma Logistics";
  const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              margin: 0;
              padding: 20px;
              background-color: #f5f7fa;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
              -webkit-font-smoothing: antialiased;
            }
            .container {
              max-width: 500px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 10px 30px rgba(0,0,0,0.08);
            }
            .header {
              background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
              color: white;
              padding: 30px 20px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 700;
            }
            .header p {
              margin: 8px 0 0;
              font-size: 14px;
              opacity: 0.95;
            }
            .content {
              padding: 30px 24px;
              text-align: center;
            }
            .greeting {
              font-size: 18px;
              color: #1f2937;
              margin-bottom: 8px;
              font-weight: 600;
            }
            .message {
              color: #6b7280;
              margin-bottom: 28px;
              font-size: 15px;
              line-height: 1.5;
            }
            .otp-box {
              display: inline-block;
              background: #f3f4f6;
              border: 2px dashed #d1d5db;
              border-radius: 12px;
              padding: 18px 24px;
              margin: 0 0 24px;
            }
            .otp-label {
              display: block;
              font-size: 12px;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 8px;
            }
            .otp-code {
              font-size: 32px;
              font-weight: 800;
              letter-spacing: 10px;
              color: #111827;
              font-family: 'Courier New', monospace;
              line-height: 1;
            }
            .warning {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 12px 14px;
              text-align: left;
              border-radius: 6px;
              margin-top: 8px;
              color: #92400e;
              font-size: 13px;
              line-height: 1.5;
            }
            .footer {
              border-top: 1px solid #e5e7eb;
              padding: 20px;
              text-align: center;
              color: #9ca3af;
              font-size: 12px;
              background: #fafafa;
            }
            @media only screen and (max-width: 600px) {
              body { padding: 10px; }
              .content { padding: 24px 16px; }
              .otp-box { width: 100%; padding: 16px 10px; }
              .otp-code {
                font-size: 28px;
                letter-spacing: 8px;
                white-space: nowrap;
                display: inline-block;
                width: 100%;
                text-align: center;
              }
            }
            @media only screen and (max-width: 420px) {
              .otp-code {
                font-size: 24px;
                letter-spacing: 6px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Siegma Logistics</h1>
              <p>Secure Admin Verification</p>
            </div>
            <div class="content">
              <div class="greeting">Your OTP is Ready</div>
              <div class="message">Use the one-time password below to complete your admin login.</div>
              <div class="otp-box">
                <span class="otp-label">One-Time Password</span>
                <span class="otp-code">${otp}</span>
              </div>
              <div class="warning">
                This OTP is valid for <strong>5 minutes</strong> and can only be used once.<br/>
                If you did not request this login, please ignore this email.
              </div>
            </div>
            <div class="footer">
              &copy; ${new Date().getFullYear()} Siegma Logistics. All rights reserved.
            </div>
          </div>
        </body>
      </html>
    `;

  // Prefer Resend API in production when key is provided; this avoids SMTP routing issues.
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
      subject,
      html,
              border: 1px solid #ffd54f; 
              border-left: 4px solid #ffc107; 
              border-radius: 8px; 
              padding: 16px; 
              margin: 24px 0; 
            }
            .alert-title { 
              font-weight: 700; 
              color: #856404; 
              font-size: 13px; 
              margin-bottom: 6px; 
            }
            .alert-text { 
              font-size: 13px; 
              color: #856404; 
              line-height: 1.5; 
            }
            .instructions { 
              background-color: #f8fafb; 
              border-radius: 10px; 
              padding: 20px; 
              margin: 24px 0; 
            }
            .instructions-title { 
              font-size: 14px; 
              font-weight: 700; 
              color: #1a1a2e; 
              margin-bottom: 12px; 
            }
            .instructions ol { 
              margin: 0; 
              padding-left: 20px; 
            }
            .instructions li { 
              font-size: 13px; 
              color: #555; 
              line-height: 1.7; 
              margin-bottom: 8px; 
            }
            .footer { 
              background-color: #f8fafb; 
              padding: 24px 28px; 
              text-align: center; 
              border-top: 1px solid #e6eaed; 
            }
            .footer-text { 
              font-size: 11px; 
              color: #999; 
              margin: 0 0 4px 0; 
            }
            .footer-links { 
              font-size: 11px; 
              color: #999; 
              margin: 8px 0 0 0; 
            }
            .footer-link { 
              color: #0066cc; 
              text-decoration: none; 
            }
            @media (max-width: 480px) {
              body { padding: 12px; }
              .container { border-radius: 12px; }
              .content { padding: 28px 20px; }
              .header { padding: 36px 24px; }
              .header-title { font-size: 24px; }
              .header-subtitle { font-size: 12px; }
              .otp-code { font-size: 36px; letter-spacing: 4px; }
              .otp-container { padding: 28px 20px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="header-icon">✓</div>
              <h1 class="header-title">Verification Code</h1>
              <p class="header-subtitle">Your secure login code</p>
            </div>
            
            <div class="content">
              <p class="greeting">Hi Siegma Admin,</p>
              
              <p class="intro-text">
                We received a login request for your admin account. Use the verification code below to complete your login. This code will expire in 5 minutes.
              </p>
              
              <div class="otp-section-label">Your Verification Code</div>
              <div class="otp-container">
                <p class="otp-code">${otp}</p>
                <div class="otp-validity">⏱️ Valid for 5 minutes</div>
              </div>
              
              <div class="info-grid">
                <div class="info-row">
                  <div class="info-icon">🔒</div>
                  <div class="info-text"><strong>Security:</strong> Never share your code with anyone</div>
                </div>
                <div class="info-row">
                  <div class="info-icon">📱</div>
                  <div class="info-text"><strong>Mobile Friendly:</strong> This code works on any device</div>
                </div>
                <div class="info-row">
                  <div class="info-icon">🚫</div>
                  <div class="info-text"><strong>Expiry:</strong> Code expires after 5 minutes</div>
                </div>
              </div>
              
              <div class="security-alert">
                <div class="alert-title">🔐 Security Notice</div>
                <div class="alert-text">
                  Siegma Logistics staff will never ask for your verification code. If you didn't request this code, ignore this email and your account will remain safe.
                </div>
              </div>
              
              <div class="instructions">
                <div class="instructions-title">How to use your code:</div>
                <ol>
                  <li>Copy the 6-digit code above</li>
                  <li>Return to the login page</li>
                  <li>Enter the code in the verification field</li>
                  <li>Click "Verify" to complete login</li>
                </ol>
              </div>
            </div>
            
            <div class="footer">
              <p class="footer-text">© Siegma Logistics. All rights reserved.</p>
              <p class="footer-text">This is an automated secure message. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    console.log(`Attempting to send OTP email to ${to} via ${smtpHost}:${smtpPort}...`);
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${to}`);
  } catch (error) {
    console.error("❌ Failed to send OTP email:", {
      message: error.message,
      code: error.code,
      responseCode: error.responseCode,
      response: error.response,
      command: error.command,
    });
    if (process.env.NODE_ENV === "development") {
      console.log(`\n📋 [DEV MODE] Use this OTP to login: ${otp}\n`);
    }
    throw error;
  }
};
