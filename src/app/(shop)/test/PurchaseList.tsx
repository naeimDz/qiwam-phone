// app/components/purchase/PurchaseList.tsx
'use client'

import { getPurchasesClient, searchPurchasesByDocNumber } from "@/lib/supabase/queries/client/purchase.client"
import { useEffect, useState } from "react"


interface Purchase {
  id: string
  docnumber: string
  docdate: string
  supplier_name: string
  total: number
  paidamount: number
  remainingamount: number
  status: string
}

export function PurchaseList({ storeId }: { storeId: string }) {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPurchases = async () => {
      try {
        setLoading(true)
        const data = search 
          ? await searchPurchasesByDocNumber(storeId, search)
          : await getPurchasesClient(storeId)
        setPurchases(data || [])
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(loadPurchases, 300)
    return () => clearTimeout(timer)
  }, [search, storeId])

  if (loading) return <div className="text-center py-8">جاري التحميل...</div>

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="ابحث برقم الفاتورة..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg"
      />

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-right">رقم الفاتورة</th>
              <th className="px-4 py-2 text-right">المورد</th>
              <th className="px-4 py-2 text-right">التاريخ</th>
              <th className="px-4 py-2 text-right">الإجمالي</th>
              <th className="px-4 py-2 text-right">المدفوع</th>
              <th className="px-4 py-2 text-right">المتبقي</th>
              <th className="px-4 py-2 text-right">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{p.docnumber}</td>
                <td className="px-4 py-2">{p.supplier_name}</td>
                <td className="px-4 py-2">{new Date(p.docdate).toLocaleDateString('ar-EG')}</td>
                <td className="px-4 py-2">{p.total.toFixed(2)}</td>
                <td className="px-4 py-2">{p.paidamount.toFixed(2)}</td>
                <td className="px-4 py-2 text-red-600">{p.remainingamount.toFixed(2)}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    p.status === 'posted' ? 'bg-green-100 text-green-800' :
                    p.status === 'draft' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {purchases.length === 0 && (
        <div className="text-center text-gray-500 py-8">لا توجد مشتريات</div>
      )}
    </div>
  )
}

