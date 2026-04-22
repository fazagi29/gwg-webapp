"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Plus, Loader2, Pencil, Trash2, X, Download, Eye, FileMusic, Filter } from "lucide-react"
import { createPartitur, updatePartitur, deletePartitur } from "@/app/actions/partitur"
import { useRouter } from "next/navigation"

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(timer)
  }, [])
  if (!mounted) return null
  return createPortal(children, document.body)
}

// ─────────────────────────────────────────────
// Form Dialog (create / edit)
// ─────────────────────────────────────────────
interface PartiturFormProps {
  mode: "create" | "edit"
  partitur?: import('@prisma/client').Partitur
  onClose: () => void
}

function PartiturForm({ mode, partitur, onClose }: PartiturFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [fileMode, setFileMode] = useState<"url" | "upload">(partitur?.file_url?.startsWith("/partitur/") ? "upload" : "url")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [existingFileName, setExistingFileName] = useState(
    partitur?.file_url?.startsWith("/partitur/") ? partitur.file_url.split("/").pop() : ""
  )
  const [uploadProgress, setUploadProgress] = useState<"idle" | "uploading" | "done" | "error">("idle")
  const [uploadedUrl, setUploadedUrl] = useState<string>(partitur?.file_url || "")
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    // Extract formData synchronously before any await
    const formData = new FormData(e.currentTarget)

    setLoading(true)
    setError("")

    let finalFileUrl = uploadedUrl

    // Jika mode upload & ada file baru dipilih
    if (fileMode === "upload" && selectedFile) {
      setUploadProgress("uploading")
      const fd = new FormData()
      fd.append("file", selectedFile)
      try {
        const res = await fetch("/api/upload/partitur", { method: "POST", body: fd })
        const data = await res.json()
        if (!res.ok || data.error) {
          setError(data.error || "Upload gagal")
          setUploadProgress("error")
          setLoading(false)
          return
        }
        finalFileUrl = data.url
        setUploadProgress("done")
      } catch {
        setError("Koneksi gagal saat upload")
        setUploadProgress("error")
        setLoading(false)
        return
      }
    }

    formData.set("file_url", finalFileUrl)

    const res = mode === "create"
      ? await createPartitur(formData)
      : await updatePartitur(partitur!.id, formData)

    if (res?.error) {
      setError(res.error)
    } else {
      onClose()
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <Portal>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div
          className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <h2 className="text-xl font-bold text-white mb-5">
            {mode === "create" ? "Tambah Partitur" : "Edit Partitur"}
          </h2>

          {error && (
            <div className="bg-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-4 border border-red-500/30">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300">Judul <span className="text-red-400">*</span></label>
              <input
                required
                name="judul"
                defaultValue={partitur?.judul}
                placeholder="Cth: O Fortuna"
                className="w-full mt-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-300">Tahun</label>
                <input
                  name="tahun"
                  type="number"
                  defaultValue={partitur?.tahun ?? undefined}
                  placeholder="2024"
                  min="0"
                  max="2100"
                  className="w-full mt-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300">Komposer</label>
                <input
                  name="komposer"
                  defaultValue={partitur?.komposer || undefined}
                  placeholder="Carl Orff"
                  className="w-full mt-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-300">Arranger</label>
                <input
                  name="arranger"
                  defaultValue={partitur?.arranger || undefined}
                  placeholder="Opsional"
                  className="w-full mt-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300">Asal Lagu</label>
                <input
                  name="asal_lagu"
                  defaultValue={partitur?.asal_lagu || undefined}
                  placeholder="Daerah, Barat..."
                  className="w-full mt-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            {/* File Section */}
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">File PDF</label>

              {/* Toggle mode */}
              <div className="flex gap-1 mb-3 bg-black/20 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setFileMode("upload")}
                  className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all ${fileMode === "upload" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"}`}
                >
                  📁 Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setFileMode("url")}
                  className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all ${fileMode === "url" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"}`}
                >
                  🔗 Paste URL
                </button>
              </div>

              {fileMode === "upload" ? (
                <div>
                  {/* Existing file info */}
                  {existingFileName && !selectedFile && (
                    <div className="flex items-center gap-2 mb-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg">
                      ✅ File terpasang: <span className="font-mono truncate max-w-45">{existingFileName}</span>
                    </div>
                  )}

                  {/* File picker */}
                  <label className="w-full">
                    <div className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${selectedFile ? "border-violet-500/50 bg-violet-500/5" : "border-white/10 hover:border-white/20 bg-black/10"}`}>
                      {selectedFile ? (
                        <div className="text-sm">
                          <p className="font-bold text-violet-300">📄 {selectedFile.name}</p>
                          <p className="text-slate-500 text-xs mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-slate-400 text-sm font-medium">Klik untuk pilih file PDF</p>
                          <p className="text-slate-600 text-xs mt-1">Maks. 20MB · Format: PDF</p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={e => {
                          const f = e.target.files?.[0] || null
                          setSelectedFile(f)
                          setUploadProgress("idle")
                        }}
                      />
                    </div>
                  </label>

                  {uploadProgress === "uploading" && (
                    <p className="text-xs text-violet-400 mt-1 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Mengupload file...
                    </p>
                  )}
                  {uploadProgress === "done" && (
                    <p className="text-xs text-emerald-400 mt-1">✅ Upload berhasil</p>
                  )}
                </div>
              ) : (
                <div>
                  <input
                    name="file_url_field"
                    value={uploadedUrl}
                    onChange={e => setUploadedUrl(e.target.value)}
                    type="url"
                    placeholder="https://drive.google.com/... atau https://..."
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500 transition-colors"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Paste URL Google Drive / direct PDF link. Pastikan akses publik.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-white/5 mt-2">
              <Button type="button" variant="ghost" onClick={onClose}>Batal</Button>
              <Button
                type="submit"
                disabled={loading || (fileMode === "upload" && uploadProgress === "uploading")}
                className="bg-violet-600 hover:bg-violet-700"
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {mode === "create" ? "Simpan" : "Update"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  )
}


// ─────────────────────────────────────────────
// PDF Viewer Modal
// ─────────────────────────────────────────────
function PdfViewer({ url, judul, onClose }: { url: string; judul: string; onClose: () => void }) {
  // Convert Google Drive share link to embed link if needed
  const embedUrl = url.includes("drive.google.com")
    ? url.replace("/view", "/preview").replace("?usp=sharing", "")
    : url

  return (
    <Portal>
      <div
        className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      >
        {/* Toolbar */}
        <div
          className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-white/10 shrink-0"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center gap-3">
            <FileMusic className="w-5 h-5 text-violet-400" />
            <span className="font-semibold text-white">{judul}</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-xl transition-colors"
              onClick={e => e.stopPropagation()}
            >
              <Download className="w-4 h-4" /> Download PDF
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF iframe */}
        <div className="flex-1 p-4" onClick={e => e.stopPropagation()}>
          <iframe
            src={embedUrl}
            className="w-full h-full rounded-2xl border border-white/10"
            title={judul}
          />
        </div>
      </div>
    </Portal>
  )
}

// ─────────────────────────────────────────────
// Delete Confirm
// ─────────────────────────────────────────────
function DeleteConfirm({ partitur, onClose }: { partitur: import('@prisma/client').Partitur; onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setLoading(true)
    await deletePartitur(partitur.id)
    onClose()
    router.refresh()
    setLoading(false)
  }

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
        <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
          <h3 className="text-lg font-bold text-white mb-2">Hapus Partitur?</h3>
          <p className="text-slate-400 text-sm mb-6">
            Partitur <strong className="text-white">{partitur.judul}</strong> akan dihapus permanen.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={onClose}>Batal</Button>
            <Button onClick={handleDelete} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Hapus"}
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  )
}

// ─────────────────────────────────────────────
// Main Client Component
// ─────────────────────────────────────────────
interface PartiturClientProps {
  partiturList: import('@prisma/client').Partitur[]
  isAdmin: boolean
}

export function PartiturClient({ partiturList, isAdmin }: PartiturClientProps) {
  const [showCreate, setShowCreate] = useState(false)
  const [editingPartitur, setEditingPartitur] = useState<import('@prisma/client').Partitur | null>(null)
  const [deletingPartitur, setDeletingPartitur] = useState<import('@prisma/client').Partitur | null>(null)
  const [viewingPartitur, setViewingPartitur] = useState<import('@prisma/client').Partitur | null>(null)

  // Filter & Sorting states
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("created_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [filterTahunMin, setFilterTahunMin] = useState("")
  const [filterTahunMax, setFilterTahunMax] = useState("")
  const [filterAsalLagu, setFilterAsalLagu] = useState("")
  const [showFilterNav, setShowFilterNav] = useState(false)

  // Asal lagu unik dropdown
  const arrayAsalLagu = Array.from(new Set(partiturList.map(p => p.asal_lagu).filter(Boolean))) as string[]

  // Validasi otomatis: Jika opsi asal lagu yang sedang dipilih dihapus dan hilang dari arrayAsalLagu, otomatis jadikan kosong
  const validFilterAsalLagu = arrayAsalLagu.includes(filterAsalLagu) ? filterAsalLagu : ""

  const filtered = partiturList
    .filter(p => {
      const matchSearch = p.judul.toLowerCase().includes(search.toLowerCase()) ||
        (p.komposer || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.arranger || "").toLowerCase().includes(search.toLowerCase())

      const matchAsal = validFilterAsalLagu ? p.asal_lagu === validFilterAsalLagu : true;
      const matchTahunMin = filterTahunMin ? (p.tahun && p.tahun >= parseInt(filterTahunMin)) : true;
      const matchTahunMax = filterTahunMax ? (p.tahun && p.tahun <= parseInt(filterTahunMax)) : true;

      return matchSearch && matchAsal && matchTahunMin && matchTahunMax;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortBy === "judul") {
        cmp = a.judul.localeCompare(b.judul)
      } else if (sortBy === "tahun") {
        cmp = (a.tahun || 0) - (b.tahun || 0)
      } else {
        cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      }
      return sortOrder === "asc" ? cmp : -cmp
    })

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Top Controls: Search + Add */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2 w-full sm:max-w-md">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari judul, komposer..."
              className="w-full bg-[#ffffff0a] border border-[#ffffff1a] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
            <Button
              variant="outline"
              onClick={() => setShowFilterNav(!showFilterNav)}
              className={`shrink-0 border-[#ffffff1a] ${showFilterNav ? "bg-[#ffffff1a] text-white" : "bg-transparent text-slate-400"} hover:bg-[#ffffff1a] hover:text-white`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter & Sort
            </Button>
          </div>

          {isAdmin && (
            <Button
              onClick={() => setShowCreate(true)}
              className="bg-violet-600 hover:bg-violet-700 text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" /> Tambah Partitur
            </Button>
          )}
        </div>

        {/* Filter Navigation Menu */}
        {showFilterNav && (
          <div className="bg-[#ffffff05] border border-[#ffffff1a] rounded-xl p-4 flex flex-wrap items-end gap-4 animate-in slide-in-from-top-2 duration-200">
            {/* Sort Selection */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Urutkan Berdasarkan</label>
              <div className="flex gap-2">
                <select
                  className="bg-[#ffffff0a] border border-[#ffffff1a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                >
                  <option value="created_at" className="bg-slate-900 text-white">Terbaru</option>
                  <option value="judul" className="bg-slate-900 text-white">Judul Lagu</option>
                  <option value="tahun" className="bg-slate-900 text-white">Tahun</option>
                </select>
                <button
                  onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                  className="bg-[#ffffff0a] hover:bg-[#ffffff1a] border border-[#ffffff1a] rounded-lg px-3 py-2 text-sm text-white font-medium"
                >
                  {sortOrder === "asc" ? "⬆ Naik" : "⬇ Turun"}
                </button>
              </div>
            </div>

            {/* Asal Lagu Filter */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Kategori / Asal Lagu</label>
              <select
                className="bg-[#ffffff0a] border border-[#ffffff1a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 min-w-[150px]"
                value={validFilterAsalLagu}
                onChange={e => setFilterAsalLagu(e.target.value)}
              >
                <option value="" className="bg-slate-900 text-white">Semua Asal Lagu</option>
                {arrayAsalLagu.map(a => <option key={a} value={a} className="bg-slate-900 text-white">{a}</option>)}
              </select>
            </div>

            {/* Range Tahun */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Rentang Tahun</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={filterTahunMin}
                  onChange={e => setFilterTahunMin(e.target.value)}
                  placeholder="Min"
                  className="w-24 bg-[#ffffff0a] border border-[#ffffff1a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
                />
                <span className="text-slate-500">-</span>
                <input
                  type="number"
                  value={filterTahunMax}
                  onChange={e => setFilterTahunMax(e.target.value)}
                  placeholder="Max"
                  className="w-24 bg-[#ffffff0a] border border-[#ffffff1a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            {/* Clear All Filters */}
            {(search || filterAsalLagu || filterTahunMin || filterTahunMax || sortBy !== 'created_at') && (
              <Button
                variant="ghost"
                className="text-slate-400 hover:text-white"
                onClick={() => {
                  setSearch("")
                  setFilterAsalLagu("")
                  setFilterTahunMin("")
                  setFilterTahunMax("")
                  setSortBy("created_at")
                  setSortOrder("desc")
                }}
              >
                Reset Semua
              </Button>
            )}
          </div>
        )}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center text-slate-500 border border-dashed border-white/10 rounded-3xl mt-4">
          {(search || filterAsalLagu || filterTahunMin || filterTahunMax)
            ? "Tidak ada partitur yang cocok dengan pencarian dan filter."
            : "Belum ada partitur. Tambahkan partitur pertama."}
        </div>
      ) : (
        <div className="space-y-3 mt-4">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-4 p-5 bg-[#0f0f13] border border-[#ffffff0a] hover:border-violet-500/30 rounded-2xl transition-all group"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-violet-900/40 border border-violet-500/20 flex items-center justify-center shrink-0">
                <FileMusic className="w-6 h-6 text-violet-300" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-base truncate">{p.judul}</h3>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-slate-500 font-medium">
                  {p.tahun && <span>📅 {p.tahun}</span>}
                  {p.komposer && <span>🎼 {p.komposer}</span>}
                  {p.arranger && <span>✏️ Arr. {p.arranger}</span>}
                  {p.asal_lagu && (
                    <span className="bg-violet-500/10 text-violet-300 px-2 py-0.5 rounded-full ring-1 ring-violet-500/30">
                      🌍 {p.asal_lagu}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {p.file_url && (
                  <>
                    <button
                      onClick={() => setViewingPartitur(p)}
                      title="Lihat PDF"
                      className="p-2 rounded-xl bg-white/5 hover:bg-violet-600/20 text-slate-400 hover:text-violet-300 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <a
                      href={p.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      title="Download PDF"
                      className="p-2 rounded-xl bg-white/5 hover:bg-emerald-600/20 text-slate-400 hover:text-emerald-400 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </>
                )}
                {isAdmin && (
                  <>
                    <button
                      onClick={() => setEditingPartitur(p)}
                      title="Edit"
                      className="p-2 rounded-xl bg-white/5 hover:bg-blue-600/20 text-slate-400 hover:text-blue-400 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingPartitur(p)}
                      title="Hapus"
                      className="p-2 rounded-xl bg-white/5 hover:bg-red-600/20 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Status file */}
              {!p.file_url && (
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest shrink-0 hidden group-hover:hidden">
                  Belum ada file
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreate && (
        <PartiturForm mode="create" onClose={() => setShowCreate(false)} />
      )}
      {editingPartitur && (
        <PartiturForm mode="edit" partitur={editingPartitur} onClose={() => setEditingPartitur(null)} />
      )}
      {deletingPartitur && (
        <DeleteConfirm partitur={deletingPartitur} onClose={() => setDeletingPartitur(null)} />
      )}
      {viewingPartitur && viewingPartitur.file_url && (
        <PdfViewer
          url={viewingPartitur.file_url}
          judul={viewingPartitur.judul}
          onClose={() => setViewingPartitur(null)}
        />
      )}
    </>
  )
}
