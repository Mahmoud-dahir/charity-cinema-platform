import { NextResponse } from "next/server"

import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  getBackendBaseUrl,
  isProd,
} from "@/lib/auth"

export async function POST(req: Request) {
  try {
    let payload: unknown
    try {
      payload = await req.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    let backendRes: Response;
    try {
      backendRes = await fetch(`${getBackendBaseUrl()}/api/accounts/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      })
    } catch (fetchError) {
      console.error("Fetch to backend failed:", fetchError);
      return NextResponse.json({ error: "Le serveur backend est injoignable." }, { status: 503 })
    }

    const data = await backendRes.json().catch(() => null)

    if (!backendRes.ok) {
      console.error("Backend validation failed:", backendRes.status, data);
      return NextResponse.json(data ?? { error: "Register failed" }, {
        status: backendRes.status,
      })
    }

    if (!data?.access || !data?.refresh) {
      return NextResponse.json({ error: "Backend response missing tokens" }, { status: 502 })
    }

    const res = NextResponse.json(
      { user: data.user ?? null },
      { status: backendRes.status }
    )

    res.cookies.set(ACCESS_TOKEN_COOKIE, data.access, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd(),
      path: "/",
    })

    res.cookies.set(REFRESH_TOKEN_COOKIE, data.refresh, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd(),
      path: "/",
    })

    return res
  } catch (err) {
    console.error("Internal API error:", err);
    return NextResponse.json({ error: "Erreur interne du serveur lors de la requête" }, { status: 500 })
  }
}
