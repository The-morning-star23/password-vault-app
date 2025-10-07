import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isPublicPath = path === '/' || path === '/login' || path === '/signup';

  const token = request.cookies.get('token')?.value || '';

  if (isPublicPath && token) {
    // If user is logged in and tries to access login/signup, redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.nextUrl));
  }

  if (!isPublicPath && !token) {
    // If user is not logged in and tries to access a protected route, redirect to login
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/',
    '/dashboard',
    '/login',
    '/signup',
  ],
};