"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Camera, UserCircle } from "lucide-react"
import { updateProfilSaya } from "@/app/actions/anggota"
import { useRouter } from "next/navigation"
import type { User } from "@prisma/client"

export function ProfilForm({ user }: { user: Partial<User> }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(user.foto_url || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setError("Ukuran foto maksimal 2MB")
      return
    }
    
    const reader = new FileReader()
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    const formData = new FormData(e.currentTarget)
    // Append the base64 image if it was changed locally and is not a remote URL
    if (imagePreview && imagePreview.startsWith("data:image")) {
      formData.set("foto_url", imagePreview)
    } else if (imagePreview) {
      formData.set("foto_url", imagePreview)
    }

    const res = await updateProfilSaya(formData)

    if (res?.error) {
      setError(res.error)
    } else {
      setSuccess("Profil berhasil diperbarui!")
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Picture Upload Section inside the form but visually distinct */}
      <div className="flex flex-col items-center sm:hidden mb-6">
         <div className="relative mb-4 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-slate-900 bg-gradient-to-tr from-violet-500 to-blue-500 p-1 shadow-2xl">
               <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                 {imagePreview ? (
                   <img src={imagePreview} alt="Profile" className="h-full w-full object-cover rounded-full" />
                 ) : (
                   <UserCircle className="h-16 w-16 text-slate-500" />
                 )}
               </div>
            </div>
            <Button type="button" size="icon" className="absolute bottom-0 right-0 rounded-full h-10 w-10 border-2 border-slate-900">
              <Camera className="h-4 w-4" />
            </Button>
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
         </div>
      </div>

      {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg text-sm border border-red-500/30">{error}</div>}
      {success && <div className="bg-emerald-500/20 text-emerald-400 p-3 rounded-lg text-sm border border-emerald-500/30">{success}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2 max-md:hidden col-span-full">
           <label className="text-sm font-medium text-slate-300 block">Foto Profil</label>
           <div className="flex items-center gap-4">
               <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-white/10 bg-slate-800">
                 {imagePreview ? (
                   <img src={imagePreview} alt="Profile" className="h-full w-full object-cover" />
                 ) : (
                   <div className="h-full w-full flex items-center justify-center bg-slate-900"><UserCircle className="h-10 w-10 text-slate-500" /></div>
                 )}
               </div>
               <div>
                  <Button type="button" onClick={() => fileInputRef.current?.click()} variant="outline" size="sm">
                    Ganti Foto
                  </Button>
                  <p className="text-xs text-slate-500 mt-2">Maks. 2MB. Disarankan format persegi.</p>
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
               </div>
           </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Nama Lengkap</label>
          <input required name="nama" type="text" defaultValue={user.nama} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-violet-500 transition-colors" />
        </div>
        <div className="space-y-2">
           <label className="text-sm font-medium text-slate-300">Nomor HP / WA</label>
          <input name="no_hp" type="text" placeholder="Contoh: 0812..." defaultValue={user.no_hp || ""} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-violet-500 transition-colors" />
        </div>
        
        <div className="space-y-2">
           <label className="text-sm font-medium text-slate-300">Bagian Suara</label>
           <select name="bagian_suara" defaultValue={user.bagian_suara || ""} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-violet-500 transition-colors appearance-none">
             <option value="" disabled className="text-slate-500">Pilih Bagian Suara...</option>
             <option value="sopran">Sopran</option>
             <option value="alto">Alto</option>
             <option value="tenor">Tenor</option>
             <option value="bass">Bass</option>
           </select>
        </div>
        <div className="space-y-2">
           <label className="text-sm font-medium text-slate-300">Angkatan</label>
          <input name="angkatan" type="text" placeholder="Contoh: 2023" defaultValue={user.angkatan || ""} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-violet-500 transition-colors" />
        </div>

        <div className="space-y-2">
           <label className="text-sm font-medium text-slate-300">Tempat, Tanggal Lahir</label>
          <input name="tempat_tanggal_lahir" type="text" placeholder="Jakarta, 17 Agustus 2002" defaultValue={user.tempat_tanggal_lahir || ""} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-violet-500 transition-colors" />
        </div>
        <div className="space-y-2">
           <label className="text-sm font-medium text-slate-300">Domisili (Alamat Sekarang)</label>
          <input name="domisili" type="text" placeholder="Jl. Sudirman No 1..." defaultValue={user.domisili || ""} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-violet-500 transition-colors" />
        </div>
      </div>
      
      <div className="pt-6 border-t border-white/5 flex justify-end gap-3">
        <Button disabled={loading} className="w-full md:w-auto px-8">
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Simpan Perubahan
        </Button>
      </div>
    </form>
  )
}
