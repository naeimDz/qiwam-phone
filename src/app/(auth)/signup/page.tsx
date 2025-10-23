"use client"

import { useState, useRef, useCallback } from 'react'
import { Eye, EyeOff, CheckCircle2, Mail, Phone, User, Store, Lock } from 'lucide-react'
import { FormError } from '../FormError'
import { FormSuccess } from '../FormSuccess'
import { InputField } from '../InputField'
import { SubmitButton } from '../SubmitButton'
import { useAuthActions } from '@/lib/hooks/useAuthActions'

interface FormData {
  fullname: string
  phone: string
  storeName: string
  emailChoice: 'phone' | 'custom'
  email: string
  password: string
}

interface FieldErrors {
  [key: string]: string
}

type StepType = 1 | 2 | 3 | 4 | 5 | 6

const SignupPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [currentStep, setCurrentStep] = useState<StepType>(1)
  const [isPending, setIsPending] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string>('')
  const [formSuccess, setFormSuccess] = useState<string>('')
  const { signup } = useAuthActions()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)


  // ✅ استخدم useRef للـ formData بدل useState
  const formDataRef = useRef<FormData>({
    fullname: '',
    phone: '',
    storeName: '',
    emailChoice: 'phone',
    email: '',
    password: '',
  })
  
  // ✅ state بسيط للـ re-render المطلوب فقط
  const [, forceUpdate] = useState({})

  // ✅ handleInputChange ثابت تماماً - NO dependencies
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target
    formDataRef.current[name as keyof FormData] = value as any
    
    // Clear error فقط
    setFieldErrors(prev => {
      if (!prev[name]) return prev
      const newErrors = { ...prev }
      delete newErrors[name]
      return newErrors
    })
    
    // Force update للـ summary فقط
    forceUpdate({})
  }, []) // ✅ EMPTY deps - ثابت للأبد

  const validateStep = (step: StepType): boolean => {
    const errors: FieldErrors = {}
    const data = formDataRef.current
    
    switch(step) {
      case 1:
        if (!data.fullname.trim()) errors.fullname = 'اسمك الكامل مهم'
        break
      case 2:
        if (!data.phone.trim()) errors.phone = 'رقم الهاتف مهم'
        else if (!/^(07|05|06)\d{8}$/.test(data.phone.replace(/\s/g, '')))
          errors.phone = 'صيغة جزائرية: 0771234567'
        break
      case 3:
        if (!data.storeName.trim()) errors.storeName = 'اسم محلك مهم'
        break
      case 4:
        if (data.emailChoice === 'custom') {
          if (!data.email.trim()) errors.email = 'البريد مهم'
          else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
            errors.email = 'البريد ما يبدو صحيح'
        }
        break
      case 5:
        if (!data.password) errors.password = 'كلمة السر مهمة'
        else if (data.password.length < 8) 
          errors.password = '8 أحرف على الأقل'
        else if (!/[A-Z]/.test(data.password)) 
          errors.password = 'لازم حرف كبير'
        else if (!/\d/.test(data.password)) 
          errors.password = 'لازم رقم واحد'
        break
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNext = (): void => {
    if (validateStep(currentStep) && currentStep < 5) {
      setCurrentStep((prev) => (prev + 1) as StepType)
    }
  }

  const handleBack = (): void => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as StepType)
    }
  }

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const form = new FormData(e.currentTarget)
    try {
      await signup({
        email: form.get('email') as string,
        password: form.get('password') as string,
        fullname: form.get('fullname') as string,
        phone: form.get('phone') as string,
        storeName: form.get('storeName') as string,
        taxNumber: form.get('taxNumber') as string,
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formData = formDataRef.current

  // Success State
  if (currentStep === 6) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50 flex items-center justify-center py-8 px-4">
        <div className="text-center space-y-6 animate-in zoom-in">
          <div className="flex justify-center">
            <div className="p-6 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full animate-bounce">
              <CheckCircle2 size={56} className="text-emerald-600" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              ✨ مبروك يا {formData.fullname.split(' ')[0]}! 🎉
            </h2>
            <p className="text-gray-600 leading-relaxed mb-2">
              حسابك جاهز ومحلك "{formData.storeName}" مستني فيك
            </p>
            <p className="text-sm text-gray-700 font-medium">
              خلاص دخل وشرع زيد منتجاتك
            </p>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
          >
            دخول للوحة التحكم
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-block mb-4 p-3 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl">
            <span className="text-3xl">🎯</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ابدأ تسيير محلك
          </h1>
          <p className="text-gray-600">
            2 شهور <span className="font-bold text-emerald-600">مجاني تماماً</span> بدون أي التزام
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr,320px] gap-6 items-start">
          
          {/* Form Section */}
          <div>
            {/* Progress Steps */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
              <div className="flex justify-between items-center">
                {[
                  { label: 'الاسم' },
                  { label: 'الهاتف' },
                  { label: 'المحل' },
                  { label: 'البريد' },
                  { label: 'الأمان' },
                ].map((step, idx) => {
                  const stepNum = (idx + 1) as StepType
                  const isActive = currentStep === stepNum
                  const isCompleted = currentStep > stepNum
                  
                  return (
                    <div key={idx} className="flex flex-col items-center flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                        isCompleted ? 'bg-emerald-500 text-white' : isActive ? 'bg-emerald-500 text-white ring-4 ring-emerald-200' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {isCompleted ? '✓' : stepNum}
                      </div>
                      <p className={`text-xs mt-2 font-semibold text-center ${isActive ? 'text-emerald-600' : 'text-gray-500'}`}>
                        {step.label}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Form Content */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 mb-6">
              
              {/* Step 1 */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl">
                      <User size={24} className="text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900">شكون أنت؟</h2>
                      <p className="text-sm text-gray-600 mt-1">باش نتعرفو عليك كيما يجب</p>
                    </div>
                  </div>
                  <InputField
                    label="اسمك الكامل"
                    name="fullname"
                    type="text"
                    defaultValue={formData.fullname}
                    onChange={handleInputChange}
                    placeholder="محمد احمد"
                    error={fieldErrors.fullname}
                    disabled={isPending}
                    required
                  />
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-right">
                    <p className="text-xs text-blue-800">
                      💡 <strong>كيفاش نستعملوه؟</strong> باش نعرفوك في النظام
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl">
                      <Phone size={24} className="text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900">رقم الهاتف</h2>
                      <p className="text-sm text-gray-600 mt-1">هذا هو مفتاحك للدخول</p>
                    </div>
                  </div>
                  <InputField
                    label="الهاتف"
                    name="phone"
                    type="tel"
                    defaultValue={formData.phone}
                    onChange={handleInputChange}
                    placeholder="0771234567"
                    hint="🇩🇿 صيغة جزائرية: 0771234567"
                    error={fieldErrors.phone}
                    disabled={isPending}
                    required
                  />
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-right">
                    <p className="text-xs text-amber-900">
                      ⚠️ <strong>مهم:</strong> هذا الرقم باش تدخل بيه
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl">
                      <Store size={24} className="text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900">شنوا سمية محلك؟</h2>
                      <p className="text-sm text-gray-600 mt-1">هذا اللي باش يظهر في الفواتير</p>
                    </div>
                  </div>
                  <InputField
                    label="اسم المحل"
                    name="storeName"
                    type="text"
                    defaultValue={formData.storeName}
                    onChange={handleInputChange}
                    placeholder="محل محمد للهواتف"
                    error={fieldErrors.storeName}
                    disabled={isPending}
                    required
                  />
                </div>
              )}

              {/* Step 4 */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl">
                      <Mail size={24} className="text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900">البريد (اختياري)</h2>
                      <p className="text-sm text-gray-600 mt-1">لو حبيت تزيد أمان إضافي</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer hover:bg-emerald-50 transition-all"
                      style={{ borderColor: formData.emailChoice === 'phone' ? '#059669' : '#e5e7eb' }}>
                      <input
                        type="radio"
                        name="emailChoice"
                        value="phone"
                        checked={formData.emailChoice === 'phone'}
                        onChange={(e) => {
                          formDataRef.current.emailChoice = 'phone'
                          forceUpdate({})
                        }}
                        className="w-5 h-5 mt-1 accent-emerald-600"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">خلاص، رقم الهاتف يكفي</p>
                        <p className="text-sm text-gray-600">ما نحتاجش بريد إضافي</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer hover:bg-emerald-50 transition-all"
                      style={{ borderColor: formData.emailChoice === 'custom' ? '#059669' : '#e5e7eb' }}>
                      <input
                        type="radio"
                        name="emailChoice"
                        value="custom"
                        checked={formData.emailChoice === 'custom'}
                        onChange={(e) => {
                          formDataRef.current.emailChoice = 'custom'
                          forceUpdate({})
                        }}
                        className="w-5 h-5 mt-1 accent-emerald-600"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">نحب نزيد بريد</p>
                        <p className="text-sm text-gray-600">يساعدني نسترجع حسابي</p>
                      </div>
                    </label>

                    {formData.emailChoice === 'custom' && (
                      <InputField
                        label="البريد الإلكتروني"
                        name="email"
                        type="email"
                        defaultValue={formData.email}
                        onChange={handleInputChange}
                        placeholder="you@example.com"
                        error={fieldErrors.email}
                        disabled={isPending}
                        required
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Step 5 */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl">
                      <Lock size={24} className="text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900">آخر حاجة - الأمان</h2>
                      <p className="text-sm text-gray-600 mt-1">حط كلمة سر قوية وخلصنا</p>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-right">
                    <p className="text-sm text-red-900">
                      🔒 <span className="font-semibold">مهم:</span> ما تنساهاش وما تعطيهاش لحد
                    </p>
                  </div>

                  {formError && <FormError message={formError} />}
                  {formSuccess && <FormSuccess message={formSuccess} />}
                  
                  <div className="relative">
                    <InputField
                      label="كلمة السر"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      defaultValue={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      hint="8 أحرف، حرف كبير، رقم واحد"
                      error={fieldErrors.password}
                      disabled={isPending}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-9 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  disabled={isPending}
                  className="flex-1 px-6 py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  رجع
                </button>
              )}
              
              {currentStep < 5 ? (
                <button
                  onClick={handleNext}
                  disabled={isPending}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 text-lg"
                >
                  التالي ←
                </button>
              ) : (
                <form onSubmit={handleSubmit}>
                  <SubmitButton
                    type="submit"
                    loadingText="جاري إنشاء الحساب..."
                    className="flex-1"
                    disabled={isPending}
                  >
                    إنشاء الحساب ✨
                  </SubmitButton>
                </form>
              )}
            </div>

            <p className="text-center text-sm text-gray-600 mt-6">
              عندك حساب؟{' '}
              <a href="/login" className="text-emerald-600 hover:underline font-bold">
                دخول من هنا
              </a>
            </p>

            {/* Benefits */}
            <div className="mt-8 grid grid-cols-2 gap-3">
              {[
                { icon: '✨', label: '2 شهور مجاني', bg: 'from-emerald-50 to-emerald-100' },
                { icon: '📱', label: 'تسيير سهل', bg: 'from-teal-50 to-teal-100' },
                { icon: '🎯', label: 'فواتير سريعة', bg: 'from-cyan-50 to-cyan-100' },
                { icon: '🇩🇿', label: 'دعم عربي', bg: 'from-green-50 to-green-100' },
              ].map((benefit, idx) => (
                <div key={idx} className={`bg-gradient-to-br ${benefit.bg} rounded-xl p-4 text-center border border-gray-200`}>
                  <p className="text-2xl mb-2">{benefit.icon}</p>
                  <p className="text-xs font-bold text-gray-800">{benefit.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Sidebar */}
          {formData.fullname && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-4">
              <p className="text-sm font-bold text-emerald-900 mb-4 flex items-center gap-2">
                <span>📋</span> بياناتك
              </p>
              <div className="space-y-3">
                {formData.fullname && (
                  <div className="flex items-start gap-3">
                    <User size={18} className="text-emerald-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">الاسم</p>
                      <p className="text-sm font-semibold text-gray-900">{formData.fullname}</p>
                    </div>
                  </div>
                )}
                {formData.phone && (
                  <div className="flex items-start gap-3">
                    <Phone size={18} className="text-emerald-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">الهاتف</p>
                      <p className="text-sm font-semibold text-gray-900">{formData.phone}</p>
                    </div>
                  </div>
                )}
                {formData.storeName && (
                  <div className="flex items-start gap-3">
                    <Store size={18} className="text-emerald-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">المحل</p>
                      <p className="text-sm font-semibold text-gray-900">{formData.storeName}</p>
                    </div>
                  </div>
                )}
                {formData.emailChoice === 'custom' && formData.email && (
                  <div className="flex items-start gap-3">
                    <Mail size={18} className="text-emerald-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">البريد</p>
                      <p className="text-sm font-semibold text-gray-900 break-all">{formData.email}</p>
                    </div>
                  </div>
                )}
                {formData.emailChoice === 'phone' && formData.phone && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600">📧 سنستخدم رقم هاتفك للدخول</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SignupPage