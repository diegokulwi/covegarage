/**
 * Capa de servicio para leads/contactos.
 * Hoy simula éxito. En la fase Supabase, se conecta a supabase.from('leads').insert()
 */

import { Lead, SellCarLead } from "@/types/lead";

export async function createLead(data: Lead): Promise<{ success: boolean }> {
  // TODO (Supabase): const { error } = await supabase.from('leads').insert([{ ...data, creadoEn: new Date().toISOString() }])
  // Simula latencia de red
  await new Promise((resolve) => setTimeout(resolve, 800));
  console.log("[Mock] Lead creado:", data);
  return { success: true };
}

export async function createSellLead(
  data: SellCarLead
): Promise<{ success: boolean }> {
  // TODO (Supabase): const { error } = await supabase.from('leads').insert([{ ...data, tipo: 'sell' }])
  await new Promise((resolve) => setTimeout(resolve, 800));
  console.log("[Mock] Lead de venta creado:", data);
  return { success: true };
}
