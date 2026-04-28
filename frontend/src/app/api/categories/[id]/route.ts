import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { ACCESS_TOKEN_COOKIE, getBackendBaseUrl } from "@/lib/auth"

const BACKEND_URL = (id: string) => `${getBackendBaseUrl()}/api/categories/${id}/`

async function getAuthHeaders(requireAuth = false) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value
  if (requireAuth && !accessToken) return null
  const headers: Record<string, string> = { Accept: "application/json" }
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`
  return headers
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const headers = await getAuthHeaders()
  const res = await fetch(BACKEND_URL(id), { method: "GET", headers: headers!, cache: "no-store" })
  const data = await res.json().catch(() => null)
  return NextResponse.json(data, { status: res.status })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const headers = await getAuthHeaders(true)
  if (!headers) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const body = await request.json()
  const res = await fetch(BACKEND_URL(id), {
    method: "PATCH",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => null)
  return NextResponse.json(data, { status: res.status })
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const headers = await getAuthHeaders(true)
  if (!headers) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const res = await fetch(BACKEND_URL(id), { method: "DELETE", headers })
  if (res.status === 204) return new NextResponse(null, { status: 204 })
  const data = await res.json().catch(() => null)
  return NextResponse.json(data, { status: res.status })
}
