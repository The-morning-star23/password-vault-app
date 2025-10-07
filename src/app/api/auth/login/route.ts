// src/app/api/auth/login/route.ts

import dbConnect from '@/lib/dbConnect';
import UserModel from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { email, password } = await request.json();

    const user = await UserModel.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create JWT token
    const tokenPayload = {
      id: user._id,
      email: user.email,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET!, {
      expiresIn: '1d', // Token expires in 1 day
    });

    const response = NextResponse.json(
      { success: true, message: 'Login successful' },
      { status: 200 }
    );

    // Set token in a secure, HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 1, // 1 day
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Error logging in:', error);
    return NextResponse.json(
      { success: false, message: 'Error logging in' },
      { status: 500 }
    );
  }
}