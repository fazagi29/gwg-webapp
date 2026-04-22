"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Loader2, Edit, Trash2 } from "lucide-react"
import { updateAnggota, deleteAnggota } from "@/app/actions/anggota"
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

export function EditAnggotaDialog({ user }: { user: import('@prisma/client').User }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const res = await updateAnggota(user.id, formData)

    if (res?.error) {
      setError(res.error)
    } else {
      setIsOpen(false)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20">
        <Edit className="h-4 w-4" />
      </Button>

      {isOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl relative shadow-violet-900/20">
              <h2 className="text-xl font-bold text-white mb-6">Edit Anggota</h2>
              
              {error && (
                <div className="bg-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-4 border border-red-500/30">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Nama Lengkap</label>
                  <input required name="nama" defaultValue={user.nama} type="text" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-violet-500" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Email</label>
                  <input required name="email" defaultValue={user.email} type="email" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-violet-500" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Role</label>
                    <select required name="role" defaultValue={user.role} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500 appearance-none">
                      <option value="anggota">Anggota</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                  
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">TTL (Tempat, Tanggal Lahir)</label>
                    <input name="tempat_tanggal_lahir" defaultValue={user.tempat_tanggal_lahir || ""} placeholder="Jakarta, 12 Mei 2002" type="text" className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-violet-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Domisili</label>
                    <input name="domisili" defaultValue={user.domisili || ""} placeholder="Kota Asal / Alamat" type="text" className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-violet-500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Bagian Suara</label>
                  <select name="bagian_suara" defaultValue={user.bagian_suara || ""} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500 appearance-none">
                    <option value="" disabled>Pilih Bagian Suara...</option>
                    <option value="sopran">Sopran</option>
                    <option value="alto">Alto</option>
                    <option value="tenor">Tenor</option>
                    <option value="bass">Bass</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">URL Foto (Opsional)</label>
                  <input name="foto_url" placeholder="https://..." defaultValue={user.foto_url || ""} type="url" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-violet-500 text-sm" />
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

export function DeleteAnggotaDialog({ user }: { user: import('@prisma/client').User }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setLoading(true)
    await deleteAnggota(user.id)
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
              <h2 className="text-xl font-bold text-white mb-2">Hapus Anggota</h2>
              <p className="text-slate-400 text-sm mb-6">Anda yakin ingin menghapus <b>{user.nama}</b>? Tindakan ini tidak bisa dibatalkan.</p>
              
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
