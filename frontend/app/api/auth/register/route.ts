import { NextRequest, NextResponse } from "next/server";

// Server-side: use internal Docker hostname. Client-side NEXT_PUBLIC_ is for browser use only.
const BACKEND_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const res = await fetch(`${BACKEND_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json(
      { detail: "Unable to connect to the server. Please try again later." },
      { status: 503 }
    );
  }
}
