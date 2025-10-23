// middleware.ts (ROOT)
// ✅ Properly protects all routes including API endpoints
// ✅ Allows public auth pages without protection
// ✅ Handles reset-password properly
import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/updateSession'
import { handleAuthMiddleware } from '@/lib/supabase/handleAuthMiddleware'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ✅ Internal Next.js paths (always allow without any checks)
  if (pathname.startsWith('/_next') || pathname.startsWith('/api/auth/callback')) {
    return NextResponse.next()
  }

  // ✅ For ALL other paths (including auth pages like /login, /signup):
  // 1) Refresh tokens and update cookies
  const refreshResponse = await updateSession(request)

  // 2) Run auth pipeline which handles:
  //    - Redirecting logged-in users away from /login, /signup
  //    - Redirecting non-logged users to /login when accessing protected routes
  //    - Allowing public paths for non-authenticated users
  const pipelineResponse = await handleAuthMiddleware(request)

  // If pipeline returned a response (redirect or modified), use it
  // Otherwise use refreshResponse (which may contain updated cookies)
  return pipelineResponse ?? refreshResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
