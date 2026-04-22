"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Loader2, Key, Users, CalendarPlus, Pencil, X, Check, Trash2, UserPlus } from "lucide-react"
import { openAbsensi, submitAbsensi, createSesi } from "@/app/actions/sesi"
import { addMemberToEvent, removeMemberFromEvent, updateEventSection } from "@/app/actions/events"
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

// ─────────────────────────────────────────────
// AbsenInput
// ─────────────────────────────────────────────
export function AbsenInput({ eventId }: { eventId: string }) {
  const [kode, setKode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const router = useRouter()

  async function handleAbsen(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccessMsg("")

    if (kode.length !== 4) {
      setError("Kode harus 4 karakter")
      setLoading(false)
      return
    }

    const res = await submitAbsensi(kode, eventId)
    if (res?.error) {
      setError(res.error)
    } else {
      setKode("")
      setSuccessMsg(res?.statusKehadiran === "terlambat" ? "Absen berhasil direkam (Terlambat)" : "Absen berhasil direkam!")
      router.refresh()
      setTimeout(() => setSuccessMsg(""), 3000)
    }
    setLoading(false)
  }

  return (
    <div className="w-full max-w-sm mt-4 relative">
      <form onSubmit={handleAbsen} className="flex gap-2 w-full relative">
        <div className="relative flex-1">
          <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={kode}
            onChange={e => setKode(e.target.value.toUpperCase())}
            maxLength={4}
            placeholder="Kode 4 Digit"
            className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white font-mono tracking-widest uppercase focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>
        <Button disabled={loading || kode.length !== 4} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Hadir"}
        </Button>
      </form>
      {error && <p className="absolute -bottom-6 text-xs text-red-400">{error}</p>}
      {successMsg && <p className={`absolute -bottom-6 text-xs font-medium ${successMsg.includes("Terlambat") ? "text-amber-400" : "text-emerald-400"}`}>{successMsg}</p>}
    </div>
  )
}

// ─────────────────────────────────────────────
// BukaAbsenButton
// ─────────────────────────────────────────────
export function BukaAbsenButton({ sesiId, eventId }: { sesiId: string; eventId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleBuka() {
    setLoading(true)
    await openAbsensi(sesiId, eventId)
    setLoading(false)
    router.refresh()
  }

  return (
    <Button size="sm" onClick={handleBuka} disabled={loading} className="bg-amber-600 hover:bg-amber-700 text-white shadow-[0_0_15px_rgba(217,119,6,0.3)]">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buka Absen"}
    </Button>
  )
}

// ─────────────────────────────────────────────
// SectionEditor — CRUD per section box (persisted to DB)
// ─────────────────────────────────────────────
interface SectionEditorProps {
  sectionKey: string
  icon: string
  label: string
  value: string | null
  placeholder: string
  isAdmin: boolean
  eventId: string
}

export function SectionEditor({ sectionKey, icon, label, value, placeholder, isAdmin, eventId }: SectionEditorProps) {
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState(value || "")
  const [saved, setSaved] = useState(value || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleSave() {
    setLoading(true)
    setError("")
    const res = await updateEventSection(eventId, sectionKey, content)
    if (res?.error) {
      setError(res.error)
    } else {
      setSaved(content)
      setEditing(false)
      router.refresh()
    }
    setLoading(false)
  }

  async function handleClear() {
    setLoading(true)
    setError("")
    const res = await updateEventSection(eventId, sectionKey, "")
    if (!res?.error) {
      setContent("")
      setSaved("")
      setEditing(false)
      router.refresh()
    }
    setLoading(false)
  }

  function handleCancel() {
    setContent(saved)
    setEditing(false)
    setError("")
  }

  return (
    <div className="bg-[#13111a] border border-[#ffffff0a] p-6 rounded-2xl group relative">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-bold tracking-widest uppercase text-violet-300">
          <span className="font-mono text-lg">{icon}</span>
          {label}
        </div>
        {isAdmin && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={4}
            className="w-full bg-black/20 border border-violet-500/40 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-400 resize-none transition-colors"
            placeholder={`Tuliskan keterangan ${label.toLowerCase()}...`}
            autoFocus
            disabled={loading}
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleClear}
              disabled={loading}
              className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3 h-3" /> Hapus
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              <X className="w-3 h-3" /> Batal
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="text-xs text-white px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`text-xs leading-relaxed whitespace-pre-wrap ${saved ? "text-slate-300" : "text-slate-600 italic"}`}
          onClick={() => isAdmin && setEditing(true)}
        >
          {saved || placeholder}
        </div>
      )}
    </div>
  )
}


// ─────────────────────────────────────────────
// SingersPanel — Daftar Singers + CRUD
// ─────────────────────────────────────────────
interface SingersPanelProps {
  eventId: string
  members: (import('@prisma/client').EventMember & { user: import('@prisma/client').User })[]
  availableUsers: import('@prisma/client').User[]
  isAdmin: boolean
}

export function SingersPanel({ eventId, members, availableUsers, isAdmin }: SingersPanelProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState("")
  const [loading, setLoading] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const router = useRouter()

  const VOICE_COLORS: Record<string, string> = {
    Soprano: "text-rose-400 bg-rose-400/10",
    Alto: "text-amber-400 bg-amber-400/10",
    Tenor: "text-blue-400 bg-blue-400/10",
    Bass: "text-emerald-400 bg-emerald-400/10",
    sopran: "text-rose-400 bg-rose-400/10",
    alto: "text-amber-400 bg-amber-400/10",
    tenor: "text-blue-400 bg-blue-400/10",
    bass: "text-emerald-400 bg-emerald-400/10",
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedUser) return
    setLoading(true)
    await addMemberToEvent(eventId, selectedUser)
    setShowAddModal(false)
    setSelectedUser("")
    router.refresh()
    setLoading(false)
  }

  async function handleRemove(userId: string) {
    setRemovingId(userId)
    await removeMemberFromEvent(eventId, userId)
    router.refresh()
    setRemovingId(null)
  }

  return (
    <div className="bg-[#171421] border border-[#ffffff1a] rounded-3xl p-6 sticky top-4">
      <div className="flex items-center justify-between mb-5">
        <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">
          Daftar Singers ({members.length})
        </span>
        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-violet-400 hover:text-violet-300 bg-violet-600/10 hover:bg-violet-600/20 border border-violet-500/20 px-3 py-1.5 rounded-xl transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" /> Tambah
          </button>
        )}
      </div>

      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
        {members.length === 0 ? (
          <p className="text-slate-600 text-xs text-center py-6 italic">Belum ada singer terdaftar.</p>
        ) : (
          members.map((m) => {
            const voiceColor = VOICE_COLORS[m.user?.bagian_suara || ""] || "text-slate-400 bg-slate-400/10"
            return (
              <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#ffffff05] hover:bg-[#ffffff0a] transition-colors group/singer">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-500 to-blue-500 p-[1.5px] shrink-0">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-xs font-bold text-white">
                    {m.user?.nama?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{m.user?.nama}</p>
                  {m.user?.bagian_suara && (
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${voiceColor}`}>
                      {m.user.bagian_suara}
                    </span>
                  )}
                </div>
                {isAdmin && (
                  <button
                    onClick={() => handleRemove(m.user_id)}
                    disabled={removingId === m.user_id}
                    className="opacity-0 group-hover/singer:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400"
                  >
                    {removingId === m.user_id
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <X className="w-3.5 h-3.5" />
                    }
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Add Singer Modal */}
      {showAddModal && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowAddModal(false)}>
            <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-white mb-4">Tambah Singer</h3>
              <form onSubmit={handleAdd} className="space-y-4">
                <select
                  value={selectedUser}
                  onChange={e => setSelectedUser(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500"
                >
                  <option value="">Pilih anggota...</option>
                  {availableUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nama} {u.bagian_suara ? `(${u.bagian_suara})` : ""}
                    </option>
                  ))}
                </select>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>Batal</Button>
                  <Button type="submit" disabled={!selectedUser || loading} className="bg-violet-600 hover:bg-violet-700">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Tambah"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// CreateSesiDialog — renamed button
// ─────────────────────────────────────────────
export function CreateSesiDialog({ eventId }: { eventId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.append("event_id", eventId)
    await createSesi(formData)
    setIsOpen(false)
    router.refresh()
    setLoading(false)
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="outline" className="border-violet-500/30 text-violet-300 hover:bg-violet-600/10">
        <CalendarPlus className="mr-2 h-4 w-4" /> Tambahkan Jadwal Latihan
      </Button>
      {isOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-md">
              <h3 className="text-lg font-bold text-white mb-4">Tambahkan Jadwal Latihan</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400">Judul Sesi</label>
                  <input required name="judul" className="w-full mt-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-violet-500" placeholder="Contoh: Latihan Gabungan 1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-400">Waktu Mulai</label>
                    <input required type="datetime-local" name="waktu_mulai" className="w-full mt-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white [color-scheme:dark] focus:outline-none focus:border-violet-500" />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Waktu Selesai</label>
                    <input required type="datetime-local" name="waktu_selesai" className="w-full mt-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white [color-scheme:dark] focus:outline-none focus:border-violet-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-400">Lokasi</label>
                    <input name="lokasi" className="w-full mt-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-violet-500" placeholder="Selasar Rektorat" />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Toleransi Terlambat (Menit)</label>
                    <input type="number" name="durasi_ontime_menit" min="0" defaultValue="30" className="w-full mt-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-violet-500" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6 border-t border-white/10 pt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Batal</Button>
                  <Button type="submit" disabled={loading} className="bg-violet-600 hover:bg-violet-700">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Simpan Sesi
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
