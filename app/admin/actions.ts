"use server";

/**
 * Acciones del panel. Cada una es un endpoint público de verdad (se puede llamar desde fuera),
 * así que TODAS empiezan comprobando la sesión con requireAdmin().
 */
import { redirect } from "next/navigation";
import { requireAdmin, endSession, startSession } from "@/lib/auth/session";
import { saveCar, quickUpdateCar, duplicateCar, deleteCar, QuickPatch } from "@/lib/admin/cars";
import {
  addManualInquiry,
  ClientInput,
  createClient,
  deleteClient,
  deleteInquiry,
  markAllRead,
  markClientInquiriesRead,
  markInquiryRead,
  updateClient,
} from "@/lib/admin/clients";
import {
  deleteFaq,
  deleteTestimonial,
  moveItem,
  saveFaq,
  saveTestimonial,
} from "@/lib/admin/content";
import { changePassword } from "@/lib/admin/account";
import { addVideo, deleteVideo } from "@/lib/admin/videos";
import { linkWebCar, removeGestionCar, saveGestionCar } from "@/lib/admin/accounting";

type Ok = { ok: true } | { ok: false; error: string };

// ---------- sesión ----------

export async function logoutAction(): Promise<void> {
  await requireAdmin();
  endSession();
  redirect("/login");
}

export async function changePasswordAction(current: string, next: string): Promise<Ok> {
  const admin = await requireAdmin();
  const r = await changePassword(admin.id, admin.email, String(current ?? ""), String(next ?? ""));
  if (!r.ok) return r;
  await startSession({ id: admin.id, password_hash: r.password_hash }); // esta sesión sigue abierta; las demás se cierran
  return { ok: true };
}

// ---------- coches ----------

export async function saveCarAction(input: unknown) {
  const admin = await requireAdmin();
  return saveCar(input, admin.email);
}

export async function quickUpdateCarAction(id: string, patch: QuickPatch): Promise<Ok> {
  const admin = await requireAdmin();
  return quickUpdateCar(String(id), patch ?? {}, admin.email);
}

export async function duplicateCarAction(id: string) {
  const admin = await requireAdmin();
  return duplicateCar(String(id), admin.email);
}

export async function deleteCarAction(id: string): Promise<Ok> {
  const admin = await requireAdmin();
  return deleteCar(String(id), admin.email);
}

// ---------- clientes y consultas ----------

export async function createClientAction(input: ClientInput) {
  const admin = await requireAdmin();
  return createClient(input ?? {}, admin.email);
}

export async function updateClientAction(id: number, input: ClientInput): Promise<Ok> {
  const admin = await requireAdmin();
  return updateClient(Number(id), input ?? {}, admin.email);
}

export async function deleteClientAction(id: number): Promise<Ok> {
  const admin = await requireAdmin();
  await deleteClient(Number(id), admin.email);
  return { ok: true };
}

export async function addInquiryAction(
  clientId: number,
  input: { kind?: string; message?: string; carId?: string | null }
): Promise<Ok> {
  const admin = await requireAdmin();
  return addManualInquiry(Number(clientId), input ?? {}, admin.email);
}

export async function deleteInquiryAction(id: number): Promise<Ok> {
  await requireAdmin();
  await deleteInquiry(Number(id));
  return { ok: true };
}

export async function markInquiryReadAction(id: number, isNew: boolean): Promise<Ok> {
  await requireAdmin();
  await markInquiryRead(Number(id), !!isNew);
  return { ok: true };
}

export async function markClientReadAction(clientId: number): Promise<Ok> {
  await requireAdmin();
  await markClientInquiriesRead(Number(clientId));
  return { ok: true };
}

export async function markAllReadAction(): Promise<Ok> {
  await requireAdmin();
  await markAllRead();
  return { ok: true };
}

// ---------- contenido de la web ----------

export async function saveTestimonialAction(input: Parameters<typeof saveTestimonial>[0]): Promise<Ok> {
  const admin = await requireAdmin();
  return saveTestimonial(input ?? {}, admin.email);
}

export async function deleteTestimonialAction(id: number): Promise<Ok> {
  const admin = await requireAdmin();
  await deleteTestimonial(Number(id), admin.email);
  return { ok: true };
}

export async function saveFaqAction(input: Parameters<typeof saveFaq>[0]): Promise<Ok> {
  const admin = await requireAdmin();
  return saveFaq(input ?? {}, admin.email);
}

export async function deleteFaqAction(id: number): Promise<Ok> {
  const admin = await requireAdmin();
  await deleteFaq(Number(id), admin.email);
  return { ok: true };
}

export async function moveItemAction(table: "faqs" | "testimonials", id: number, dir: "up" | "down"): Promise<Ok> {
  await requireAdmin();
  if (table !== "faqs" && table !== "testimonials") return { ok: false, error: "Lista no válida." };
  await moveItem(table, Number(id), dir === "up" ? "up" : "down");
  return { ok: true };
}

// ---------- vídeos de los coches (solo enlaces) ----------

export async function addVideoAction(carId: string, input: { title?: string; url?: string }): Promise<Ok> {
  const admin = await requireAdmin();
  return addVideo(String(carId), input ?? {}, admin.email);
}

export async function deleteVideoAction(id: number): Promise<Ok> {
  const admin = await requireAdmin();
  await deleteVideo(Number(id), admin.email);
  return { ok: true };
}

// ---------- contabilidad: enlaces con la web y coches en gestión de venta ----------

/** Enlaza una matrícula del Excel con un coche de la web (carId vacío = quitar el enlace). */
export async function linkWebCarAction(plate: string, carId: string): Promise<Ok> {
  const admin = await requireAdmin();
  return linkWebCar(String(plate ?? ""), String(carId ?? ""), admin.email);
}

export async function saveGestionCarAction(input: { plate?: string; carId?: string; agreed?: number | string }): Promise<Ok> {
  const admin = await requireAdmin();
  return saveGestionCar(input ?? {}, admin.email);
}

export async function removeGestionCarAction(plate: string): Promise<Ok> {
  const admin = await requireAdmin();
  return removeGestionCar(String(plate ?? ""), admin.email);
}
