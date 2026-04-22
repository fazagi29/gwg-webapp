"use client"

import { useState } from "react"
import { MapPin, ArrowRight, CalendarDays } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { EditEventDialog, DeleteEventDialog } from "./edit-delete-dialog"

const KATEGORI_LIST = ["Semua", "Konser", "Lomba", "Internal", "Lainnya"]

const KATEGORI_COLORS: Record<string, string> = {
  Konser: "bg-violet-500/90",
  Lomba: "bg-rose-500/90",
  Internal: "bg-blue-500/90",
  Lainnya: "bg-slate-500/90",
}

interface EventsClientProps {
  events: (import('@prisma/client').Event & { _count?: { sesi_latihan: number; members: number } })[]
  isAdmin: boolean
}

export function EventsClient({ events, isAdmin }: EventsClientProps) {
  const [activeKategori, setActiveKategori] = useState("Semua")
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const filteredEvents = activeKategori === "Semua"
    ? events
    : events.filter((e) => (e.kategori || "Lainnya") === activeKategori)

  return (
    <>
      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {KATEGORI_LIST.map((kat) => (
          <button
            key={kat}
            onClick={() => setActiveKategori(kat)}
            className={`px-5 py-2 text-sm rounded-full transition-all font-medium ${activeKategori === kat
              ? "bg-violet-600 text-white shadow-[0_0_12px_rgba(124,58,237,0.4)]"
              : "bg-[#ffffff0a] border border-[#ffffff1a] hover:bg-[#ffffff1a] text-slate-300"
              }`}
          >
            {kat}
          </button>
        ))}
      </div>

      {/* Event List — Responsive Grid layout */}
      {filteredEvents.length === 0 ? (
        <div className="mt-6 py-20 text-center text-slate-500 border border-dashed border-white/10 rounded-3xl">
          Tidak ada event untuk kategori ini.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
          {filteredEvents.map((event) => {
            const kategoriLabel = event.kategori || "Lainnya"
            const badgeColor = KATEGORI_COLORS[kategoriLabel] || "bg-slate-500/90"
            const isHovered = hoveredId === event.id

            return (
              <div
                key={event.id}
                onMouseEnter={() => setHoveredId(event.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  transform: isHovered ? "scale(1.08)" : "scale(1)",
                  transition: "transform 0.45s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
                  zIndex: isHovered ? 10 : 0,
                }}
                className={`relative rounded-3xl overflow-hidden border cursor-pointer h-80 flex flex-col
                  ${isHovered
                    ? "border-violet-400/40 shadow-[0_0_40px_rgba(124,58,237,0.3)]"
                    : "border-[#ffffff12] hover:border-violet-500/20"
                  }
                `}
              >
                {/* Solid color background */}
                <div className="absolute inset-0 bg-linear-to-br from-violet-600 to-violet-900">
                  {/* Gradient overlay — dark default, purple on hover */}
                  <div className={`absolute inset-0 transition-colors duration-400 ${isHovered
                    ? "bg-linear-to-br from-violet-900/90 via-violet-800/85 to-violet-950/90"
                    : "bg-linear-to-b from-[#0a0a10]/80 to-[#0f0f18]/95"
                    }`} />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full p-5">
                  {/* Top badges */}
                  <div className="flex items-start justify-between mb-auto">
                    <div className="flex flex-col gap-1.5">
                      <span className={`${badgeColor} backdrop-blur-sm px-2.5 py-1 rounded-full text-[9px] font-bold tracking-widest text-white uppercase w-fit`}>
                        {kategoriLabel}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase w-fit backdrop-blur-sm ${event.status === "aktif" ? "bg-emerald-500/80 text-white"
                        : event.status === "selesai" ? "bg-slate-500/80 text-white"
                          : "bg-amber-500/80 text-white"
                        }`}>
                        {event.status}
                      </span>
                    </div>

                    {/* Admin controls */}
                    {isAdmin && (
                      <div className={`flex gap-1 transition-opacity ${isHovered ? "opacity-100" : "opacity-0"}`}>
                        <EditEventDialog event={event} />
                        <DeleteEventDialog event={event} />
                      </div>
                    )}
                  </div>

                  {/* Title — always visible, rotated when collapsed */}
                  <div className="mt-8 mb-4">
                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 transition-colors ${isHovered ? "text-violet-200" : "text-violet-400"}`}>
                      {event.tanggal_pentas ? format(new Date(event.tanggal_pentas), "dd MMM yyyy") : "TBA"}
                    </p>
                    <h3 className={`font-extrabold leading-tight transition-all ${isHovered ? "text-2xl text-white" : "text-lg text-white/90"
                      }`}>
                      {/* Collapsed: title truncated vertically */}
                      <span className={isHovered ? "" : "line-clamp-4"}>
                        {event.nama}
                      </span>
                    </h3>
                  </div>

                  {/* Expanded content — only visible when hovered */}
                  <div className={`space-y-3 transition-all duration-300 ${isHovered ? "opacity-100 max-h-60" : "opacity-0 max-h-0 overflow-hidden"}`}>
                    {event.deskripsi && (
                      <p className="text-xs text-violet-100/70 leading-relaxed line-clamp-2">
                        {event.deskripsi}
                      </p>
                    )}

                    <div className="flex flex-col gap-1.5 text-[10px] text-violet-200/70 font-medium">
                      {event.lokasi && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{event.lokasi}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" />
                          {event._count?.sesi_latihan ?? 0} Sesi
                        </span>
                        <span>👥 {event._count?.members ?? 0} Singers</span>
                      </span>
                    </div>

                    {/* Lihat Detail button — warna kontras dari bg ungu */}
                    <Link
                      href={`/dashboard/events/${event.id}`}
                      className="flex items-center justify-center gap-2 mt-2 py-2.5 px-4 rounded-xl bg-white text-violet-900 text-xs font-extrabold hover:bg-violet-50 transition-colors shadow-lg"
                    >
                      Lihat Detail <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* Collapsed visual hint */}
                  {!isHovered && (
                    <div className="mt-4 flex items-center gap-1 text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                      <MapPin className="w-2.5 h-2.5" />
                      <span className="truncate">{event.lokasi || "Lokasi TBA"}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
