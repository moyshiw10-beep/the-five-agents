import { z } from "zod";

export const LEAD_STATUSES = [
  "NEW",
  "CONTACTED",
  "FOLLOW_UP_SCHEDULED",
  "CONVERTED",
  "NOT_INTERESTED",
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "חדש",
  CONTACTED: "יצרתי קשר",
  FOLLOW_UP_SCHEDULED: "נקבע מעקב",
  CONVERTED: "הצטרף",
  NOT_INTERESTED: "לא מעוניין",
};

export const PLAYER_STATUSES = ["ACTIVE", "PAST"] as const;
export type PlayerStatus = (typeof PLAYER_STATUSES)[number];

export const TEAM_STATUSES = ["ACTIVE", "PAST"] as const;
export type TeamStatus = (typeof TEAM_STATUSES)[number];

export const STATUS_LABELS: Record<"ACTIVE" | "PAST", string> = {
  ACTIVE: "פעיל",
  PAST: "עבר",
};

export const LeadFormSchema = z.object({
  name: z.string().trim().min(1, "שם הוא שדה חובה"),
  phone: z.string().trim().min(1, "טלפון הוא שדה חובה"),
  notes: z.string().trim().optional(),
  status: z.enum(LEAD_STATUSES),
  nextFollowUpDate: z.string().trim().optional(),
});

export const PlayerFormSchema = z.object({
  name: z.string().trim().min(1, "שם הוא שדה חובה"),
  phone: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  status: z.enum(PLAYER_STATUSES),
  teamId: z.string().trim().optional(),
});

export const TeamFormSchema = z.object({
  name: z.string().trim().min(1, "שם הוא שדה חובה"),
  notes: z.string().trim().optional(),
  status: z.enum(TEAM_STATUSES),
});
