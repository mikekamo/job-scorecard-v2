import { NextResponse } from 'next/server'

export function middleware(request) {
  // Skip middleware for API routes and static assets
  if (
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.startsWith('/favicon.ico') ||
    request.nextUrl.pathname.startsWith('/uploads/')
  ) {
    return NextResponse.next()
  }

  // Check if user is already authenticated
  const isAuthenticated = request.cookies.get('authenticated')?.value === 'true'
  
  // If accessing login page
  if (request.nextUrl.pathname === '/login') {
    // If already authenticated, redirect to home
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // If not authenticated and not on login page, redirect to login
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
} 