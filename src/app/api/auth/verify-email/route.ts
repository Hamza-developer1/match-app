import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { timingSafeEqual } from 'crypto';
import connectToDatabase from '@/lib/mongodb';
import EmailVerification from '@/models/EmailVerification';
import User from '@/models/User';

const verifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

// Constant-time string comparison to prevent timing attacks
function constantTimeStringEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  const bufferA = Buffer.from(a, 'utf8');
  const bufferB = Buffer.from(b, 'utf8');
  
  return timingSafeEqual(bufferA, bufferB);
}

async function handleVerifyEmail(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code } = verifyEmailSchema.parse(body);

    await connectToDatabase();

    const verification = await EmailVerification.findOne({ 
      email,
      expiresAt: { $gt: new Date() }
    });

    if (!verification) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    // Check attempt limit
    if (verification.attempts >= 5) {
      await EmailVerification.deleteOne({ _id: verification._id });
      return NextResponse.json(
        { error: 'Too many failed attempts. Please request a new code.' },
        { status: 429 }
      );
    }

    // Perform constant-time comparison first
    const isCodeValid = constantTimeStringEqual(verification.code, code);
    
    if (!isCodeValid) {
      // Only increment attempts on failed verification
      verification.attempts += 1;
      await verification.save();
      
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Mark email as verified
    await User.updateOne(
      { email },
      { isEmailVerified: true }
    );

    // Delete the verification code
    await EmailVerification.deleteOne({ _id: verification._id });

    return NextResponse.json(
      { message: 'Email verified successfully' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Verify email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = handleVerifyEmail;