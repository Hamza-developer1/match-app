import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import EmailVerification from '@/models/EmailVerification';

const registerSchema = z.object({
  email: z.string().email().refine(
    (email) => email.endsWith('.edu'),
    { message: 'Only .edu email addresses are allowed' }
  ),
  password: z.string().min(8),
  name: z.string().min(2),
  verificationCode: z.string().length(6),
});

async function handleRegister(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, verificationCode } = registerSchema.parse(body);

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Verify the email verification code
    const verification = await EmailVerification.findOne({ 
      email,
      code: verificationCode,
      expiresAt: { $gt: new Date() }
    });

    if (!verification) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      isStudent: true,
      isEmailVerified: true,
    });

    // Delete the verification code after successful registration
    await EmailVerification.deleteOne({ _id: verification._id });

    return NextResponse.json(
      { message: 'User created successfully', userId: user._id },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message || 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = handleRegister;