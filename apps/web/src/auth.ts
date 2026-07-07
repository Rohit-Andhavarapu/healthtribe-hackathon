import { auth as clerkAuth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";

export async function getAuthSession() {
  return await clerkAuth();
}
