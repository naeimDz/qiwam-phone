// app/(dashboard)/purchases/page.tsx

import { createClientServer } from '@/lib/supabase/supabaseServer'
import { PurchaseList } from './PurchaseList'
import { PurchaseFormContainer } from './PurchaseForm'

export default async function PurchasesPage() {
  const supabase = await createClientServer()



  const storeId = "550e8400-e29b-41d4-a716-446655440000"

  // جلب الموردين
  const { data: suppliers = [] } = await supabase
    .from('supplier')
    .select('id, name')
    .eq('storeid', storeId)

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-6">المشتريات</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form - Wrapped in Client Component */}
        <div className="lg:col-span-1">
          <PurchaseFormContainer storeId={storeId} suppliers={suppliers!} />
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <PurchaseList storeId={storeId} />
        </div>
      </div>
    </div>
  )
}