import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import connectToDatabase from '@/lib/mongodb';
import EmailVerification from '@/models/EmailVerification';
import { sendEmail } from '@/lib/email';

const sendVerificationSchema = z.object({
  email: z.string().email().refine(
    (email) => email.endsWith('.edu'),
    { message: 'Only .edu email addresses are allowed' }
  ),
});

function generateVerificationCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

async function handleSendVerification(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = sendVerificationSchema.parse(body);

    await connectToDatabase();

    // Delete any existing verification codes for this email
    await EmailVerification.deleteMany({ email });

    const code = generateVerificationCode();
    
    // Create new verification code
    await EmailVerification.create({
      email,
      code,
    });

    // Send verification email
    await sendEmail({
      to: email,
      subject: 'Email Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Verification</h2>
          <p>Your verification code is:</p>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 20px 0;">
            ${code}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this verification, please ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json(
      { message: 'Verification code sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Send verification error:', error);
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
}

export const POST = handleSendVerification;