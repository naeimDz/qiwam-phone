// app/inventory/components/InventoryLoadingSkeleton.tsx
export function InventoryLoadingSkeleton() {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="space-y-4 w-full max-w-2xl px-4">
        {/* Header Skeleton */}
        <div className="h-10 bg-slate-300 rounded-lg animate-pulse" />
        
        {/* Tabs Skeleton */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-10 w-24 bg-slate-300 rounded-lg animate-pulse"
            />
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-16 bg-slate-200 rounded-lg animate-pulse"
            />
          ))}
        </div>

        {/* Loading message */}
        <div className="text-center mt-8">
          <p className="text-slate-500 animate-pulse">جاري تحميل المخزون...</p>
        </div>
      </div>
    </div>
  )
}

// app/inventory/components/InventoryErrorBoundary.tsx
interface ErrorBoundaryProps {
  errors?: string[]
  isCritical?: boolean
  isEmpty?: boolean
  message?: string
}

export function InventoryErrorBoundary({
  errors = [],
  isCritical = false,
  isEmpty = false,
  message,
}: ErrorBoundaryProps) {
  if (isEmpty) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center space-y-4">
          <div className="text-6xl">📦</div>
          <h2 className="text-2xl font-bold text-slate-700">المخزون فارغ</h2>
          <p className="text-slate-600 max-w-md">
            {message || 'لا توجد منتجات في المخزون حالياً.'}
          </p>
          <div className="pt-4 space-y-2">
            <a
              href="/inventory/phones/new"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              إضافة هاتف
            </a>
            <span className="mx-2 text-slate-400">أو</span>
            <a
              href="/inventory/accessories/new"
              className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              إضافة إكسسوار
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (isCritical) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-6xl">⚠️</div>
          <h2 className="text-2xl font-bold text-red-700">خطأ في تحميل المخزون</h2>
          <div className="bg-red-100 border border-red-300 rounded-lg p-4 text-left space-y-2">
            {errors.map((error, i) => (
              <p key={i} className="text-sm text-red-700">
                • {error}
              </p>
            ))}
          </div>
          <p className="text-slate-600 text-sm">
            يرجى المحاولة لاحقاً أو التواصل مع الدعم الفني.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            إعادة محاولة
          </button>
        </div>
      </div>
    )
  }

  // Non-critical errors (warnings)
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
      <div className="flex items-start gap-3">
        <span className="text-xl">⚠️</span>
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-800">تنبيهات تحميل</h3>
          <ul className="mt-2 space-y-1 text-sm text-yellow-700">
            {errors.map((error, i) => (
              <li key={i}>• {error}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}