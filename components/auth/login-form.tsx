"use client"

import * as React from "react"
import { useTransition, useState } from "react"
import { loginAction } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export function LoginForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const result = await loginAction(formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium">
          {error}
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email" className="text-white/80">Email</Label>
        <Input 
          id="email" 
          name="email"
          type="email" 
          placeholder="anggota@ukmchoir.ac.id" 
          required 
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl focus-visible:ring-violet-500"
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-white/80">Password</Label>
          <a href="#" className="text-sm font-medium text-violet-400 hover:text-violet-300">
            Lupa password?
          </a>
        </div>
        <Input 
          id="password" 
          name="password"
          type="password" 
          required 
          className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus-visible:ring-violet-500"
        />
      </div>

      <Button 
        type="submit" 
        className="w-full h-12 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition-all"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  )
}
