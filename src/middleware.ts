// middleware.ts (ROOT)
// ✅ Properly protects all routes including API endpoints
// ✅ Allows public auth pages without protection
// ✅ Handles reset-password properly
import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/updateSession'
import { handleAuthMiddleware } from '@/lib/supabase/handleAuthMiddleware'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ✅ Public paths that don't need authentication
  const publicPaths = [
    '/login',
    '/signup',
    '/forgot-password',
    '/public',
  ]

  // ✅ Paths that need special handling (still require auth but have different flow)
  const specialAuthPaths = [
    '/reset-password', // User must be authenticated to reset password
  ]

  // ✅ Internal Next.js paths (always allow)
  if (pathname.startsWith('/_next') || pathname.startsWith('/api/auth/callback')) {
    return NextResponse.next()
  }

  // ✅ Allow public paths without any auth checks
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // ✅ For all other paths (including /api/* and /reset-password):
  // 1) Refresh tokens and update cookies
  const refreshResponse = await updateSession(request)

  // 2) Run auth pipeline (checks if user is authenticated)
  const pipelineResponse = await handleAuthMiddleware(request)

  // If pipeline returned a response (redirect or modified), use it
  // Otherwise use refreshResponse (which may contain updated cookies)
  return pipelineResponse ?? refreshResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
