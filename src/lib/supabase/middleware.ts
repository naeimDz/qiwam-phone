// src/lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // 🧩 نبدأ باستنساخ Response يمكن تعديل الكوكيز فيه
  let response = NextResponse.next({ request })

  // ⚙️ إنشاء supabase client خاص بـ middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // 🧠 هذا الجزء يُقرأ الكوكيز من الـ request
        getAll() {
          return request.cookies.getAll()
        },
        // 🪄 وهذه تكتب التحديثات الجديدة داخل response
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              response.cookies.set(name, value, options)
            } catch (e) {
              // بعض الإصدارات القديمة من Next.js ترمي تحذير هنا، نتجاهلو بأمان
            }
          })
        },
      },
    }
  )

  try {
    // 🔄 محاولة تحديث الـ session tokens
    // (تجديد الـ access_token إذا انتهى، عبر refresh_token)
  const { data: { user }, error } = await supabase.auth.getUser()
  } catch (error: any) {
    // 🚫 في حالة خطأ (كوكيز فاسدة، مثلاً) نحذفها باش نمنع مشاكل لاحقاً
    if (error?.message?.includes('invalid') || error?.message?.includes('expired')) {
      response.cookies.delete('sb-access-token')
      response.cookies.delete('sb-refresh-token')
    }

    // يمكن تضيف:
    // console.warn('Supabase session refresh failed:', error)
  }

  return response
}
