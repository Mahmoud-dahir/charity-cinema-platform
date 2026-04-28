import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { ACCESS_TOKEN_COOKIE, getBackendBaseUrl } from "@/lib/auth"

export async function GET(request: Request) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value

  const headers: Record<string, string> = {
    Accept: "application/json",
  }
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  const res = await fetch(`${getBackendBaseUrl()}/api/events/categories/`, {
    method: "GET",
    headers,
    cache: "no-store",
  })

  const data = await res.json().catch(() => null)
  return NextResponse.json(data, { status: res.status })
}
