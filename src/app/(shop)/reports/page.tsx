import { BarChart3 } from 'lucide-react'

export default function ReportsPage() {
  return (
    <div className="p-6">
      <div className="rounded-2xl shadow-sm border bg-bg-primary border-border p-10 text-center">
        <div className="max-w-md mx-auto">
          <BarChart3 size={64} className="mx-auto mb-4 text-text-secondary/50" />
          <h3 className="text-xl font-bold mb-2 text-text-primary">قسم التقارير</h3>
          <p className="text-text-secondary">التقارير المالية والإحصائيات ستظهر هنا</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button className="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:opacity-90">
              تقرير يومي
            </button>
            <button className="px-4 py-2 bg-accent text-white rounded-lg font-semibold hover:opacity-90">
              تقرير شهري
            </button>
            <button className="px-4 py-2 border border-border text-text-primary rounded-lg font-semibold hover:bg-hover">
              تقرير المبيعات
            </button>
            <button className="px-4 py-2 border border-border text-text-primary rounded-lg font-semibold hover:bg-hover">
              تقرير الأرباح
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
