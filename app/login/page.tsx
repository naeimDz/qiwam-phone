import { Smartphone } from 'lucide-react'
import { Logo } from '@/components/ui/logo'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-secondary p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size={64} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">محل الهواتف</h1>
          <p className="text-text-secondary">نظام الإدارة الشامل</p>
        </div>

        <div className="bg-bg-primary rounded-2xl shadow-lg border border-border p-8">
          <h2 className="text-xl font-bold text-text-primary mb-6 text-center">
            تسجيل الدخول
          </h2>

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                اسم المستخدم
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg-secondary text-text-primary outline-none focus:border-primary transition-colors"
                placeholder="أدخل اسم المستخدم"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                كلمة المرور
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg-secondary text-text-primary outline-none focus:border-primary transition-colors"
                placeholder="أدخل كلمة المرور"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-opacity mt-6"
            >
              دخول
            </button>
          </form>

          <p className="text-center text-sm text-text-secondary mt-6">
            نسيت كلمة المرور؟{' '}
            <a href="#" className="text-primary font-semibold hover:underline">
              استعادة
            </a>
          </p>
        </div>

        <p className="text-center text-xs text-text-secondary mt-6">
          © 2025 محل الهواتف. جميع الحقوق محفوظة.
        </p>
      </div>
    </div>
  )
}
