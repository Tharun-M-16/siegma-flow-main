import nodemailer from "nodemailer";

export const sendOTPEmail = async (to, otp) => {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
  const smtpSecure = (process.env.SMTP_SECURE || "").toLowerCase() === "true" || smtpPort === 465;
  const smtpFamily = parseInt(process.env.SMTP_FAMILY || "4", 10);
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";

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
    pool: {
      maxConnections: 5,
      maxMessages: 100,
    },
  });

  const mailOptions = {
    from: `"Siegma Logistics" <${smtpUser}>`,
    to,
    subject: "🔐 Your Admin Login OTP - Siegma Logistics",
    html: `
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
              max-width: 480px; 
              margin: 0 auto; 
              background: white; 
              border-radius: 14px; 
              box-shadow: 0 2px 8px rgba(0,0,0,0.1); 
              overflow: hidden;
            }
            .header { 
              background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%); 
              padding: 45px 30px; 
              text-align: center; 
            }
            .header-icon { 
              font-size: 48px; 
              margin-bottom: 12px; 
              display: block; 
            }
            .header-title { 
              color: white; 
              font-size: 26px; 
              font-weight: 700; 
              margin: 0 0 6px 0; 
            }
            .header-subtitle { 
              color: rgba(255,255,255,0.85); 
              font-size: 13px; 
              margin: 0; 
              font-weight: 500; 
            }
            .content { 
              padding: 36px 28px; 
            }
            .greeting { 
              font-size: 15px; 
              color: #1a1a2e; 
              font-weight: 600; 
              margin-bottom: 12px; 
            }
            .intro-text { 
              font-size: 14px; 
              color: #666; 
              line-height: 1.6; 
              margin-bottom: 28px; 
            }
            .otp-section-label { 
              font-size: 11px; 
              font-weight: 700; 
              color: #0066cc; 
              text-transform: uppercase; 
              letter-spacing: 1.2px; 
              margin-bottom: 10px; 
            }
            .otp-container { 
              background: linear-gradient(135deg, #f0f4ff 0%, #e8f2ff 100%); 
              border: 2px solid #0066cc; 
              border-radius: 12px; 
              padding: 32px 24px; 
              text-align: center; 
              margin: 0 0 28px 0; 
            }
            .otp-code { 
              font-size: 42px; 
              font-weight: 800; 
              color: #0052a3; 
              font-family: 'Courier New', 'Courier', monospace; 
              letter-spacing: 6px; 
              margin: 0; 
              word-break: break-all; 
              line-height: 1.2;
            }
            .otp-validity { 
              font-size: 12px; 
              color: #0066cc; 
              font-weight: 600; 
              margin-top: 12px; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              gap: 6px; 
            }
            .info-grid { 
              background-color: #f8fafb; 
              border: 1px solid #e6eaed; 
              border-radius: 10px; 
              padding: 20px; 
              margin: 24px 0; 
            }
            .info-row { 
              display: flex; 
              gap: 12px; 
              margin-bottom: 12px; 
            }
            .info-row:last-child { 
              margin-bottom: 0; 
            }
            .info-icon { 
              font-size: 16px; 
              min-width: 20px; 
              text-align: center; 
            }
            .info-text { 
              font-size: 13px; 
              color: #555; 
            }
            .info-text strong { 
              color: #1a1a2e; 
              font-weight: 600; 
            }
            .security-alert { 
              background-color: #fff9e6; 
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
