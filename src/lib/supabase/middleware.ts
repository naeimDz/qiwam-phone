// src/lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // prepare a mutable response that we can set cookies on
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // adapter for NextRequest / NextResponse
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: any[]) => {
          cookiesToSet.forEach(({ name, value, options }: any) => {
            // set cookie on the response
            response.cookies.set(name, value, options as any)
          })
        },
      },
    }
  )

  // this triggers token refresh if needed and writes cookies via setAll above
  // IMPORTANT: we don't rely on returned user here; middleware only refreshes tokens
  try {
    await supabase.auth.getUser()
  } catch (err) {
    // don't break requests on middleware error — just log (or attach header) if needed
    // console.error('middleware updateSession error', err)
  }

  return response
}
