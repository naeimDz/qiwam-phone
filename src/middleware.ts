// middleware.ts (ROOT LEVEL)
import { updateSession } from '@/lib/supabase/middleware'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // Refresh session tokens
  const response = await updateSession(request)
  
  const pathname = request.nextUrl.pathname

  // Allow public routes
  if (pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/signup')) {
    return response
  }

  // For protected routes, session check is enough
  // RLS will handle the rest
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}