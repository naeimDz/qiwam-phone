// app/reset-password/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react'
import { FormError } from '../FormError'
import { FormSuccess } from '../FormSuccess'
import { InputField } from '../InputField'
import { SubmitButton } from '../SubmitButton'
import { resetPasswordAction } from '@/lib/actions/auth'
import { useSearchParams } from 'next/navigation'

const ResetPasswordPage: React.FC = () => {
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [formError, setFormError] = useState('')
  const [passwordReset, setPasswordReset] = useState(false)
  const [isValidToken, setIsValidToken] = useState(true)
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    const type = searchParams.get('type')
    if (type !== 'recovery') {
      setIsValidToken(false)
    }
  }, [searchParams])

  const handleSubmit = async () => {
    setFormError('')
    
    if (!password) {
      setFormError('كلمة السر مطلوبة')
      return
    }
    
    if (password.length < 6) {
      setFormError('كلمة السر يجب أن تكون 6 أحرف على الأقل')
      return
    }

    if (!confirmPassword) {
      setFormError('تأكيد كلمة السر مطلوب')
      return
    }

    if (password !== confirmPassword) {
      setFormError('كلمتا السر غير متطابقتين')
      return
    }

    setIsPending(true)
    try {
      const result = await resetPasswordAction({ password })

      if (!result.success) {
        setFormError(result.error || 'فشل تحديث كلمة السر')
        setIsPending(false)
        return
      }

      setPasswordReset(true)
      setIsPending(false)

    } catch (error) {
      console.error('[RESET PASSWORD ERROR]', error)
      setFormError('حصلت مشكلة غير متوقعة')
      setIsPending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isPending) {
      handleSubmit()
    }
  }

  // Invalid Token
  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-orange-50 flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-6 bg-gradient-to-br from-red-100 to-orange-100 rounded-full">
              <Lock size={56} className="text-red-600" />
            </div>
          </div>
          
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              الرابط غير صحيح 🔒
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              الرابط منتهي الصلاحية أو غير صالح
            </p>
            <p className="text-sm text-gray-500 mb-6">
              اطلب رابط جديد من صفحة نسيان كلمة السر
            </p>
          </div>

          <button
            onClick={() => window.location.href = '/forgot-password'}
            className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
          >
            طلب رابط جديد
          </button>
        </div>
      </div>
    )
  }

  // Success State
  if (passwordReset) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50 flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-6 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full animate-bounce">
              <CheckCircle size={56} className="text-emerald-600" />
            </div>
          </div>
          
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              تم بنجاح! ✅
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              تم تحديث كلمة السر بنجاح
            </p>
            <p className="text-sm text-gray-500">
              يمكنك الآن تسجيل الدخول بكلمة السر الجديدة
            </p>
          </div>

          <button
            onClick={() => window.location.href = '/login'}
            className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
          >
            رجوع لتسجيل الدخول
          </button>
        </div>
      </div>
    )
  }

  // Reset Form
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50 flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md">
        
        <div className="text-center mb-8">
          <div className="inline-block mb-4 p-3 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl">
            <Lock size={32} className="text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            إعادة تعيين كلمة السر
          </h1>
          <p className="text-gray-600">
            أدخل كلمة سر جديدة آمنة
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
          <div className="space-y-6">
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-right">
              <p className="text-sm text-blue-900">
                💡 استعمل كلمة سر قوية تحتوي على أحرف وأرقام
              </p>
            </div>

            <div className="relative" onKeyPress={handleKeyPress}>
              <InputField
                label="كلمة السر الجديدة"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isPending}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isPending}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="relative" onKeyPress={handleKeyPress}>
              <InputField
                label="تأكيد كلمة السر"
                name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isPending}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute left-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isPending}
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {formError && <FormError message={formError} />}

            <SubmitButton
              onClick={handleSubmit}
              loadingText="جاري التحديث..."
              disabled={isPending}
            >
              تحديث كلمة السر
            </SubmitButton>
          </div>
        </div>

        <div className="mt-6">
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-right">
            <p className="text-xs text-purple-900">
              🔒 <strong>أمان:</strong> بيانات الاتصال آمنة ومشفرة بالكامل
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage