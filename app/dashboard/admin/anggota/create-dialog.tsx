"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import { createAnggota } from "@/app/actions/anggota"
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

export function CreateAnggotaDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const res = await createAnggota(formData)

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
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Tambah Anggota
      </Button>

      {isOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl relative shadow-violet-900/20">
              <h2 className="text-xl font-bold text-white mb-2">Tambah Anggota Baru</h2>
              <p className="text-slate-400 text-sm mb-6">Tambahkan user ke dalam sistem webapp paduan suara.</p>
              
              {error && (
                <div className="bg-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-4 border border-red-500/30">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Nama Lengkap</label>
                  <input required name="nama" type="text" placeholder="John Doe" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-violet-500" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Email</label>
                  <input required name="email" type="email" placeholder="john@example.com" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-violet-500" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Role</label>
                    <select required name="role" defaultValue="anggota" className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500 appearance-none">
                      <option value="anggota">Anggota</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Bagian Suara</label>
                    <select name="bagian_suara" className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 mt-1 text-white [color-scheme:dark]">
                      <option value="">Pilih Bagian Suara...</option>
                      <option value="sopran">Sopran</option>
                      <option value="alto">Alto</option>
                      <option value="tenor">Tenor</option>
                      <option value="bass">Bass</option>
                    </select>
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-2">Password default adalah <b>choir123</b>. User dapat mengubahnya di halaman profil nanti.</p>

                <div className="pt-4 flex justify-end gap-3 border-t border-white/5 mt-6">
                  <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Simpan Akun
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
