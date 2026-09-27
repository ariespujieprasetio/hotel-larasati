export type StaffActivity = {
  id: string;
  profile_id: string;
  user_id: string | null;
  action: "CREATE" | "UPDATE" | "DELETE";
  changed_fields: string[];
  created_at: string;
};
