"use client"

import { useState } from "react"
import Link from "next/link"
import { MapPin, Mic, BarChart3, ChevronLeft, ChevronRight, Clock } from "lucide-react"

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
  totalActiveEventsUKM: number
}

export function TodayLatihanClient({ sessions, activeEventsCount, totalActiveEventsUKM }: TodayLatihanClientProps) {
  const [activeSessionIndex, setActiveSessionIndex] = useState(0)
  const activeSession = sessions[activeSessionIndex] ?? sessions[0]
  const hasMultipleSessions = sessions.length > 1

  const showPreviousSession = () => {
    setActiveSessionIndex((currentIndex) =>
      currentIndex === 0 ? sessions.length - 1 : currentIndex - 1
    )
  }

  const showNextSession = () => {
    setActiveSessionIndex((currentIndex) =>
      currentIndex === sessions.length - 1 ? 0 : currentIndex + 1
    )
  }

  return (
    <div className="space-y-8">
      {/* Section 1: Today's Sessions */}
      <div className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-300">Agenda prioritas</p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-white">Latihan Hari Ini</h2>
          </div>
          {hasMultipleSessions && (
            <p className="shrink-0 rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-100">
              {activeSessionIndex + 1}/{sessions.length}
            </p>
          )}
        </div>

        {sessions.length === 0 ? (
          <div className="liquid-card liquid-glow-blue border-dashed rounded-2xl p-12 flex items-center justify-center text-slate-500 text-sm">
            Tidak ada latihan untuk hari ini
          </div>
        ) : (
          <div className="liquid-card w-full rounded-2xl border-amber-300/30 bg-[radial-gradient(circle_at_0%_0%,rgba(251,191,36,0.22),transparent_34%),linear-gradient(135deg,rgba(63,38,8,0.72),rgba(22,12,33,0.72)_48%,rgba(5,6,10,0.54))] p-6 shadow-[0_22px_70px_rgba(245,158,11,0.18)] md:p-8">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/70 to-transparent" />
            <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-amber-300/10 blur-3xl" />
            <div className="absolute -bottom-20 left-10 h-52 w-52 rounded-full bg-violet-500/10 blur-3xl" />

            <div className="liquid-content relative space-y-6">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {/* Left Section - Title and Location */}
                <div className="space-y-4 md:col-span-1">
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-amber-200">
                      {activeSession.event.nama}
                    </p>
                    <p className="text-3xl font-black leading-tight text-white">
                      {activeSession.judul}
                    </p>
                  </div>
                  {activeSession.lokasi && (
                    <div className="flex items-center gap-2 text-slate-200">
                      <MapPin className="h-4 w-4 shrink-0 text-amber-300" />
                      <span className="text-sm font-semibold">{activeSession.lokasi}</span>
                    </div>
                  )}
                  
                  <div className="flex flex-col justify-center gap-3 md:col-span-1 mt-9">
                  <Link
                    href="/dashboard/presensi"
                    className="flex items-center justify-center gap-2 rounded-lg bg-amber-400 px-12 py-3 text-sm font-black text-slate-950 transition-all hover:bg-amber-300"
                  >
                    <Mic className="h-7 w-4" />
                    Presensi Sekarang
                  </Link>
                  <Link
                    href={`/dashboard/events/${activeSession.event.id}`}
                    className="flex items-center justify-center gap-2 rounded-lg border border-amber-200/40 px-12 py-3 text-sm font-bold text-white transition-all hover:border-amber-200 hover:bg-amber-300/10"
                  >
                    <BarChart3 className="h-7 w-4" />
                    Lihat Log Latihan
                  </Link>
                </div>
                </div>

                {/* Middle Section - Time Info */}
                <div className="grid grid-cols-1 gap-5 md:col-span-1">
                  <div className="flex flex-col rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-amber-200">
                      Waktu Mulai
                    </p>
                    <p className="flex text-6xl font-black text-white items-center justify-center">
                      {activeSession.waktuLabel.split(" - ")[0]}
                    </p>
                  </div>
                  <div className="flex flex-col rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-amber-200">
                      Jadwal
                    </p>
                    <p className="flex items-center gap-2 text-2xl font-black text-white justify-center">
                      <Clock className="h-5 w-5 text-amber-300" />
                      {activeSession.waktuLabel}
                    </p>
                  </div>
                </div>

                {/* Right Section - Action Buttons */}
                
              </div>

              {hasMultipleSessions && (
                <div className="flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    {sessions.map((session, index) => (
                      <button
                        key={session.id}
                        type="button"
                        aria-label={`Tampilkan agenda ${index + 1}`}
                        onClick={() => setActiveSessionIndex(index)}
                        className={`h-2.5 rounded-full transition-all ${
                          index === activeSessionIndex
                            ? "w-8 bg-amber-300"
                            : "w-2.5 bg-white/25 hover:bg-white/45"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:flex">
                    <button
                      type="button"
                      onClick={showPreviousSession}
                      className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white transition-all hover:border-amber-200/50 hover:bg-amber-300/10"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Sebelumnya
                    </button>
                    <button
                      type="button"
                      onClick={showNextSession}
                      className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white transition-all hover:border-amber-200/50 hover:bg-amber-300/10"
                    >
                      Berikutnya
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Events Count - Member's Events */}
        <Link href="/dashboard/anggota/events" className="liquid-card liquid-tint-emerald liquid-glow-emerald rounded-2xl p-8 relative overflow-hidden group">
          <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all duration-500" />
          <div className="relative flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-emerald-500/30 to-emerald-600/20 border border-emerald-400/40 flex items-center justify-center mb-4 group-hover:from-emerald-500/40 transition-all">
              <BarChart3 className="w-6 h-6 text-emerald-200" />
            </div>
            <p className="text-xs font-bold text-emerald-300 uppercase tracking-widest mb-2">Event Aktif</p>
            <p className="text-5xl font-black text-white mb-1">{activeEventsCount}</p>
            <p className="text-xs text-slate-400">event yang Anda ikuti</p>
          </div>
        </Link>

        {/* Total UKM Events */}
        <div className="liquid-card liquid-tint-cyan liquid-glow-cyan rounded-2xl p-8 relative overflow-hidden group">
          <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all duration-500" />
          <div className="relative flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500/30 to-blue-600/20 border border-blue-400/40 flex items-center justify-center mb-4 group-hover:from-blue-500/40 transition-all">
              <BarChart3 className="w-6 h-6 text-blue-200" />
            </div>
            <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-2">Event UKM</p>
            <p className="text-5xl font-black text-white mb-1">{totalActiveEventsUKM}</p>
            <p className="text-xs text-slate-400">total event aktif</p>
          </div>
        </div>
      </div>
    </div>
  )
}
