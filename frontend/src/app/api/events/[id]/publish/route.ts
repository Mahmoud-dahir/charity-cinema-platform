import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { ACCESS_TOKEN_COOKIE, getBackendBaseUrl } from "@/lib/auth"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { id } = await params
  const res = await fetch(`${getBackendBaseUrl()}/api/events/${id}/publish/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({}),
  })

  const data = await res.json().catch(() => null)
  return NextResponse.json(data, { status: res.status })
}
