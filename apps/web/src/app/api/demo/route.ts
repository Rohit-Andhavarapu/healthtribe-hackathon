import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const body = await req.json();
  const { userId, role } = body;

  const cookieStore = await cookies();
  
  if (userId) {
    cookieStore.set("demo_user_id", userId, { path: '/' });
    cookieStore.set("demo_role", role, { path: '/' });
  } else {
    cookieStore.delete("demo_user_id");
    cookieStore.delete("demo_role");
  }

  return NextResponse.json({ success: true, userId, role });
}
