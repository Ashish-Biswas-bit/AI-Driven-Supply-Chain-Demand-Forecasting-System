import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const TOKEN_KEY = 'sc_access_token'

// Routes that don't require authentication
const publicRoutes = ['/', '/login', '/signup', '/subscribe']

// API routes that should be passed through
const apiRoutes = ['/api/']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow all API routes to pass through (they're handled by backend auth)
  if (apiRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Check for auth token in cookies (set by login page)
  const token = request.cookies.get(TOKEN_KEY)?.value
    ?? request.cookies.get('sc_access_token')?.value

  // If no token and trying to access a protected route, redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
