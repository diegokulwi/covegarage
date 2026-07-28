export type LeadType = "interest" | "sell" | "contact";
export type LeadStatus = "new" | "contacted" | "closed";

export interface Lead {
  id?: string;
  tipo: LeadType;
  nombre: string;
  email: string;
  telefono: string;
  mensaje?: string;
  carId?: string;
  carSlug?: string;
  carName?: string;
  status?: LeadStatus;
  creadoEn?: string;
}

export interface SellCarLead extends Lead {
  tipo: "sell";
  marcaCoche: string;
  modeloCoche: string;
  añoCoche: number;
  kilometrajeCoche: number;
  combustibleCoche: string;
}
