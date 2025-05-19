import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"Library Management" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

export function getPasswordResetTemplate(resetLink: string, userName: string = 'User', expiryHours: number = 1) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f9f9f9;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 1px solid #eaeaea;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
        }
        .content {
          padding: 20px 0;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          margin: 20px 0;
          background-color: #2563eb;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          font-weight: 500;
          text-align: center;
        }
        .footer {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #eaeaea;
          color: #666;
          font-size: 14px;
        }
        .expiry {
          background-color: #f8fafc;
          padding: 10px;
          border-radius: 4px;
          margin: 15px 0;
          font-size: 14px;
          color: #64748b;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Library Management System</div>
        </div>
        <div class="content">
          <h2>Reset Your Password</h2>
          <p>Hello ${userName},</p>
          <p>We received a request to reset your password for your Staff account. Click the button below to set a new password:</p>
          
          <div style="text-align: center;">
            <a href="${resetLink}" class="button">Reset Password</a>
          </div>
          
          <div class="expiry">
            <p>This link is valid for ${expiryHours} hour${expiryHours !== 1 ? 's' : ''} and can only be used once.</p>
            <p>If you did not request a password reset, please ignore this email or contact the system administrator.</p>
          </div>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; font-size: 14px;">${resetLink}</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Library Management System. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
