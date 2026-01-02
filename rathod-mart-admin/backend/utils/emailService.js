// backend/utils/emailService.js
import nodemailer from "nodemailer";

/**
 * Create a Nodemailer transporter using Gmail SMTP
 */
const createTransporter = () => {
  // Check if email credentials are configured
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("⚠️ Email credentials not configured. Emails will be logged to console.");
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Send an email using Nodemailer
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"Rathod Mart" <${process.env.EMAIL_FROM || process.env.SMTP_USER || "noreply@rathodmart.com"}>`,
    to,
    subject,
    text,
    html,
  };

  // If no transporter (credentials not set), log to console for development
  if (!transporter) {
    console.log("\n📧 ========== EMAIL (DEV MODE) ==========");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Text: ${text}`);
    console.log("HTML Preview: (check browser at the reset link)");
    console.log("==========================================\n");
    return { success: true, mode: "console" };
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    throw new Error("Failed to send email. Please try again later.");
  }
};

/**
 * Send password reset email for customers
 * @param {string} email - User's email
 * @param {string} resetUrl - Password reset URL
 * @param {string} name - User's name
 */
export const sendPasswordResetEmail = async (email, resetUrl, name = "User") => {
  const subject = "🔐 Password Reset Request - Rathod Mart";
  
  const text = `
Hello ${name},

You requested a password reset for your Rathod Mart account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 10 minutes.

If you didn't request this, please ignore this email. Your password will remain unchanged.

Best regards,
Rathod Mart Team
  `;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #4CAF50 100%); padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🛒 Rathod Mart</h1>
      </td>
    </tr>
    
    <!-- Content -->
    <tr>
      <td style="padding: 40px 30px;">
        <h2 style="color: #1B5E20; margin: 0 0 20px 0; font-size: 24px;">Password Reset Request</h2>
        
        <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          Hello <strong>${name}</strong>,
        </p>
        
        <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          We received a request to reset your password for your Rathod Mart account. Click the button below to create a new password:
        </p>
        
        <!-- Button -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="text-align: center; padding: 20px 0;">
              <a href="${resetUrl}" 
                 style="display: inline-block; background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);">
                🔐 Reset My Password
              </a>
            </td>
          </tr>
        </table>
        
        <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0;">
          Or copy and paste this link into your browser:<br>
          <a href="${resetUrl}" style="color: #2E7D32; word-break: break-all;">${resetUrl}</a>
        </p>
        
        <!-- Warning Box -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFF3E0; border-radius: 8px; margin: 20px 0;">
          <tr>
            <td style="padding: 15px;">
              <p style="color: #E65100; font-size: 14px; margin: 0;">
                ⏰ <strong>This link will expire in 10 minutes.</strong><br>
                If the link expires, you can request a new one.
              </p>
            </td>
          </tr>
        </table>
        
        <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
          If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
        </p>
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="background-color: #f9f9f9; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
        <p style="color: #999999; font-size: 12px; margin: 0;">
          © 2024 Rathod Mart. All rights reserved.<br>
          This is an automated message. Please do not reply.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return sendEmail({ to: email, subject, text, html });
};

/**
 * Send password reset email for admin users
 * @param {string} email - Admin's email
 * @param {string} resetUrl - Password reset URL
 * @param {string} name - Admin's name
 */
export const sendAdminPasswordResetEmail = async (email, resetUrl, name = "Admin") => {
  const subject = "🔐 Admin Password Reset - Rathod Mart Dashboard";
  
  const text = `
Hello ${name},

You requested a password reset for your Rathod Mart Admin account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 10 minutes.

If you didn't request this, please contact the system administrator immediately.

Best regards,
Rathod Mart System
  `;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #4CAF50 100%); padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🛒 Rathod Mart</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Admin Dashboard</p>
      </td>
    </tr>
    
    <!-- Content -->
    <tr>
      <td style="padding: 40px 30px;">
        <h2 style="color: #1B5E20; margin: 0 0 20px 0; font-size: 24px;">Admin Password Reset</h2>
        
        <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          Hello <strong>${name}</strong>,
        </p>
        
        <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          A password reset was requested for your admin account. Click the button below to set a new password:
        </p>
        
        <!-- Button -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="text-align: center; padding: 20px 0;">
              <a href="${resetUrl}" 
                 style="display: inline-block; background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);">
                🔐 Reset Admin Password
              </a>
            </td>
          </tr>
        </table>
        
        <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0;">
          Or copy and paste this link:<br>
          <a href="${resetUrl}" style="color: #2E7D32; word-break: break-all;">${resetUrl}</a>
        </p>
        
        <!-- Warning Box -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFEBEE; border-radius: 8px; margin: 20px 0;">
          <tr>
            <td style="padding: 15px;">
              <p style="color: #C62828; font-size: 14px; margin: 0;">
                ⚠️ <strong>Security Notice:</strong> This link expires in 10 minutes.<br>
                If you didn't request this reset, please contact the administrator immediately.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="background-color: #f9f9f9; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
        <p style="color: #999999; font-size: 12px; margin: 0;">
          © 2024 Rathod Mart Admin System<br>
          This is an automated security message.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return sendEmail({ to: email, subject, text, html });
};

/**
 * Send password changed confirmation email
 * @param {string} email - User's email
 * @param {string} name - User's name
 */
export const sendPasswordChangedEmail = async (email, name = "User") => {
  const subject = "✅ Password Changed Successfully - Rathod Mart";
  
  const text = `
Hello ${name},

Your password has been successfully changed.

If you did not make this change, please contact us immediately or reset your password.

Best regards,
Rathod Mart Team
  `;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <tr>
      <td style="background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #4CAF50 100%); padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🛒 Rathod Mart</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 30px; text-align: center;">
        <div style="font-size: 60px; margin-bottom: 20px;">✅</div>
        <h2 style="color: #1B5E20; margin: 0 0 20px 0;">Password Changed Successfully</h2>
        <p style="color: #333333; font-size: 16px; line-height: 1.6;">
          Hello <strong>${name}</strong>,<br><br>
          Your password has been updated successfully.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #E8F5E9; border-radius: 8px; margin: 20px 0;">
          <tr>
            <td style="padding: 15px;">
              <p style="color: #2E7D32; font-size: 14px; margin: 0;">
                🔒 Your account is secure.
              </p>
            </td>
          </tr>
        </table>
        <p style="color: #666666; font-size: 14px;">
          If you didn't make this change, please reset your password immediately.
        </p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
        <p style="color: #999999; font-size: 12px; margin: 0;">© 2024 Rathod Mart</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return sendEmail({ to: email, subject, text, html });
};

/**
 * Send login notification email
 * @param {string} email - User's email
 * @param {string} name - User's name
 * @param {Object} loginInfo - Login details
 */
export const sendLoginNotificationEmail = async (email, name = "User", loginInfo = {}) => {
  const loginTime = new Date().toLocaleString("en-IN", { 
    timeZone: "Asia/Kolkata",
    dateStyle: "full",
    timeStyle: "short"
  });
  
  const subject = "🔔 New Login to Your Rathod Mart Account";
  
  const text = `
Hello ${name},

A new login to your Rathod Mart account was detected.

Login Details:
- Time: ${loginTime}
- Method: ${loginInfo.method || "Email/Password"}
${loginInfo.isAdmin ? "- Panel: Admin Dashboard" : "- Panel: Customer Portal"}

If this was you, you can ignore this email.

If you didn't log in, please reset your password immediately.

Best regards,
Rathod Mart Security Team
  `;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <tr>
      <td style="background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #4CAF50 100%); padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🛒 Rathod Mart</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 30px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <span style="font-size: 50px;">🔔</span>
        </div>
        <h2 style="color: #1B5E20; margin: 0 0 20px 0; text-align: center;">New Login Detected</h2>
        
        <p style="color: #333333; font-size: 16px; line-height: 1.6;">
          Hello <strong>${name}</strong>,
        </p>
        
        <p style="color: #333333; font-size: 16px; line-height: 1.6;">
          We noticed a new login to your Rathod Mart account.
        </p>
        
        <!-- Login Details Box -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #E3F2FD; border-radius: 8px; margin: 20px 0;">
          <tr>
            <td style="padding: 20px;">
              <table width="100%">
                <tr>
                  <td style="color: #1565C0; font-size: 14px; padding: 5px 0;">
                    <strong>⏰ Time:</strong> ${loginTime}
                  </td>
                </tr>
                <tr>
                  <td style="color: #1565C0; font-size: 14px; padding: 5px 0;">
                    <strong>🔐 Method:</strong> ${loginInfo.method || "Email/Password"}
                  </td>
                </tr>
                <tr>
                  <td style="color: #1565C0; font-size: 14px; padding: 5px 0;">
                    <strong>📱 Panel:</strong> ${loginInfo.isAdmin ? "Admin Dashboard" : "Customer Portal"}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- Security Notice -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #E8F5E9; border-radius: 8px; margin: 20px 0;">
          <tr>
            <td style="padding: 15px;">
              <p style="color: #2E7D32; font-size: 14px; margin: 0;">
                ✅ If this was you, no action is needed.
              </p>
            </td>
          </tr>
        </table>
        
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFF3E0; border-radius: 8px; margin: 20px 0;">
          <tr>
            <td style="padding: 15px;">
              <p style="color: #E65100; font-size: 14px; margin: 0;">
                ⚠️ <strong>Wasn't you?</strong> Reset your password immediately to secure your account.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
        <p style="color: #999999; font-size: 12px; margin: 0;">
          © 2024 Rathod Mart Security<br>
          This is an automated security notification.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  // Don't throw error for login notification - just log it
  try {
    return await sendEmail({ to: email, subject, text, html });
  } catch (error) {
    console.warn("⚠️ Failed to send login notification email:", error.message);
    return { success: false, error: error.message };
  }
};

export default {
  sendEmail,
  sendPasswordResetEmail,
  sendAdminPasswordResetEmail,
  sendPasswordChangedEmail,
  sendLoginNotificationEmail,
};
