"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Loader2, Edit, Trash2 } from "lucide-react"
import { updateEvent, deleteEvent } from "@/app/actions/events"
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

export function EditEventDialog({ event }: { event: import('@prisma/client').Event }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const res = await updateEvent(event.id, formData)

    if (res?.error) {
      setError(res.error)
    } else {
      setIsOpen(false)
      router.refresh()
    }
    setLoading(false)
  }

  const defaultDate = event.tanggal_pentas ? new Date(event.tanggal_pentas).toISOString().split('T')[0] : ""

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20">
        <Edit className="h-4 w-4" />
      </Button>

      {isOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-lg shadow-2xl relative shadow-violet-900/20">
              <h2 className="text-xl font-bold text-white mb-2">Edit Event</h2>
              <p className="text-slate-400 text-sm mb-6">Perbarui rincian event konser atau kegiatan.</p>
              
              {error && (
                <div className="bg-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-4 border border-red-500/30">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Nama Event <span className="text-red-400">*</span></label>
                  <input required name="nama" defaultValue={event.nama} type="text" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-violet-500" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Deskripsi Singkat</label>
                  <textarea name="deskripsi" defaultValue={event.deskripsi || ""} rows={3} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-violet-500" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Tanggal Pentas</label>
                    <input name="tanggal_pentas" defaultValue={defaultDate} type="date" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-violet-500 [color-scheme:dark]" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Lokasi Tempat</label>
                    <input name="lokasi" defaultValue={event.lokasi || ""} type="text" className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-violet-500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Kategori</label>
                  <select
                    name="kategori"
                    defaultValue={event.kategori || ""}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500 transition-colors"
                  >
                    <option value="">Pilih kategori...</option>
                    {["Konser", "Lomba", "Internal", "Lainnya"].map(k => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>


                <div className="pt-4 flex justify-end gap-3 border-t border-white/5 mt-6">
                  <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Simpan Perubahan
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

export function DeleteEventDialog({ event }: { event: import('@prisma/client').Event }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setLoading(true)
    await deleteEvent(event.id)
    setIsOpen(false)
    router.refresh()
    setLoading(false)
  }

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/20">
        <Trash2 className="h-4 w-4" />
      </Button>

      {isOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative">
              <h2 className="text-xl font-bold text-white mb-2">Hapus Event</h2>
              <p className="text-slate-400 text-sm mb-6">Anda yakin ingin menghapus event <b>{event.nama}</b> beserta seluruh data partisipan dan absen-nya? Tindakan ini <b>permanen</b>.</p>
              
              <div className="flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                  Batal
                </Button>
                <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Ya, Hapus
                </Button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  )
}
