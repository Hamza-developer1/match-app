import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import PasswordReset from '@/models/PasswordReset';
import { sendPasswordResetEmail } from '@/lib/email';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

async function handleForgotPassword(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = forgotPasswordSchema.parse(body);

    await connectToDatabase();

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Always return success to prevent email enumeration attacks
    const successResponse = NextResponse.json({
      message: 'If an account with that email exists, we\'ve sent a password reset link.',
    });

    if (!user) {
      return successResponse;
    }

    // Invalidate any existing reset tokens for this user
    await PasswordReset.updateMany(
      { userId: user._id, used: false },
      { used: true }
    );

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Create password reset record
    await PasswordReset.create({
      userId: user._id,
      token: resetToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    // Send reset email
    const emailResult = await sendPasswordResetEmail(email, resetToken);
    
    if (!emailResult.success) {
      console.error('Failed to send password reset email to:', email);
      // Still return success to user for security
    }

    return successResponse;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email address', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = handleForgotPassword;