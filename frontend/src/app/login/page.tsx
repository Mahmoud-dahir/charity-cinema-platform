"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { X, EyeOff, Eye } from "lucide-react"

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

export default function LoginModal({ 
  isOpen = true, 
  onClose = () => {},
  onSwitchToRegister = () => {}
}: { 
  isOpen?: boolean;
  onClose?: () => void;
  onSwitchToRegister?: () => void;
}) {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  if (!isOpen) return null;

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
        onClose();
        window.location.href = '/dashboard';
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#fdfaf6] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Tabs */}
        <div className="flex w-full border-b border-gray-200 px-8 pt-8 relative">
          <div className="w-1/2 text-center pb-3 border-b-[3px] border-[#facc15]">
            <h2 className="text-xl font-bold text-black">Connexion</h2>
          </div>
          <div 
            className="w-1/2 text-center pb-3 cursor-pointer"
            onClick={onSwitchToRegister}
          >
            <h2 className="text-xl font-medium text-gray-400 hover:text-gray-600 transition-colors">Inscription</h2>
          </div>
        </div>

        {/* Form Content */}
        <div className="px-10 py-8">
          <h1 className="text-3xl font-extrabold text-center text-black mb-8">Connexion</h1>
          
          <form className="flex flex-col gap-5" onSubmit={onSubmit}>
            
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">Email*</label>
              <input
                id="email"
                type="email"
                placeholder="adresse.maill@exemple.com"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#facc15] focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white placeholder-gray-400 text-gray-900"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">Mot de passe*</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#facc15] focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white placeholder-gray-400 text-gray-900 pr-12"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="text-center mt-1">
              <a href="#" className="text-sm text-gray-600 underline hover:text-black">
                Mot de passe oublié ?
              </a>
            </div>

            {error ? (
              <p className="text-sm text-red-500 text-center font-medium mt-2">{error}</p>
            ) : null}

            <div className="mt-4 flex justify-center">
              <button 
                type="submit" 
                disabled={isLoading}
                className="bg-[#facc15] hover:bg-yellow-500 text-black font-bold py-3 px-12 rounded-full transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? "Connexion..." : "Se connecter"}
              </button>
            </div>
          </form>
        </div>
        
      </div>
    </div>
  )
}
