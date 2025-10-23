// middleware.ts (ROOT)
import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/updateSession'
import { handleAuthMiddleware } from '@/lib/supabase/handleAuthMiddleware'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // السماح بالوصول للصفحات العامة
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/public') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next()
  }
  // 1) ensure tokens are refreshed and cookies are written
  const refreshResponse = await updateSession(request)

  // 2) run auth pipeline (may redirect or modify cookies)
  const pipelineResponse = await handleAuthMiddleware(request)

  // If pipeline returned a NextResponse (redirect / modified), use it
  // Otherwise use the refreshResponse (which might include refreshed cookies).
  return pipelineResponse ?? refreshResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
