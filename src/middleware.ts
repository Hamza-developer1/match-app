import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { apiRateLimit, authRateLimit } from './lib/rate-limit'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Handle POST requests to root that are causing 405 errors
  if (pathname === '/' && request.method === 'POST') {
    // Only log in development to reduce noise
    if (process.env.NODE_ENV === 'development') {
      console.log('POST to root from:', request.headers.get('referer') || 'unknown');
    }
    
    return new NextResponse(
      JSON.stringify({ message: 'Request handled by middleware' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
  
  // Apply rate limiting to API routes
  if (pathname.startsWith('/api/')) {
    // Stricter rate limiting for auth routes, except frequent-use endpoints
    const frequentAuthEndpoints = ['/api/auth/session', '/api/auth/providers'];
    if (pathname.startsWith('/api/auth/') && !frequentAuthEndpoints.includes(pathname)) {
      const rateLimitResponse = await authRateLimit(request)
      if (rateLimitResponse) return rateLimitResponse
    } else {
      // General API rate limiting (including frequent auth endpoints)
      const rateLimitResponse = await apiRateLimit(request)
      if (rateLimitResponse) return rateLimitResponse
    }
  }
  
  // Define valid routes
  const validRoutes = [
    '/',
    '/auth/signin',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/profile',
    '/discover',
    '/messages',
    '/connections',
    '/support',
    '/about',
    '/terms',
    '/privacy',
    '/settings',
    '/api/auth/register',
    '/api/auth/send-verification',
    '/api/auth/verify-email',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/auth/[...nextauth]',
    '/api/profile',
    '/api/discover',
    '/api/matches',
    '/api/messages/send',
    '/api/messages/conversations',
    '/api/messages/[matchId]'
  ]
  
  // Check for API routes with dynamic segments
  const apiRoutePatterns = [
    /^\/api\/auth\/.+$/,
    /^\/api\/messages\/[^\/]+$/
  ]
  
  // Check if it's a valid static route
  const isValidStaticRoute = validRoutes.includes(pathname)
  
  // Check if it matches any API route pattern
  const isValidApiRoute = apiRoutePatterns.some(pattern => pattern.test(pathname))
  
  // Allow icon and static assets
  if (pathname === '/icon.svg' || pathname.startsWith('/_next/') || pathname.startsWith('/static/')) {
    return NextResponse.next()
  }
  
  // If route is not valid, redirect to homepage
  if (!isValidStaticRoute && !isValidApiRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - icon.svg (icon file)
     */
    '/((?!_next/static|_next/image|icon.svg).*)',
  ],
}