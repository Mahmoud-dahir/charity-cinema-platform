import { NextResponse } from "next/server"

import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  getBackendBaseUrl,
  isProd,
} from "@/lib/auth"

export async function POST(req: Request) {
  let payload: unknown
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const backendRes = await fetch(`${getBackendBaseUrl()}/api/accounts/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  })

  const data = await backendRes.json().catch(() => null)

  if (!backendRes.ok) {
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
}
