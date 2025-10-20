"use server";

import { createClientServer } from "../../supabaseServer";


// ========== 🔹 فتح صندوق جديد ==========
export async function openRegister({
  storeid,
  opened_by,
  opening_balance = 0,
  notes,
}: {
  storeid: string;
  opened_by: string;
  opening_balance?: number;
  notes?: string;
}) {
  const supabase = await createClientServer();

  // تحقق: هل هناك صندوق مفتوح حاليًا؟
  const { data: existing } = await supabase
    .from("cash_register")
    .select("*")
    .eq("storeid", storeid)
    .eq("status", "open")
    .maybeSingle();

  if (existing) throw new Error("يوجد صندوق مفتوح حاليًا لهذا المتجر.");

  const { data, error } = await supabase
    .from("cash_register")
    .insert({
      storeid,
      opened_by,
      opening_balance,
      status: "open",
      notes,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ========== 🔹 جلب الصندوق المفتوح ==========
export async function getOpenRegister(storeid: string) {
  const supabase = await createClientServer();
  const { data, error } = await supabase
    .from("cash_register")
    .select("*")
    .eq("storeid", storeid)
    .eq("status", "open")
    .maybeSingle();

  if (error) throw error;
  return data;
}

// ========== 🔹 إغلاق الصندوق ==========
export async function closeRegister({
  registerId,
  closed_by,
  closing_balance,
  expected_balance,
  difference,
  notes,
}: {
  registerId: string;
  closed_by: string;
  closing_balance: number;
  expected_balance: number;
  difference: number;
  notes?: string;
}) {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from("cash_register")
    .update({
      closed_by,
      closed_at: new Date().toISOString(),
      closing_balance,
      expected_balance,
      difference,
      status: "closed",
      notes,
    })
    .eq("id", registerId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ========== 🔹 جلب كل السجلات حسب التاريخ ==========
export async function getRegistersByStore(storeid: string) {
  const supabase = await createClientServer();
  const { data, error } = await supabase
    .from("cash_register")
    .select("*")
    .eq("storeid", storeid)
    .order("opened_at", { ascending: false });

  if (error) throw error;
  return data;
}
