// app/login/page.tsx
'use client'
"use client"

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { FormError } from '../FormError'
import { FormSuccess } from '../FormSuccess'
import { InputField } from '../InputField'
import { SubmitButton } from '../SubmitButton'
import { signInAction } from '@/lib/actions/auth'

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async () => {
    setFormError('')
    setFormSuccess('')
    
    // Validation
    if (!phone.trim()) {
      setFormError('رقم الهاتف مطلوب')
      return
    }
    
    if (!password) {
      setFormError('كلمة السر مطلوبة')
      return
    }

    setIsPending(true)

    try {
      const formData = new FormData()
      formData.append('phone', `${phone}@store.com`)
      formData.append('password', password)
      const result = await signInAction(formData)

      if (!result.success) {
        setFormError(result.error || 'فشل تسجيل الدخول')
        setIsPending(false)
        return
      }

      setFormSuccess('تم تسجيل الدخول بنجاح!')
      
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 1000)

    } catch (error) {
      console.error('[LOGIN ERROR]', error)
      setFormError('حصلت مشكلة غير متوقعة')
      setIsPending(false)
    }

  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isPending) {
      handleSubmit()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50 flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4 p-3 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl">
            <span className="text-4xl">🔐</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            مرحباً بيك مرة أخرى
          </h1>
          <p className="text-gray-600">
            دخل لحسابك وكمل التسيير
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
          <div className="space-y-6">
            
            {/* Phone Input */}
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

            {/* Password Input */}
            <div className="relative" onKeyPress={handleKeyPress}>
              <InputField
                label="كلمة السر"
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

            {/* Forgot Password Link */}
            <div className="text-left">
              <a 
                href="/forgot-password" 
                className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline font-medium"
              >
                نسيت كلمة السر؟
              </a>
            </div>

            {/* Error/Success Messages */}
            {formError && <FormError message={formError} />}
            {formSuccess && <FormSuccess message={formSuccess} />}

            {/* Submit Button */}
            <SubmitButton
              onClick={handleSubmit}
              loadingText="جاري تسجيل الدخول..."
              disabled={isPending}
            >
              دخول
            </SubmitButton>
          </div>
        </div>

        {/* Signup Link */}
        <p className="text-center text-sm text-gray-600 mt-6">
          ما عندكش حساب؟{' '}
          <a href="/signup" className="text-emerald-600 hover:underline font-bold">
            سجل من هنا
          </a>
        </p>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-3">
          {[
            { icon: '⚡', label: 'دخول سريع' },
            { icon: '🔒', label: 'آمن 100%' },
            { icon: '🇩🇿', label: 'دعم عربي' },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl p-3 text-center border border-gray-200 shadow-sm"
            >
              <p className="text-2xl mb-1">{feature.icon}</p>
              <p className="text-xs font-bold text-gray-800">{feature.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LoginPage