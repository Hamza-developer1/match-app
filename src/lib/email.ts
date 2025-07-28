import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
) {
  const resetUrl = `${
    process.env.NEXTAUTH_URL || "http://localhost:3000"
  }/auth/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: "Reset Your MatchApp Password",
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3b82f6; margin: 0;">🎓 MatchApp</h1>
        </div>
        
        <h2 style="color: #374151; margin-bottom: 20px;">Reset Your Password</h2>
        
        <p style="color: #6b7280; line-height: 1.6; margin-bottom: 20px;">
          We received a request to reset your password for your MatchApp account. 
          Click the button below to create a new password:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background: linear-gradient(to right, #3b82f6, #6366f1); 
                    color: white; 
                    padding: 12px 30px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    display: inline-block;
                    font-weight: 600;">
            Reset Password
          </a>
        </div>
        
        <p style="color: #6b7280; line-height: 1.6; margin-bottom: 10px;">
          Or copy and paste this link into your browser:
        </p>
        <p style="color: #3b82f6; word-break: break-all; margin-bottom: 20px;">
          ${resetUrl}
        </p>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
          <p style="color: #9ca3af; font-size: 14px; margin-bottom: 10px;">
            This link will expire in 1 hour for security reasons.
          </p>
          <p style="color: #9ca3af; font-size: 14px; margin: 0;">
            If you didn't request this password reset, please ignore this email or contact support if you have concerns.
          </p>
        </div>
      </div>
    `,
    text: `
Reset Your MatchApp Password

We received a request to reset your password. Click the link below to create a new password:

${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request this password reset, please ignore this email.
    `,
  };

  try {
    console.log('Attempting to send email to:', email);
    console.log('SMTP Config:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      from: process.env.SMTP_FROM,
      secure: process.env.SMTP_SECURE === 'true'
    });
    
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true };
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    return { success: false, error: "Failed to send email" };
  }
}