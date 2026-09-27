import { z } from "zod";
export const housekeepingActionSchema = z
  .object({
    id: z.uuid(),
    version: z.number().int().positive(),
    action: z.enum(["ASSIGN", "NOTE", "ADVANCE"]),
    assignee: z.uuid().nullable().default(null),
    note: z.string().trim().max(2000).default(""),
  })
  .refine((v) => v.action !== "NOTE" || v.note.length > 0, {
    message: "Enter a note before saving.",
    path: ["note"],
  });
