import { Role } from "@healthtribe/schemas";

export function hasRole(userRole: string | undefined | null, requiredRoles: Role[]) {
  if (!userRole) return false;
  return requiredRoles.includes(userRole as Role);
}
