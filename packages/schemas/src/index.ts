import { z } from "zod";

export const RoleEnum = z.enum(["PATIENT", "DOCTOR", "ADMIN"]);
export type Role = z.infer<typeof RoleEnum>;

export const UserSchema = z.object({
  id: z.string().uuid(),
  clerk_user_id: z.string(),
  role: RoleEnum,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;

export * from "./timeline";
