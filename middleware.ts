import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith('/auth');

  // If not logged in and not on auth page, redirect to login
  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // If logged in and on auth page, redirect to log
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL('/log', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
