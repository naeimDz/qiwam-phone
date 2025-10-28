// app/test/page.tsx
import { getSalesAction, getSalesSummaryAction, createSaleAction } from '@/lib/actions/sales'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// Server Action للـ create sale
async function handleCreateSale(formData: FormData) {
  'use server'
  const result = await createSaleAction(formData)
  if (result.success) {
    revalidatePath('/test')
    redirect(`/test/${result.data.id}`)
  }
  // في حالة الخطأ، نرجعو للصفحة (Next.js will handle this)
}

export default async function TestSalesPage() {
  // Fetch sales and summary
  const [salesResult, summaryResult] = await Promise.all([
    getSalesAction(),
    getSalesSummaryAction(30)
  ])

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui', direction: 'rtl' }}>
      <h1>صفحة تجربة المبيعات</h1>
      
      {/* Summary Section */}
      <div style={{ background: '#f5f5f5', padding: '1rem', marginBottom: '2rem', borderRadius: '8px' }}>
        <h2>الإحصائيات (آخر 30 يوم)</h2>
        {summaryResult.success ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div>
              <strong>عدد الفواتير:</strong> {summaryResult.data!.total_sales}
            </div>
            <div>
              <strong>إجمالي المبيعات:</strong> {summaryResult.data!.total_amount} دج
            </div>
            <div>
              <strong>المبلغ المدفوع:</strong> {summaryResult.data!.total_paid} دج
            </div>
          </div>
        ) : (
          <p style={{ color: 'red' }}>{summaryResult.error}</p>
        )}
      </div>

      {/* Create New Sale Form */}
      <div style={{ background: '#e3f2fd', padding: '1rem', marginBottom: '2rem', borderRadius: '8px' }}>
        <h2>إنشاء فاتورة جديدة</h2>
        <form action={handleCreateSale}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <label>
              نوع البيع:
              <select name="saletype" required style={{ marginRight: '0.5rem', padding: '0.5rem' }}>
                <option value="cash">نقدي</option>
                <option value="credit">آجل</option>
              </select>
            </label>

            <label>
              نوع الفاتورة:
              <select name="invoice_type" required style={{ marginRight: '0.5rem', padding: '0.5rem' }}>
                <option value="full_invoice">فاتورة كاملة</option>
                <option value="quick_sale">بيع سريع</option>
              </select>
            </label>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              ملاحظات:
              <textarea name="notes" rows={3} style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }} />
            </label>
          </div>

          <button 
            type="submit"
            style={{ 
              background: '#1976d2', 
              color: 'white', 
              padding: '0.75rem 2rem', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            إنشاء فاتورة
          </button>
        </form>
      </div>

      {/* Sales List */}
      <div>
        <h2>قائمة الفواتير</h2>
        {salesResult.success ? (
          salesResult.data.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
              <thead>
                <tr style={{ background: '#424242', color: 'white' }}>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>رقم الفاتورة</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>التاريخ</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>العميل</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>النوع</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>المبلغ</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>الحالة</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>عدد المنتجات</th>
                </tr>
              </thead>
              <tbody>
                {salesResult.data.map((sale) => (
                  <tr key={sale.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '1rem' }}>
                      <a 
                        href={`/test/${sale.id}`}
                        style={{ color: '#1976d2', textDecoration: 'none' }}
                      >
                        {sale.docnumber || 'غير محدد'}
                      </a>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {new Date(sale.docdate).toLocaleDateString('ar-DZ')}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {sale.customer_name || 'زبون عابر'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {sale.saletype === 'cash' ? 'نقدي' : 'آجل'}
                    </td>
                    <td style={{ padding: '1rem' }}>{sale.total} دج</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '12px',
                        background: sale.status === 'posted' ? '#4caf50' : sale.status === 'cancelled' ? '#f44336' : '#ff9800',
                        color: 'white',
                        fontSize: '0.875rem'
                      }}>
                        {sale.status === 'posted' ? 'منشورة' : sale.status === 'cancelled' ? 'ملغاة' : 'مسودة'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>{sale.items_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              لا توجد فواتير حالياً
            </p>
          )
        ) : (
          <p style={{ color: 'red' }}>{salesResult.error}</p>
        )}
      </div>
    </div>
  )
}