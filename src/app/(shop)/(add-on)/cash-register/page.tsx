// ==================== FILE 1: app/(dashboard)/cash-register/page.tsx ====================
// Server Component - Main Page
"use server"
import { getOpenCashRegister, getCashRegistersByStore } from "@/lib/supabase/db/cashRegister"
import { CashRegisterClient } from "./CashRegisterClient"
import { redirect } from "next/navigation"
import { getCurrentUser } from '@/lib/supabase/db/auth'


export default async function CashRegisterPage() {
  // Check authentication
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // جلب البيانات من Server
 const [openRegisterRes, registerHistoryRes] = await Promise.all([
  getOpenCashRegister(user!.storeid!),
  getCashRegistersByStore(user!.storeid!, 'closed'),
])

return (
  <CashRegisterClient
    storeId={user!.storeid!}
    userId={user!.id}
    initialOpenRegister={openRegisterRes}
    initialHistory={registerHistoryRes}
  />
)
}