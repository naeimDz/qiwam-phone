/**
 * 🗑️ ConfirmDialog - Reusable Confirmation Dialog
 * 
 * الاستخدام:
 * const [confirm, setConfirm] = useState<ConfirmState | null>(null)
 * 
 * const handleDelete = async (id: string) => {
 *   setConfirm({
 *     title: 'حذف المنتج؟',
 *     message: 'هذا الإجراء لا يمكن التراجع عنه',
 *     confirmText: 'حذف',
 *     cancelText: 'إلغاء',
 *     variant: 'danger',
 *     onConfirm: async () => {
 *       await deleteAction(id)
 *       setConfirm(null)
 *     }
 *   })
 * }
 * 
 * <ConfirmDialog state={confirm} onClose={() => setConfirm(null)} />
 */

import React, { useState } from 'react'
import { AlertTriangle, CheckCircle, AlertCircle, X } from 'lucide-react'

export type ConfirmVariant = 'danger' | 'warning' | 'info' | 'success'

export interface ConfirmState {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: ConfirmVariant
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
  isDangerous?: boolean // تفعيل Double-Check أو Countdown
  icon?: React.ReactNode
  loading?: boolean
}

interface ConfirmDialogProps {
  state: ConfirmState | null
  onClose: () => void
}

export function ConfirmDialog({ state, onClose }: ConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [confirmInput, setConfirmInput] = useState('') // للحذف الخطير جداً
  const [countDown, setCountDown] = useState<number | null>(null)
  
  // ⏱️ Countdown Timer للحذف الخطير
  React.useEffect(() => {
    if (state?.isDangerous && countDown === null) {
      setCountDown(3)
    }
  }, [state?.isDangerous])

  React.useEffect(() => {
    if (countDown === null || countDown <= 0) return

    const timer = setTimeout(() => {
      setCountDown(countDown - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [countDown])

  if (!state) return null

  const {
    title,
    message,
    confirmText = 'تأكيد',
    cancelText = 'إلغاء',
    variant = 'info',
    onConfirm,
    onCancel,
    isDangerous = false,
    icon,
  } = state!

  // 🎨 الألوان حسب النوع
  const variantStyles = {
    danger: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      buttonColor: 'bg-red-600 hover:bg-red-700',
      textColor: 'text-red-900',
      iconColor: 'text-red-600',
      defaultIcon: <AlertTriangle className="w-6 h-6" />,
    },
    warning: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      buttonColor: 'bg-amber-600 hover:bg-amber-700',
      textColor: 'text-yellow-900',
      iconColor: 'text-amber-600',
      defaultIcon: <AlertCircle className="w-6 h-6" />,
    },
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      textColor: 'text-blue-900',
      iconColor: 'text-blue-600',
      defaultIcon: <AlertCircle className="w-6 h-6" />,
    },
    success: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      buttonColor: 'bg-green-600 hover:bg-green-700',
      textColor: 'text-green-900',
      iconColor: 'text-green-600',
      defaultIcon: <CheckCircle className="w-6 h-6" />,
    },
  }

  const styles = variantStyles[variant]

  // 🔒 Double-Check للحذف الخطير
  const requiresDoubleCheck =
    isDangerous && confirmInput !== 'تأكيد الحذف'



  // 🎯 معالج التأكيد
  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      setIsLoading(false)
      onClose()
    } catch (error) {
      console.error('Confirmation error:', error)
      setIsLoading(false)
    }
  }

  // 🔙 معالج الإلغاء
  const handleCancel = () => {
    onCancel?.()
    onClose()
  }

  return (
    <>
      {/* الخلفية المظلمة */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={handleCancel}
      />

      {/* الـ Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`${styles.bgColor} border ${styles.borderColor} rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* الإغلاق السريع */}
          <button
            onClick={handleCancel}
            className="absolute top-4 right-4 p-1 hover:bg-white/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          {/* الأيقونة والعنوان */}
          <div className="flex items-start gap-3">
            <div className={`${styles.iconColor} flex-shrink-0 pt-0.5`}>
              {icon || styles.defaultIcon}
            </div>
            <div className="flex-1">
              <h2 className={`text-lg font-bold ${styles.textColor}`}>
                {title}
              </h2>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          {/* Double-Check للحذف الخطير */}
          {isDangerous && (
            <div className="bg-white/60 border border-red-200 rounded-lg p-3 space-y-2">
              <p className="text-xs font-semibold text-red-700">
                ⚠️ هذا إجراء حساس جداً:
              </p>
              <p className="text-xs text-gray-600">
                اكتب "<strong>تأكيد الحذف</strong>" بالضبط للمتابعة:
              </p>
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="تأكيد الحذف"
                className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
              />
            </div>
          )}

          {/* Countdown Timer */}
          {isDangerous && countDown !== null && countDown > 0 && (
            <div className="text-center py-2">
              <p className="text-xs text-gray-600">
                يمكنك التأكيد بعد{' '}
                <span className="font-bold text-red-600">{countDown}</span>{' '}
                ثواني...
              </p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                <div
                  className="bg-red-600 h-full transition-all duration-1000"
                  style={{
                    width: `${((3 - countDown) / 3) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* الأزرار */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              disabled={
                isLoading ||
                requiresDoubleCheck ||
                (isDangerous && countDown !== null && countDown > 0)
              }
              className={`flex-1 px-4 py-2.5 rounded-lg text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${styles.buttonColor}`}
            >
              {isLoading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  جاري...
                </>
              ) : (
                <>
                  {confirmText}
                  {requiresDoubleCheck && (
                    <span className="text-xs opacity-70">(أدخل النص)</span>
                  )}
                </>
              )}
            </button>
          </div>

          {/* رسالة إضافية للحذف الخطير */}
          {isDangerous && (
            <p className="text-xs text-gray-500 text-center border-t border-gray-200 pt-3">
              ⚠️ لا يمكن التراجع عن هذا الإجراء بعد التأكيد
            </p>
          )}
        </div>
      </div>
    </>
  )
}

/**
 * 🎯 Hook مساعد للاستخدام الأسهل
 * 
 * const { confirm, setConfirm } = useConfirm()
 * 
 * handleDelete = () => {
 *   confirm({
 *     title: 'حذف؟',
 *     message: 'متأكد؟',
 *     onConfirm: () => deleteItem()
 *   })
 * }
 */
export function useConfirm() {
  const [state, setState] = React.useState<ConfirmState | null>(null)

  const confirm = (config: ConfirmState) => {
    setState(config)
  }

  const close = () => {
    setState(null)
  }

  return { state, confirm, close, setConfirm: setState }
}