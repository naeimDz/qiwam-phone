import { createClientServer } from "../../supabaseServer";

export async function getPaymentsByStore(storeId: string) {
  const supabase = await createClientServer();
  const { data, error } = await supabase
    .from("payment")
    .select(`
      id, amount, method, direction, reference, createdat,
      sale_id, purchase_id, expense_id,
      cash_register:register_id(id, status, opened_at, closed_at)
    `)
    .eq("storeid", storeId)
    .order("createdat", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createPayment(payload: {
  storeid: string;
  amount: number;
  direction: "in" | "out";
  method?: string;
  sale_id?: string;
  purchase_id?: string;
  expense_id?: string;
  register_id?: string;
  reference?: string;
  createdbyid?: string;
}) {
  const supabase = await createClientServer();
  const { data, error } = await supabase
    .from("payment")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}
