import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { ACCESS_TOKEN_COOKIE, getBackendBaseUrl } from "@/lib/auth"

export async function GET(request: Request) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value
  const { searchParams } = new URL(request.url)

  const headers: Record<string, string> = {
    Accept: "application/json",
  }
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  const baseUrl = `${getBackendBaseUrl()}/api/events/`
  const queryString = searchParams.toString()
  const finalUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl

  const res = await fetch(finalUrl, {
    method: "GET",
    headers,
    cache: "no-store",
  })

  const data = await res.json().catch(() => null)
  return NextResponse.json(data, { status: res.status })
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const incomingFormData = await request.formData();

    const outgoingFormData = new FormData();
    incomingFormData.forEach((value, key) => {
      outgoingFormData.append(key, value);
    });

    const res = await fetch(`${getBackendBaseUrl()}/api/events/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      body: outgoingFormData,
    });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  }

  const body = await request.json()

  const res = await fetch(`${getBackendBaseUrl()}/api/events/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  })

  const data = await res.json().catch(() => null)
  return NextResponse.json(data, { status: res.status })
}
