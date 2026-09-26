export type Guest = {
  id: string;
  guest_code: string;
  full_name: string;
  id_type: "KTP" | "PASSPORT" | "SIM" | "OTHER";
  id_number: string;
  nationality: string;
  gender: "" | "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
  date_of_birth: string | null;
  phone: string;
  email: string;
  address: string;
  company_name: string;
  notes: string;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
};
export type GuestActivity = {
  id: string;
  guest_id: string;
  user_id: string | null;
  action: string;
  changed_fields: string[];
  created_at: string;
};
