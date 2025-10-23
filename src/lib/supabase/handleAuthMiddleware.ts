// src/lib/supabase/handleAuthMiddleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseUrl, supabaseAnonKey } from './config'

export interface MiddlewareContext {
  request: NextRequest
  response: NextResponse
  user: any | null
  isAuthenticated: boolean
  supabase: ReturnType<typeof createServerClient>
}

/**
 * Build middleware context: response, supabase server client, user.
 * Note: we DO NOT mutate request.cookies here. Only read from it.
 */
export async function createAuthMiddleware(request: NextRequest): Promise<MiddlewareContext> {
  const response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        // write updates into the response so browser will receive them
        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            response.cookies.set(name, value, options)
          } catch (e) {
            // ignore if environment incompatible, but we still continue
          }
        })
      },
    },
  })

  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user ?? null
  } catch (err) {
    user = null
  }

  return { request, response, user, isAuthenticated: !!user, supabase }
}

/**
 * Lightweight rules DSL — keep it small and testable.
 * Extend this to use roles, subscriptions, rate limits, etc.
 */
export function createAuthRules() {
  const protectedPaths = ['/dashboard', '/app', '/profile', '/settings']
  const authPaths = ['/login', '/signup', '/forgot-password']
  const publicStarts = ['/', '/about', '/pricing']

  return {
    isProtected(path: string) {
      return protectedPaths.some((p) => path === p || path.startsWith(p + '/'))
    },
    isAuthPath(path: string) {
      return authPaths.some((p) => path === p || path.startsWith(p + '/'))
    },
    isPublic(path: string) {
      return publicStarts.some((p) => path === p || path.startsWith(p + '/'))
    },
  }
}

/**
 * Core pipeline: returns a NextResponse when it wants to short-circuit (redirect or modify cookies).
 * Otherwise returns null to indicate no special action (use original response).
 */
export async function authPipeline(context: MiddlewareContext): Promise<NextResponse | null> {
  const rules = createAuthRules()
  const pathname = context.request.nextUrl.pathname

  // 1) If protected and not authenticated -> redirect to login
  if (rules.isProtected(pathname) && !context.isAuthenticated) {
    const destination = new URL('/login', context.request.url)
    return NextResponse.redirect(destination)
  }

  // 2) If on auth pages (login/signup) but already authed -> go to dashboard
  if (rules.isAuthPath(pathname) && context.isAuthenticated) {
    const destination = new URL('/dashboard', context.request.url)
    return NextResponse.redirect(destination)
  }

  // 3) Onboarding: example logic — if onboarding path but user already has business -> skip
  if (pathname.startsWith('/onboarding')) {
    if (!context.isAuthenticated) {
      return NextResponse.redirect(new URL('/login', context.request.url))
    }

    try {
      const { data: businesses, error } = await context.supabase
        .from('businesses')
        .select('id')
        .eq('user_id', context.user.id)
        .limit(1)

      if (!error && businesses && businesses.length > 0) {
        return NextResponse.redirect(new URL('/dashboard', context.request.url))
      }
    } catch (err) {
      // swallow: if DB check fails, don't block onboarding – fallback to showing the page
    }
  }

  // 4) If protected and authenticated -> enforce onboarding existence
  if (rules.isProtected(pathname) && context.isAuthenticated) {
    try {
      const { data: businesses, error } = await context.supabase
        .from('businesses')
        .select('id')
        .eq('user_id', context.user.id)
        .limit(1)

      if (!error && (!businesses || businesses.length === 0)) {
        return NextResponse.redirect(new URL('/onboarding', context.request.url))
      }
    } catch (err) {
      // if DB check fails, allow access (prefer availability over blocking)
    }
  }

  // 5) All good — continue with the response (which may include refreshed cookies)
  return null
}

/**
 * Public helper invoked by middleware.ts
 * Combines context creation + pipeline.
 */
export async function handleAuthMiddleware(request: NextRequest) {
  const context = await createAuthMiddleware(request)
  const pipelineResponse = await authPipeline(context)
  // If pipeline returned a response (redirect or modified cookies), return it.
  // Otherwise return context.response (which may contain cookie updates from supabase refresh).
  return pipelineResponse ?? context.response
}
