"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function extractErrorMessage(data: unknown): string | null {
  if (!data || typeof data !== "object") return null

  const anyData = data as Record<string, unknown>
  if (typeof anyData.detail === "string") return anyData.detail
  if (typeof anyData.error === "string") return anyData.error

  const parts: string[] = []
  for (const [key, value] of Object.entries(anyData)) {
    if (Array.isArray(value)) {
      const strings = value.filter((v): v is string => typeof v === "string")
      if (strings.length) parts.push(`${key}: ${strings.join(" ")}`)
    } else if (typeof value === "string") {
      parts.push(`${key}: ${value}`)
    }
  }

  return parts.length ? parts.join("\n") : null
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (res.ok) {
        router.replace("/")
        return
      }

      const data = await res.json().catch(() => null)
      setError(extractErrorMessage(data) ?? "Connexion impossible")
    } catch {
      setError("Connexion impossible")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-svh flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Connexion</CardTitle>
          <CardDescription>Connecte-toi avec ton email.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={onSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error ? (
              <p className="whitespace-pre-line text-sm text-destructive">{error}</p>
            ) : null}

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Connexion…" : "Se connecter"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Pas de compte ?{" "}
            <Link className="text-foreground underline" href="/register">
              Créer un compte
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  )
}
