// src/lib/supabase/updateSession.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { supabaseUrl, supabaseAnonKey } from './config'

/**
 * Lightweight session refresh layer.
 * Purpose: trigger supabase token refresh (if refresh_token present)
 * and write updated cookies into the response.
 *
 * This function should be the first layer executed by middleware,
 * so tokens are fresh for following auth logic.
 */
export async function updateSession(request: NextRequest) {
  // prepare a mutable response we can set cookies on
  const response = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    // adapter: use request.cookies for reads and response.cookies for writes
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        // write cookies into the response (only place allowed)
        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            response.cookies.set(name, value, options)
          } catch (e) {
            // defensive: some environments may be strict; ignore gracefully
          }
        })
      },
    },
  })

  try {
    // triggers refresh flow inside supabase/ssr
    await supabase.auth.getUser()
  } catch (err: any) {
        // 🚫 في حالة خطأ (كوكيز فاسدة، مثلاً) نحذفها باش نمنع مشاكل لاحقاً
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirected', 'true')
    return NextResponse.redirect(redirectUrl)
    // Do not break the request; just log in server logs if needed
    // console.warn('updateSession error', err)
        // يمكن تضيف:
    // console.warn('Supabase session refresh failed:', error)
  }

  return response
}
