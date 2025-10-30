// app/test/[id]/page.tsx
import { 
  getSaleWithItemsAction, 
  addItemToSaleAction, 
  removeItemFromSaleAction,
  postSaleAction,
  cancelSaleAction 
} from '@/lib/actions/sales'
import { revalidatePath } from 'next/cache'

// Server Actions
async function handleAddItem(saleId: string, formData: FormData) {
  'use server'
  await addItemToSaleAction(saleId, formData)
  revalidatePath(`/test/${saleId}`)
}

async function handleRemoveItem(saleId: string, formData: FormData) {
  'use server'
  const itemId = formData.get('itemId') as string
  await removeItemFromSaleAction(itemId)
  revalidatePath(`/test/${saleId}`)
}

async function handlePostSale(saleId: string, formData: FormData) {
  'use server'
  await postSaleAction(saleId)
  revalidatePath('/test')
  revalidatePath(`/test/${saleId}`)
}

async function handleCancelSale(saleId: string, formData: FormData) {
  'use server'
  await cancelSaleAction(saleId)
  revalidatePath('/test')
  revalidatePath(`/test/${saleId}`)
}

export default async function SaleDetailPage({ params }: { params: { id: string } }) {
const { id } = await params;
const result = await getSaleWithItemsAction(id);

  if (!result.success) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', direction: 'rtl' }}>
        <h1 style={{ color: 'red' }}>{result.error}</h1>
        <a href="/test" style={{ color: '#1976d2' }}>← العودة للقائمة</a>
      </div>
    )
  }

  const { sale, items } = result.data!
  const isDraft = sale.status === 'draft'
  const isPosted = sale.status === 'posted'

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui', direction: 'rtl' }}>
      <div style={{ marginBottom: '2rem' }}>
        <a href="/test" style={{ color: '#1976d2', textDecoration: 'none' }}>
          ← العودة للقائمة
        </a>
      </div>

      {/* Sale Header */}
      <div style={{ background: '#f5f5f5', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1>فاتورة رقم: {sale.docnumber || 'غير محدد'}</h1>
          <span style={{ 
            padding: '0.5rem 1rem', 
            borderRadius: '12px',
            background: sale.status === 'posted' ? '#4caf50' : sale.status === 'cancelled' ? '#f44336' : '#ff9800',
            color: 'white',
            fontWeight: 'bold'
          }}>
            {sale.status === 'posted' ? 'منشورة' : sale.status === 'cancelled' ? 'ملغاة' : 'مسودة'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div><strong>التاريخ:</strong> {new Date(sale.docdate).toLocaleDateString('ar-DZ')}</div>
          <div><strong>نوع البيع:</strong> {sale.saletype === 'cash' ? 'نقدي' : 'آجل'}</div>
          <div><strong>نوع الفاتورة:</strong> {sale.invoice_type === 'full_invoice' ? 'فاتورة كاملة' : 'بيع سريع'}</div>
          <div><strong>إجمالي المبلغ:</strong> {sale.total} دج</div>
          <div><strong>المبلغ المدفوع:</strong> {sale.paidamount} دج</div>
          <div><strong>المبلغ المتبقي:</strong> {sale.remainingamount} دج</div>
        </div>

        {sale.notes && (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #ddd' }}>
            <strong>ملاحظات:</strong> {sale.notes}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {isDraft && items.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <form action={handlePostSale.bind(null, id)} style={{ display: 'inline' }}>
            <button 
              type="submit"
              style={{ 
                background: '#4caf50', 
                color: 'white', 
                padding: '0.75rem 2rem', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer',
                marginLeft: '1rem'
              }}
            >
              نشر الفاتورة ✓
            </button>
          </form>
        </div>
      )}

      {isPosted && (
        <div style={{ marginBottom: '2rem' }}>
          <form action={handleCancelSale.bind(null, id)} style={{ display: 'inline' }}>
            <button 
              type="submit"
              style={{ 
                background: '#f44336', 
                color: 'white', 
                padding: '0.75rem 2rem', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              إلغاء الفاتورة ✗
            </button>
          </form>
        </div>
      )}

      {/* Add Item Form (only for draft) */}
      {isDraft && (
        <div style={{ background: '#e3f2fd', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <h2>إضافة منتج</h2>
          <form action={handleAddItem.bind(null, id)}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
              <label>
                نوع المنتج:
                <select name="item_type" required style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}>
                  <option value="phone">هاتف</option>
                  <option value="accessory">إكسسوار</option>
                </select>
              </label>

              <label>
                معرف المنتج:
                <input 
                  type="text" 
                  name="product_id" 
                  required 
                  placeholder="uuid" 
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                />
              </label>

              <label>
                الكمية:
                <input 
                  type="number" 
                  name="qty" 
                  defaultValue={1}
                  min={1}
                  required 
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                />
              </label>

              <label>
                السعر الأساسي:
                <input 
                  type="number" 
                  name="base_price" 
                  step="0.01"
                  required 
                  placeholder="0.00"
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                />
              </label>

              <label>
                سعر البيع:
                <input 
                  type="number" 
                  name="unitprice" 
                  step="0.01"
                  required 
                  placeholder="0.00"
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                />
              </label>

              <label>
                الخصم:
                <input 
                  type="number" 
                  name="discount" 
                  step="0.01"
                  defaultValue={0}
                  min={0}
                  placeholder="0.00"
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                />
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
                cursor: 'pointer'
              }}
            >
              إضافة المنتج +
            </button>
          </form>
        </div>
      )}

      {/* Sale Items */}
      <div>
        <h2>المنتجات ({items.length})</h2>
        {items.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
            <thead>
              <tr style={{ background: '#424242', color: 'white' }}>
                <th style={{ padding: '1rem', textAlign: 'right' }}>النوع</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>المنتج</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>الكمية</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>السعر</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>الخصم</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>المجموع</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>IMEI</th>
                {isDraft && <th style={{ padding: '1rem', textAlign: 'center' }}>إجراء</th>}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '1rem' }}>
                    {item.item_type === 'phone' ? '📱 هاتف' : '🔌 إكسسوار'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {item.phone_id || item.accessory_id}
                  </td>
                  <td style={{ padding: '1rem' }}>{item.qty}</td>
                  <td style={{ padding: '1rem' }}>{item.unitprice} دج</td>
                  <td style={{ padding: '1rem' }}>{item.discount} دج</td>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>{item.linetotal} دج</td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                    {item.imei_snapshot || '-'}
                  </td>
                  {isDraft && (
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <form action={handleRemoveItem.bind(null, id)} style={{ display: 'inline' }}>
                        <input type="hidden" name="itemId" value={item.id} />
                        <button 
                          type="submit"
                          style={{ 
                            background: '#f44336', 
                            color: 'white', 
                            padding: '0.5rem 1rem', 
                            border: 'none', 
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          حذف
                        </button>
                      </form>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#666', background: 'white' }}>
            لا توجد منتجات في هذه الفاتورة
          </p>
        )}
      </div>
    </div>
  )
}