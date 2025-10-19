import { Package } from 'lucide-react'

export default function InventoryPage() {
  return (
    <div className="p-6">
      <div className="rounded-2xl shadow-sm border bg-bg-primary border-border p-10 text-center">
        <div className="max-w-md mx-auto">
          <Package size={64} className="mx-auto mb-4 text-text-secondary/50" />
          <h3 className="text-xl font-bold mb-2 text-text-primary">قسم المخزون</h3>
          <p className="text-text-secondary">إدارة المنتجات والمخزون ستظهر هنا</p>
          <div className="mt-6 flex gap-3 justify-center">
            <button className="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:opacity-90">
              إضافة منتج
            </button>
            <button className="px-4 py-2 border border-border text-text-primary rounded-lg font-semibold hover:bg-hover">
              جرد المخزون
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
