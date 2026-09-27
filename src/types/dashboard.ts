export type DashboardSummary = {
  date: string;
  as_of: string;
  rooms?: { active: number; occupied: number; ready: number; blocked: number };
  housekeeping?: { open: number; unassigned: number; mine: number };
  bookings?: {
    arrivals: number;
    awaiting: number;
    departures: number;
    due: number;
    overdue: number;
  };
  payments?: {
    currency: string;
    received: string;
    reversed: string;
    net: string;
  }[];
};
