import { Users } from 'lucide-react'

export default function CustomersPage() {
  return (
    <div className="p-6">
      <div className="rounded-2xl shadow-sm border bg-bg-primary border-border p-10 text-center">
        <div className="max-w-md mx-auto">
          <Users size={64} className="mx-auto mb-4 text-text-secondary/50" />
          <h3 className="text-xl font-bold mb-2 text-text-primary">قسم العملاء</h3>
          <p className="text-text-secondary">قائمة العملاء وسجل المعاملات ستظهر هنا</p>
          <button className="mt-6 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:scale-105 transition-transform">
            إضافة عميل جديد
          </button>
        </div>
      </div>
    </div>
  )
}
