import { z } from "zod";
import { roomStatuses } from "@/lib/rooms";
const editIdentity = {
  id: z.uuid().optional(),
  version: z.number().int().positive().optional(),
};
export const roomTypeSchema = z
  .object({
    ...editIdentity,
    name: z.string().trim().min(1).max(80),
    description: z.string().trim().max(2000),
    base_price: z.number().min(0).max(999999999999.99).multipleOf(0.01),
    capacity: z.number().int().min(1).max(30),
    bed_type: z.string().trim().min(1).max(100),
    size: z.number().min(0).max(9999),
    amenities: z
      .string()
      .max(2000)
      .refine(
        (v) => v.split(",").filter((s) => s.trim()).length <= 30,
        "Maximum 30 amenities.",
      ),
    is_active: z.boolean(),
  })
  .refine((v) => !v.id || v.version !== undefined, {
    message: "Reload this record before editing.",
    path: ["version"],
  });
export const roomSchema = z
  .object({
    ...editIdentity,
    room_number: z
      .string()
      .trim()
      .regex(/^[A-Za-z0-9-]{1,12}$/, "Use 1–12 letters, numbers or hyphens."),
    room_type_id: z.uuid("Select a room type."),
    floor: z.number().int().min(-10).max(200),
    notes: z.string().trim().max(2000),
    is_active: z.boolean(),
  })
  .refine((v) => !v.id || v.version !== undefined, {
    message: "Reload this record before editing.",
    path: ["version"],
  });
export const roomStatusSchema = z.object({
  id: z.uuid(),
  version: z.number().int().positive(),
  status: z.enum(roomStatuses),
});
export type RoomInput = z.infer<typeof roomSchema>;
export type RoomTypeInput = z.infer<typeof roomTypeSchema>;
