import { createClientBrowser } from "../../supabaseClient";

export async function getPaymentsClient(storeId: string) {
  const supabase = createClientBrowser();
  const { data, error } = await supabase
    .from("payment")
    .select("id, amount, method, direction, createdat")
    .eq("storeid", storeId)
    .order("createdat", { ascending: false });

  if (error) throw error;
  return data;
}
