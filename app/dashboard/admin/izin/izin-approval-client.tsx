"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Check, X } from "lucide-react"
import { approvePengajuanIzin, rejectPengajuanIzin } from "@/app/actions/izin"
import { useRouter } from "next/navigation"

interface IzinApprovalClientProps {
  izinId: string
  eventId: string
}

export function IzinApprovalClient({ izinId, eventId }: IzinApprovalClientProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleApprove() {
    setLoading(true)
    setError("")
    const res = await approvePengajuanIzin(izinId, eventId)
    if (res?.error) {
      setError(res.error)
    } else {
      router.refresh()
    }
    setLoading(false)
  }

  async function handleReject() {
    setLoading(true)
    setError("")
    const res = await rejectPengajuanIzin(izinId, eventId)
    if (res?.error) {
      setError(res.error)
    } else {
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="flex gap-2 shrink-0">
      {error && (
        <div className="text-xs text-red-400 bg-red-500/10 px-3 py-1 rounded">
          {error}
        </div>
      )}
      <Button
        onClick={handleApprove}
        disabled={loading}
        size="sm"
        className="bg-emerald-600 hover:bg-emerald-700 gap-1"
      >
        {loading && <Loader2 className="h-3 w-3 animate-spin" />}
        <Check className="h-3 w-3" />
        Setujui
      </Button>
      <Button
        onClick={handleReject}
        disabled={loading}
        size="sm"
        variant="destructive"
        className="gap-1"
      >
        {loading && <Loader2 className="h-3 w-3 animate-spin" />}
        <X className="h-3 w-3" />
        Tolak
      </Button>
    </div>
  )
}
