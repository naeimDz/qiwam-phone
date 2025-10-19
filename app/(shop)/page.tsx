import { Home, TrendingUp, DollarSign, Package, Users } from 'lucide-react'

export default function DashboardPage() {
  const stats = [
    {
      label: 'إجمالي المبيعات اليوم',
      value: '45,000 دج',
      icon: DollarSign,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
    {
      label: 'عدد المعاملات',
      value: '24',
      icon: TrendingUp,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'المنتجات في المخزون',
      value: '156',
      icon: Package,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
    {
      label: 'عدد العملاء',
      value: '89',
      icon: Users,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 border border-border">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
            <Home size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">مرحباً بك في لوحة التحكم</h1>
            <p className="text-text-secondary">
              نظرة شاملة على أداء المحل والعمليات اليومية
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className="bg-bg-primary rounded-2xl p-6 border border-border hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <Icon size={24} className={stat.color} />
                </div>
              </div>
              <p className="text-text-secondary text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-text-primary">{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-bg-primary rounded-2xl p-6 border border-border">
        <h3 className="text-xl font-bold text-text-primary mb-4">عمليات سريعة</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="p-4 rounded-xl bg-accent/10 text-accent hover:bg-accent/20 transition-colors font-semibold">
            عملية بيع جديدة
          </button>
          <button className="p-4 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-semibold">
            إضافة منتج
          </button>
          <button className="p-4 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors font-semibold">
            إضافة عميل
          </button>
          <button className="p-4 rounded-xl bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 transition-colors font-semibold">
            تقرير اليوم
          </button>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-bg-primary rounded-2xl p-6 border border-border">
        <h3 className="text-xl font-bold text-text-primary mb-4">آخر العمليات</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex items-center justify-between p-4 rounded-xl bg-bg-secondary"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <DollarSign size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-text-primary">عملية بيع #{item}</p>
                  <p className="text-sm text-text-secondary">منذ {item} ساعة</p>
                </div>
              </div>
              <p className="font-bold text-accent">12,500 دج</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
