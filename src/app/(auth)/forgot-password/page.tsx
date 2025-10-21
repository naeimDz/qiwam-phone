"use client"

import { useState } from 'react'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { FormError } from '../FormError'
import { FormSuccess } from '../FormSuccess'
import { InputField } from '../InputField'
import { SubmitButton } from '../SubmitButton'
import { forgotPasswordAction } from '@/lib/actions/auth'

const ForgotPasswordPage: React.FC = () => {
  const [isPending, setIsPending] = useState(false)
  const [formError, setFormError] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [phone, setPhone] = useState('')

  const handleSubmit = async () => {
    setFormError('')
    
    if (!phone.trim()) {
      setFormError('رقم الهاتف مطلوب')
      return
    }
    
    if (!/^[0-9]{10,}$/.test(phone.replace(/\s/g, ''))) {
      setFormError('رقم الهاتف غير صحيح')
      return
    }

    setIsPending(true)
    try {
      const result = await forgotPasswordAction({ phone })

      if (!result.success) {
        setFormError(result.error || 'فشل إرسال البريد')
        setIsPending(false)
        return
      }

      setEmailSent(true)
      setIsPending(false)

    } catch (error) {
      console.error('[FORGOT PASSWORD ERROR]', error)
      setFormError('حصلت مشكلة غير متوقعة')
      setIsPending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isPending) {
      handleSubmit()
    }
  }

  // Success State
  if (emailSent) {
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
              تحقق من بريدك! 📧
            </h2>
            <p className="text-gray-600 leading-relaxed mb-2">
              أرسلنا رابط استرجاع كلمة السر إلى:
            </p>
            <p className="text-emerald-600 font-bold text-lg mb-4">
              {phone}@store.com
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-right">
              <p className="text-sm text-blue-900">
                💡 <strong>ملاحظة:</strong> الرابط صالح لمدة 60 دقيقة فقط
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
            >
              رجوع لتسجيل الدخول
            </button>
            
            <button
              onClick={() => {
                setEmailSent(false)
                setPhone('')
              }}
              className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all"
            >
              إرسال لرقم آخر
            </button>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-right">
            <p className="text-xs text-amber-900">
              ⚠️ ما وصلكش البريد؟ تحقق من مجلد Spam/Junk
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Request Form
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50 flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md">
        
        <button
          onClick={() => window.location.href = '/login'}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">رجوع</span>
        </button>

        <div className="text-center mb-8">
          <div className="inline-block mb-4 p-3 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl">
            <Mail size={32} className="text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            نسيت كلمة السر؟
          </h1>
          <p className="text-gray-600">
            ما تقلقش! نرسلولك رابط لإعادة تعيينها
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
          <div className="space-y-6">
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-right">
              <p className="text-sm text-blue-900">
                💡 أدخل رقم الهاتف اللي سجلت بيه
              </p>
            </div>

            <div onKeyPress={handleKeyPress}>
              <InputField
                label="رقم الهاتف"
                name="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0771234567"
                disabled={isPending}
                required
              />
            </div>

            {formError && <FormError message={formError} />}

            <SubmitButton
              onClick={handleSubmit}
              loadingText="جاري الإرسال..."
              disabled={isPending}
            >
              إرسال رابط الاسترجاع
            </SubmitButton>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              تذكرت كلمة السر؟{' '}
              <a href="/login" className="text-emerald-600 hover:underline font-bold">
                دخل من هنا
              </a>
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-right">
            <p className="text-xs text-purple-900">
              🔒 <strong>أمان:</strong> نرسل الرابط فقط للبريد المسجل في النظام
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage