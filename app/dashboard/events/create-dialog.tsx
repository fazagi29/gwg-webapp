"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import { createEvent } from "@/app/actions/events"
import { useRouter } from "next/navigation"

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(timer)
  }, [])
  if (!mounted) return null
  return createPortal(children, document.body)
}

const KATEGORI_OPTIONS = ["Konser", "Lomba", "Internal", "Lainnya"]

export function CreateEventDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const res = await createEvent(formData)

    if (res?.error) {
      setError(res.error)
    } else {
      setIsOpen(false)
      if (res?.eventId) {
        router.push(`/dashboard/events/${res.eventId}`)
      } else {
        router.refresh()
      }
    }
    setLoading(false)
  }

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-40 h-16 w-16 bg-violet-600 hover:bg-violet-700 text-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(124,58,237,0.5)] cursor-pointer transition-transform hover:scale-105"
        title="Buat Event Baru"
      >
        <Plus className="h-6 w-6" />
      </div>

      {isOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-lg shadow-2xl relative shadow-violet-900/20">
              <h2 className="text-xl font-bold text-white mb-2">Buat Event Baru</h2>
              <p className="text-slate-400 text-sm mb-6">Buat konser, kompetisi, atau agenda baru untuk GWG.</p>

              {error && (
                <div className="bg-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-4 border border-red-500/30">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Nama Event <span className="text-red-400">*</span></label>
                  <input
                    required
                    name="nama"
                    type="text"
                    placeholder="Cth: Konser Tahunan 2025"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Kategori <span className="text-red-400">*</span></label>
                  <select
                    name="kategori"
                    required
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500 transition-colors"
                  >
                    <option value="">Pilih kategori...</option>
                    {KATEGORI_OPTIONS.map(k => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Deskripsi</label>
                  <textarea
                    name="deskripsi"
                    placeholder="Deskripsi singkat event..."
                    rows={3}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500 resize-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Tanggal Pelaksanaan</label>
                    <input
                      name="tanggal_pentas"
                      type="date"
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500 [color-scheme:dark] transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Lokasi</label>
                    <input
                      name="lokasi"
                      type="text"
                      placeholder="Auditorium Kampus"
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-white/5 mt-6">
                  <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Batal</Button>
                  <Button type="submit" disabled={loading} className="bg-violet-600 hover:bg-violet-700">
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Buat Event
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}
    </>
  )
}
