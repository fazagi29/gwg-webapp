"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { updateAdminAbsensi } from "@/app/actions/sesi"
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from "lucide-react"

// ─────────────────────────────────────────────
// AbsenSelectAction — dropdown CRUD status kehadiran
// ─────────────────────────────────────────────
export function AbsenSelectAction({
  sesiId,
  userId,
  eventId,
  currentStatus,
}: {
  sesiId: string
  userId: string
  eventId: string
  currentStatus: string | null
}) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value
    startTransition(async () => {
      await updateAdminAbsensi(sesiId, userId, value, eventId)
      router.refresh()
    })
  }

  const styles: Record<string, string> = {
    hadir: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    terlambat: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    izin: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    alpha: "bg-red-500/20 text-red-500 border-red-500/30",
  }

  const currentStyle = currentStatus ? (styles[currentStatus] || styles.alpha) : styles.alpha

  return (
    <div className="relative">
      {isPending && <Loader2 className="absolute -left-6 top-2 h-3.5 w-3.5 animate-spin text-violet-400" />}
      <select
        value={currentStatus || "alpha"}
        onChange={handleChange}
        disabled={isPending}
        className={`text-xs px-3 py-1.5 rounded-lg border outline-none cursor-pointer appearance-none ${currentStyle} min-w-[120px] text-center disabled:opacity-50 transition-all`}
      >
        <option value="alpha" className="bg-slate-900 text-red-500">Alpha</option>
        <option value="hadir" className="bg-slate-900 text-emerald-400">Hadir</option>
        <option value="terlambat" className="bg-slate-900 text-amber-400">Terlambat</option>
        <option value="izin" className="bg-slate-900 text-blue-400">Izin</option>
      </select>
    </div>
  )
}

// ─────────────────────────────────────────────
// AbsenKelola — Tabel dengan search + sort
// ─────────────────────────────────────────────
interface AbsenKelolaProps {
  members: (import('@prisma/client').EventMember & { user: import('@prisma/client').User })[]
  absensiMap: Record<string, { status?: string }>
  sesiId: string
  eventId: string
  totalMembers: number
  q: string
  sort: string
  order: string
}

export function AbsenKelola({
  members,
  absensiMap,
  sesiId,
  eventId,
  totalMembers,
  q: initialQ,
  sort: initialSort,
  order: initialOrder,
}: AbsenKelolaProps) {
  const router = useRouter()
  const [q, setQ] = useState(initialQ)
  const [sort, setSort] = useState(initialSort)
  const [order, setOrder] = useState(initialOrder)

  function buildUrl(newSort?: string, newOrder?: string, newQ?: string) {
    const params = new URLSearchParams()
    const qs = newQ ?? q
    const s = newSort ?? sort
    const o = newOrder ?? order
    if (qs) params.set("q", qs)
    if (s) params.set("sort", s)
    if (o) params.set("order", o)
    return `?${params.toString()}`
  }

  function handleSort(col: string) {
    const newOrder = sort === col && order === "asc" ? "desc" : "asc"
    setSort(col)
    setOrder(newOrder)
    router.push(buildUrl(col, newOrder))
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    router.push(buildUrl(sort, order, q))
  }

  const renderSortIcon = (col: string) => {
    if (sort !== col) return <ArrowUpDown className="h-3 w-3 ml-1 text-slate-600" />
    return order === "asc"
      ? <ArrowUp className="h-3 w-3 ml-1 text-violet-400" />
      : <ArrowDown className="h-3 w-3 ml-1 text-violet-400" />
  }

  const VOICE_COLORS: Record<string, string> = {
    Soprano: "text-rose-400", sopran: "text-rose-400",
    Alto: "text-amber-400", alto: "text-amber-400",
    Tenor: "text-blue-400", tenor: "text-blue-400",
    Bass: "text-emerald-400", bass: "text-emerald-400",
  }

  return (
    <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl overflow-hidden">
      <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-white font-bold text-lg">Daftar Kehadiran Singers</h2>
          <p className="text-slate-400 text-sm">Admin dapat mengubah status kehadiran langsung dari tabel ini.</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            type="text"
            placeholder="Cari nama singer..."
            className="bg-black/20 border border-white/10 rounded-full pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors w-full md:w-64"
          />
        </form>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/5 text-slate-400 text-xs uppercase border-b border-white/5">
            <tr>
              <th className="px-6 py-4 font-medium">
                <button
                  onClick={() => handleSort("nama")}
                  className="flex items-center hover:text-white transition-colors"
                >
                  Nama Anggota {renderSortIcon("nama")}
                </button>
              </th>
              <th className="px-6 py-4 font-medium">
                <button
                  onClick={() => handleSort("suara")}
                  className="flex items-center hover:text-white transition-colors"
                >
                  Golongan Suara {renderSortIcon("suara")}
                </button>
              </th>
              <th className="px-6 py-4 font-medium text-right">
                <button
                  onClick={() => handleSort("status")}
                  className="flex items-center ml-auto hover:text-white transition-colors"
                >
                  Status Kehadiran {renderSortIcon("status")}
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {members.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-slate-500">
                  Tidak ada data yang ditemukan.
                </td>
              </tr>
            ) : (
              members.map((member) => {
                const absen = absensiMap[member.user_id]
                const status = absen?.status || "alpha"
                const voiceColor = VOICE_COLORS[member.user.bagian_suara || ""] || "text-slate-400"

                return (
                  <tr key={member.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-500 to-blue-500 p-[1.5px] shrink-0">
                          <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-xs font-bold text-white">
                            {member.user.nama?.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        {member.user.nama}
                      </div>
                    </td>
                    <td className={`px-6 py-4 capitalize font-medium ${voiceColor}`}>
                      {member.user.bagian_suara || "—"}
                    </td>
                    <td className="px-6 py-4 flex justify-end">
                      <AbsenSelectAction
                        sesiId={sesiId}
                        userId={member.user_id}
                        eventId={eventId}
                        currentStatus={status}
                      />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3 border-t border-white/5 text-xs text-slate-500">
        Menampilkan {members.length} dari {totalMembers} anggota
      </div>
    </div>
  )
}
