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

export default function RegisterModal({ 
  isOpen = true, 
  onClose = () => {},
  onSwitchToLogin = () => {}
}: { 
  isOpen?: boolean;
  onClose?: () => void;
  onSwitchToLogin?: () => void;
}) {
  const router = useRouter()

  const [email, setEmail] = React.useState("")
  const [firstName, setFirstName] = React.useState("")
  const [lastName, setLastName] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [password2, setPassword2] = React.useState("")
  
  const [showPassword, setShowPassword] = React.useState(false)
  const [showPassword2, setShowPassword2] = React.useState(false)
  const [acceptedTerms, setAcceptedTerms] = React.useState(false)

  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  if (!isOpen) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    
    if (!acceptedTerms) {
      setError("Veuillez accepter les conditions générales d'utilisation.")
      return;
    }
    
    setIsLoading(true)

    // The backend might require a username, so we auto-generate one from the email
    // since the UX mockup omits the username field organically.
    const sanitizedEmailPrefix = email.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '_');
    const autoUsername = sanitizedEmailPrefix + Math.floor(Math.random() * 10000);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          username: autoUsername,
          first_name: firstName,
          last_name: lastName,
          password,
          password2,
        }),
      })

      if (res.ok) {
        onClose();
        router.refresh();
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
          <div 
            className="w-1/2 text-center pb-3 cursor-pointer"
            onClick={onSwitchToLogin}
          >
            <h2 className="text-xl font-medium text-gray-400 hover:text-gray-600 transition-colors">Connexion</h2>
          </div>
          <div className="w-1/2 text-center pb-3 border-b-[3px] border-[#facc15]">
            <h2 className="text-xl font-bold text-black">Inscription</h2>
          </div>
        </div>

        {/* Form Content */}
        <div className="px-10 py-6">
          <h1 className="text-3xl font-extrabold text-center text-black mb-6">Inscription</h1>
          
          <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            
            <div className="flex gap-4">
              <div className="flex flex-col gap-1.5 w-1/2">
                <label htmlFor="lastName" className="text-sm font-medium text-gray-700">Nom*</label>
                <input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  autoComplete="family-name"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#facc15] focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white placeholder-gray-400 text-gray-900"
                />
              </div>
              <div className="flex flex-col gap-1.5 w-1/2">
                <label htmlFor="firstName" className="text-sm font-medium text-gray-700">Prénom*</label>
                <input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  autoComplete="given-name"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#facc15] focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white placeholder-gray-400 text-gray-900"
                />
              </div>
            </div>

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
                className="w-full px-4 py-2.5 rounded-xl border border-[#facc15] focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white placeholder-gray-400 text-gray-900"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">Mot de passe*</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#facc15] focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white placeholder-gray-400 text-gray-900 pr-12"
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

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">Confirmez votre mot de passe*</label>
              <div className="relative">
                <input
                  id="password2"
                  type={showPassword2 ? "text" : "password"}
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                  required
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#facc15] focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white placeholder-gray-400 text-gray-900 pr-12"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword2(!showPassword2)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword2 ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-2">
              <input 
                type="checkbox" 
                id="terms" 
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="w-5 h-5 rounded border-[#facc15] text-[#facc15] focus:ring-[#facc15] cursor-pointer"
              />
              <label htmlFor="terms" className="text-[13px] text-gray-800 cursor-pointer">
                J&apos;ai lu et accepté les <span className="font-bold">conditions générales d&apos;utilisation</span>
              </label>
            </div>

            {error ? (
              <p className="text-sm text-red-500 text-center font-medium mt-1">{error}</p>
            ) : null}

            <div className="mt-3 flex justify-center">
              <button 
                type="submit" 
                disabled={isLoading}
                className="bg-[#facc15] hover:bg-yellow-500 text-black text-lg font-bold py-2.5 px-12 rounded-full transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? "Inscription..." : "S'inscrire"}
              </button>
            </div>
          </form>
        </div>
        
      </div>
    </div>
  )
}
