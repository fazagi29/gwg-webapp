"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Clock, MapPin, Mic, BarChart3 } from "lucide-react"

interface TodaySession {
  id: string
  judul: string
  waktuLabel: string
  lokasi: string | null
  event: {
    id: string
    nama: string
  }
}

interface TodayLatihanClientProps {
  sessions: TodaySession[]
  activeEventsCount: number
}

export function TodayLatihanClient({ sessions, activeEventsCount }: TodayLatihanClientProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(sessions.length > 1)

  const checkScroll = useCallback(() => {
    if (!scrollContainerRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }, [])

  const scroll = useCallback((direction: "left" | "right") => {
    if (!scrollContainerRef.current) return
    const scrollAmount = 400
    const newScrollLeft = direction === "left"
      ? scrollContainerRef.current.scrollLeft - scrollAmount
      : scrollContainerRef.current.scrollLeft + scrollAmount

    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    })

    setTimeout(checkScroll, 300)
  }, [checkScroll])

  useEffect(() => {
    checkScroll()
    window.addEventListener("resize", checkScroll)
    return () => window.removeEventListener("resize", checkScroll)
  }, [checkScroll])

  return (
    <div className="space-y-8">
      {/* Section 1: Today's Sessions + Active Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Latihan - 2 columns */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold tracking-tight text-white">Latihan Hari Ini</h2>
            {sessions.length > 1 && (
              <div className="flex gap-2">
                <button
                  onClick={() => scroll("left")}
                  disabled={!canScrollLeft}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all text-slate-400 hover:text-white"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scroll("right")}
                  disabled={!canScrollRight}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all text-slate-400 hover:text-white"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {sessions.length === 0 ? (
            <div className="liquid-card liquid-glow-blue border-dashed rounded-2xl p-12 flex items-center justify-center text-slate-500 text-sm">
              Tidak ada latihan untuk hari ini
            </div>
          ) : (
            <div
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-auto scroll-smooth pb-2"
              style={{
                scrollBehavior: "smooth",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="liquid-card liquid-glow-violet flex-shrink-0 w-96 rounded-2xl p-6 group cursor-pointer"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div>
                      <p className="text-xs font-bold text-violet-300 uppercase tracking-widest mb-1">
                        {session.event.nama}
                      </p>
                      <p className="text-xl font-bold text-white truncate">{session.judul}</p>
                    </div>

                    {/* Time & Location */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Clock className="w-4 h-4 text-violet-400" />
                        <span className="text-sm font-medium">
                          {session.waktuLabel}
                        </span>
                      </div>
                      {session.lokasi && (
                        <div className="flex items-center gap-2 text-slate-300">
                          <MapPin className="w-4 h-4 text-violet-400" />
                          <span className="text-sm font-medium truncate">{session.lokasi}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Link
                        href={`/dashboard/events/${session.event.id}`}
                        className="flex-1 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <BarChart3 className="w-3 h-3" />
                        Lihat Log
                      </Link>
                      <Link
                        href={`/dashboard/presensi`}
                        className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <Mic className="w-3 h-3" />
                        Presensi
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {sessions.length > 0 && (
            <p className="text-xs text-slate-500 font-medium">
              Menampilkan {sessions.length} latihan
            </p>
          )}
        </div>

        {/* Active Events Count - 1 column */}
        <Link href="/dashboard/anggota/events" className="liquid-card liquid-tint-emerald liquid-glow-emerald rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all hover:border-emerald-300/60">
          <div className="w-12 h-12 rounded-xl bg-emerald-600/40 border border-emerald-500/30 flex items-center justify-center mb-4">
            <BarChart3 className="w-6 h-6 text-emerald-300" />
          </div>
          <p className="text-xs font-bold text-emerald-300 uppercase tracking-widest mb-2">Event Aktif</p>
          <p className="text-5xl font-black text-white mb-1">{activeEventsCount}</p>
          <p className="text-xs text-slate-400">event yang Anda ikuti</p>
        </Link>
      </div>
    </div>
  )
}
