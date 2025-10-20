import { createClientBrowser } from "../../supabaseClient";

// ⚡ لجلب الصندوق المفتوح فقط من الواجهة (بدون "use server")
export async function getOpenRegisterClient(storeid: string) {
  const supabase = createClientBrowser();
  const { data, error } = await supabase
    .from("cash_register")
    .select("*")
    .eq("storeid", storeid)
    .eq("status", "open")
    .maybeSingle();

  if (error) throw error;
  return data;
}

// ⚡ جلب السجلات التاريخية
export async function getRegistersHistoryClient(storeid: string) {
  const supabase = createClientBrowser();
  const { data, error } = await supabase
    .from("cash_register")
    .select("*")
    .eq("storeid", storeid)
    .order("opened_at", { ascending: false });

  if (error) throw error;
  return data;
}
