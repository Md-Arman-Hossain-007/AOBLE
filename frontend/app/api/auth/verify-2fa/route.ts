import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function POST(request: NextRequest) {
  const { username, code } = await request.json();

  try {
    const res = await fetch(`${BACKEND_URL}/auth/login/verify-2fa?username=${encodeURIComponent(username)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("2FA Verify API error:", error);
    return NextResponse.json(
      { detail: "Unable to connect to the server. Please try again later." },
      { status: 503 }
    );
  }
}
