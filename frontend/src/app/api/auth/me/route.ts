import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  getBackendBaseUrl,
  isProd,
} from "@/lib/auth"

async function fetchMe(accessToken: string) {
  return fetch(`${getBackendBaseUrl()}/api/accounts/users/me/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
    cache: "no-store",
  })
}

async function refreshAccessToken(refreshToken: string) {
  return fetch(`${getBackendBaseUrl()}/api/accounts/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refreshToken }),
    cache: "no-store",
  })
}

export async function GET() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  let meRes = await fetchMe(accessToken)

  if (meRes.status === 401 && refreshToken) {
    const refreshRes = await refreshAccessToken(refreshToken)
    const refreshData = await refreshRes.json().catch(() => null)

    if (refreshRes.ok && refreshData?.access) {
      meRes = await fetchMe(refreshData.access)
      const meData = await meRes.json().catch(() => null)

      if (!meRes.ok) {
        return NextResponse.json(meData ?? { error: "Unauthorized" }, { status: meRes.status })
      }

      const res = NextResponse.json(meData, { status: 200 })
      res.cookies.set(ACCESS_TOKEN_COOKIE, refreshData.access, {
        httpOnly: true,
        sameSite: "lax",
        secure: isProd(),
        path: "/",
      })
      return res
    }
  }

  const meData = await meRes.json().catch(() => null)

  if (!meRes.ok) {
    return NextResponse.json(meData ?? { error: "Unauthorized" }, { status: meRes.status })
  }

  return NextResponse.json(meData, { status: 200 })
}
