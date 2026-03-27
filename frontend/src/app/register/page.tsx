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

export default function RegisterPage() {
  const router = useRouter()

  const [email, setEmail] = React.useState("")
  const [username, setUsername] = React.useState("")
  const [firstName, setFirstName] = React.useState("")
  const [lastName, setLastName] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [password2, setPassword2] = React.useState("")

  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          username,
          first_name: firstName,
          last_name: lastName,
          password,
          password2,
        }),
      })

      if (res.ok) {
        router.replace("/")
        return
      }

      const data = await res.json().catch(() => null)
      setError(extractErrorMessage(data) ?? "Inscription impossible")
    } catch {
      setError("Inscription impossible")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-svh flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Créer un compte</CardTitle>
          <CardDescription>Inscris-toi en quelques secondes.</CardDescription>
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
              <Label htmlFor="username">Nom d’utilisateur</Label>
              <Input
                id="username"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password2">Confirmer le mot de passe</Label>
              <Input
                id="password2"
                type="password"
                autoComplete="new-password"
                required
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
              />
            </div>

            {error ? (
              <p className="whitespace-pre-line text-sm text-destructive">{error}</p>
            ) : null}

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Inscription…" : "S’inscrire"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <Link className="text-foreground underline" href="/login">
              Se connecter
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  )
}
