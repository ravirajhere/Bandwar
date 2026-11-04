import { NextRequest, NextResponse } from "next/server";
import { isValidPassword, getExpectedSessionToken } from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const password = String(body.password || "").trim();

  if (!password) {
    return NextResponse.json({ error: "Password is required" }, { status: 400 });
  }

  // Small delay to slow down brute-force attempts
  await new Promise((resolve) => setTimeout(resolve, 400));

  if (!isValidPassword(password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const sessionToken = await getExpectedSessionToken();

  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return response;
}