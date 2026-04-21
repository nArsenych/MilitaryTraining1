import { getSession, getUserById } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const user = await getUserById(session.userId);

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("[AUTH_ME]", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
