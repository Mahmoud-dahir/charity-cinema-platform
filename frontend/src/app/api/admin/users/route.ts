import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { ACCESS_TOKEN_COOKIE, getBackendBaseUrl } from "@/lib/auth"

export async function GET() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const res = await fetch(`${getBackendBaseUrl()}/api/accounts/users/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
    cache: "no-store",
  })

  const data = await res.json().catch(() => null)
  return NextResponse.json(data, { status: res.status })
}
