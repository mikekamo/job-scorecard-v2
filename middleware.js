import { NextResponse } from 'next/server'

export function middleware(request) {
  // Authentication temporarily disabled - allow all requests
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
} 