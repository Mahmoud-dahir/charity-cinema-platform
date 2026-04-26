export const ACCESS_TOKEN_COOKIE = "access_token"
export const REFRESH_TOKEN_COOKIE = "refresh_token"

export function getBackendBaseUrl() {
  return process.env.BACKEND_URL ?? "http://127.0.0.1:8000"
}

export function isProd() {
  if (typeof window !== "undefined") {
    return window.location.protocol === "https:"
  }
  return process.env.NODE_ENV === "production" && process.env.PROTOCOL === "https"
}
