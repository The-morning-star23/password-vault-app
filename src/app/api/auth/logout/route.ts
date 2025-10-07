// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = NextResponse.json(
      {
        message: 'Logout successful',
        success: true,
      }
    );

    // Set the token cookie to an empty value with an immediate expiration date
    response.cookies.set('token', '', { 
      httpOnly: true, 
      expires: new Date(0) 
    });

    return response;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}