"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, X } from "lucide-react"
import { submitPengajuanIzin } from "@/app/actions/izin"
import { useRouter } from "next/navigation"

interface IzinModalProps {
  sesiId: string
  sesiJudul: string
  onClose: () => void
}

export function IzinModal({ sesiId, sesiJudul, onClose }: IzinModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [alasan, setAlasan] = useState("")
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await submitPengajuanIzin(sesiId, alasan)

    if (res?.error) {
      setError(res.error)
      setLoading(false)
    } else {
      onClose()
      router.refresh()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600/30 to-blue-600/30 border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Ajukan Izin Absen</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/20 text-red-400 p-3 rounded-lg text-sm border border-red-500/30">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-slate-300 block mb-2">
              Sesi Latihan
            </label>
            <div className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white/80">
              {sesiJudul}
            </div>
          </div>

          <div>
            <label htmlFor="alasan" className="text-sm font-medium text-slate-300 block mb-2">
              Alasan Izin <span className="text-red-400">*</span>
            </label>
            <textarea
              id="alasan"
              required
              value={alasan}
              onChange={e => setAlasan(e.target.value)}
              placeholder="Jelaskan alasan Anda tidak bisa hadir pada sesi ini..."
              maxLength={500}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors resize-none"
              rows={4}
            />
            <p className="text-xs text-slate-500 mt-1">
              {alasan.length}/500 karakter
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading || !alasan.trim()}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Ajukan Izin
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
