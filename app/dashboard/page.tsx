import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card } from "@/components/ui/card"
import { Users, CalendarDays, Sparkles, MapPin, Clock } from "lucide-react"
import { InfoBoardPopup } from "@/components/dashboard/info-board-popup"
import { TodayLatihanClient } from "./today-latihan-client"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"

export default async function DashboardPage() {
  const session = await auth()
  const isAdmin = session?.user?.role === "admin"
  const userId = session?.user?.id as string

  // Metrics - different based on role
  const totalAnggota = await prisma.user.count({ where: { role: "anggota", is_active: true } })
  
  // Total active events in organization
  const totalActiveEventsUKM = await prisma.event.count({ where: { status: { in: ["persiapan", "aktif"] } } })
  
  const activeEvents = isAdmin 
    ? totalActiveEventsUKM
    : await prisma.event.count({
        where: {
          status: { in: ["persiapan", "aktif"] },
          members: {
            some: { user_id: userId }
          }
        }
      })

  // Agenda mendatang: sesi latihan + event yang belum lewat
  const sesiMendatang = await prisma.sesiLatihan.findMany({
    where: { waktu_mulai: { gte: new Date() } },
    orderBy: { waktu_mulai: "asc" },
    take: 6,
    include: { event: true },
  })

  // For members: fetch today's sessions
  type TodaySessionType = {
    id: string
    judul: string
    waktuLabel: string
    lokasi: string | null
    event: {
      id: string
      nama: string
    }
  }

  let todaySessionsForMember: TodaySessionType[] = []
  if (!isAdmin) {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    // Get events user is part of
    const userEvents = await prisma.eventMember.findMany({
      where: { user_id: userId },
      select: { event_id: true }
    })
    const eventIds = userEvents.map(e => e.event_id)

    // Get sessions for those events today
    const rawSessions = await prisma.sesiLatihan.findMany({
      where: {
        event_id: { in: eventIds },
        waktu_mulai: {
          gte: startOfDay,
          lt: endOfDay
        }
      },
      orderBy: { waktu_mulai: "asc" },
      include: { event: true }
    })

    todaySessionsForMember = rawSessions.map(sesi => ({
      id: sesi.id,
      judul: sesi.judul,
      waktuLabel: `${format(sesi.waktu_mulai, "HH:mm")} - ${format(sesi.waktu_selesai, "HH:mm")}`,
      lokasi: sesi.lokasi,
      event: {
        id: sesi.event.id,
        nama: sesi.event.nama
      }
    }))
  }

  // Recent activity (1 bulan terakhir)
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

  const recentAbsensi = await prisma.absensi.findMany({
    where: { waktu_absen: { gte: oneMonthAgo } },
    orderBy: { waktu_absen: "desc" },
    take: 30,
    include: { user: true, sesi: { include: { event: true } } },
  })

  // Mock pengumuman (akan diganti dengan model database kelak)
  const pengumuman = [
    { id: "1", judul: "Informasi Kostum", isi: "Fitting kostum untuk konser tahunan dijadwalkan hari Sabtu pukul 10.00 di Ruang Seni.", waktu: "2J yang lalu" },
    { id: "2", judul: "Partitur Baru", isi: "Partitur 'O Fortuna' aransemen terbaru sudah diunggah di katalog. Harap dipelajari sebelum latihan.", waktu: "Kemarin" },
    { id: "3", judul: "Rapat Pengurus", isi: "Evaluasi bulanan kinerja divisi teknis dan vokal. Hadir semua koordinator.", waktu: "3 Hari lalu" },
    { id: "4", judul: "Jadwal Gladi Resik", isi: "Gladi resik penuh dilakukan H-1 sebelum pentas. Semua anggota wajib hadir.", waktu: "1 Minggu lalu" },
  ]

  const dt = new Date()
  const dateStr = dt.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).toUpperCase()

  const userName = session?.user?.name || "Pengurus"

  return (
    <div className="liquid-rise space-y-10 max-w-7xl mx-auto pb-24 font-sans text-white animate-fade-in">

      {/* Header */}
      <div className="pt-4">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-3 leading-tight bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
          Halo, {userName}
        </h1>
        <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
          {dateStr}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">

        {/* Left Column */}
        <div className="lg:col-span-2 space-y-10">

          {/* ADMIN VIEW */}
          {isAdmin && (
            <>
              {/* Section 1: 3 stat cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Anggota Aktif */}
                <div className="liquid-card liquid-tint-violet liquid-glow-violet rounded-[2rem] p-8 relative overflow-hidden group">
                  <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-violet-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-violet-500/5 rounded-full blur-3xl group-hover:bg-violet-500/10 transition-all duration-500" />
                  <div className="absolute -top-10 -right-10 text-[#ffffff05] text-[120px] font-black pointer-events-none select-none leading-none">
                    {totalAnggota}
                  </div>
                  <div className="liquid-content relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/30 to-violet-600/20 border border-violet-400/40 flex items-center justify-center mb-4 group-hover:from-violet-500/40 transition-all">
                      <Users className="w-5 h-5 text-violet-200" />
                    </div>
                    <p className="text-[10px] font-bold text-violet-300 uppercase tracking-widest mb-2 letter-spacing">Anggota Aktif</p>
                    <p className="text-5xl font-black text-white">{totalAnggota}</p>
                    <p className="text-xs text-slate-400 mt-2">total penyanyi terdaftar</p>
                  </div>
                </div>

                {/* Event Aktif (Member) */}
                <div className="liquid-card liquid-tint-cyan liquid-glow-cyan rounded-[2rem] p-8 relative overflow-hidden group">
                  <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all duration-500" />
                  <div className="absolute -top-10 -right-10 text-[#ffffff05] text-[120px] font-black pointer-events-none select-none leading-none">
                    {activeEvents}
                  </div>
                  <div className="liquid-content relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-600/20 border border-blue-400/40 flex items-center justify-center mb-4 group-hover:from-blue-500/40 transition-all">
                      <CalendarDays className="w-5 h-5 text-blue-200" />
                    </div>
                    <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mb-2">Event Aktif</p>
                    <p className="text-5xl font-black text-white">{activeEvents}</p>
                    <p className="text-xs text-slate-400 mt-2">dalam organisasi</p>
                  </div>
                </div>

                {/* Event Aktif UKM (Total) */}
                <div className="liquid-card liquid-tint-emerald liquid-glow-emerald rounded-[2rem] p-8 relative overflow-hidden group">
                  <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all duration-500" />
                  <div className="absolute -top-10 -right-10 text-[#ffffff05] text-[120px] font-black pointer-events-none select-none leading-none">
                    {totalActiveEventsUKM}
                  </div>
                  <div className="liquid-content relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 border border-emerald-400/40 flex items-center justify-center mb-4 group-hover:from-emerald-500/40 transition-all">
                      <Sparkles className="w-5 h-5 text-emerald-200" />
                    </div>
                    <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest mb-2">Event UKM</p>
                    <p className="text-5xl font-black text-white">{totalActiveEventsUKM}</p>
                    <p className="text-xs text-slate-400 mt-2">total event aktif</p>
                  </div>
                </div>
              </div>

                {/* Section 2: Agenda Mendatang */}
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight text-white">Agenda Mendatang</h3>
                    <p className="text-xs text-slate-500 mt-1">Jadwal latihan dan acara yang akan datang</p>
                  </div>
                  <Link href="/dashboard/events" className="text-xs font-bold text-violet-300 hover:text-violet-200 transition-all bg-violet-500/10 hover:bg-violet-500/20 px-4 py-2 rounded-lg uppercase tracking-widest border border-violet-500/20 hover:border-violet-500/40">
                    Lihat Semua →
                  </Link>
                </div>

                {sesiMendatang.length === 0 ? (
                  <div className="liquid-card border-dashed rounded-[2rem] p-12 flex items-center justify-center text-slate-500 text-sm">
                    Belum ada agenda latihan mendatang.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sesiMendatang.map((sesi) => {
                      const tgl = new Date(sesi.waktu_mulai)
                      const isToday = tgl.toDateString() === new Date().toDateString()
                      const isTomorrow = (() => {
                        const tmr = new Date(); tmr.setDate(tmr.getDate() + 1)
                        return tgl.toDateString() === tmr.toDateString()
                      })()

                      const label = isToday ? "HARI INI" : isTomorrow ? "BESOK" : format(tgl, "dd MMM", { locale: localeId })

                      return (
                        <a
                          key={sesi.id}
                          href={`/dashboard/events/${sesi.event_id}`}
                          className="liquid-card liquid-glow-violet group flex items-center gap-4 p-4 rounded-xl transition-all hover:gap-5"
                        >
                          <div className="liquid-content w-16 h-16 rounded-lg bg-gradient-to-br from-violet-500/30 to-violet-600/20 border border-violet-400/40 flex flex-col items-center justify-center shrink-0 group-hover:from-violet-500/40 group-hover:to-violet-600/30 transition-all">
                            <span className="text-[7px] font-bold text-violet-300 uppercase tracking-wider">{label}</span>
                            <span className="text-base font-bold text-white group-hover:text-violet-200 transition-colors">{format(tgl, "HH:mm")}</span>
                          </div>
                          <div className="liquid-content flex-1 min-w-0">
                            <p className="font-bold text-white text-sm truncate group-hover:text-violet-200 transition-colors">{sesi.judul}</p>
                            <p className="text-[10px] text-slate-400 font-medium mt-1 truncate">{sesi.event?.nama}</p>
                            {sesi.lokasi && (
                              <p className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-1.5 truncate">
                                <MapPin className="w-3 h-3 flex-shrink-0" /><span>{sesi.lokasi}</span>
                              </p>
                            )}
                          </div>
                          <div className="liquid-content shrink-0 text-slate-500 opacity-60 group-hover:opacity-100 transition-opacity">
                            <Clock className="w-4 h-4" />
                          </div>
                        </a>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {/* MEMBER VIEW */}
          {!isAdmin && (
            <TodayLatihanClient 
              sessions={todaySessionsForMember}
              activeEventsCount={activeEvents}
              totalActiveEventsUKM={totalActiveEventsUKM}
            />
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">

          {/* Pengumuman */}
          <Card className="liquid-card liquid-glow-rose rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-rose-500/5 rounded-full blur-3xl group-hover:bg-rose-500/10 transition-all duration-500" />
            <div className="absolute -bottom-10 -right-10 text-[#ffffff04] tracking-tighter text-7xl font-black pointer-events-none select-none z-0">
              📢
            </div>

            <h3 className="text-xs font-bold tracking-widest uppercase text-slate-400 mb-5 relative z-10">Pengumuman Terkini</h3>

            <div className="space-y-4 relative z-10">
              {pengumuman.slice(0, 3).map((p, i) => (
                <div key={p.id} className="group/item">
                  <div className="flex items-start justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">{p.judul}</span>
                    <span className="text-[9px] text-slate-500 font-semibold">{p.waktu}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-200 line-clamp-2 group-hover/item:text-slate-100 transition-colors">{p.isi}</p>
                  {i < 2 && <div className="h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent w-full mt-4" />}
                </div>
              ))}
            </div>

            {/* Popup trigger */}
            <InfoBoardPopup pengumuman={pengumuman} />
          </Card>

          {/* Aktivitas Terkini */}
          <Card className="liquid-card liquid-glow-blue rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute -top-16 -left-16 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all duration-500" />
            <h3 className="text-xs font-bold tracking-widest uppercase text-slate-400 mb-5 relative z-10">Aktivitas Terkini</h3>

            {/* Scrollable container */}
            <div className="max-h-80 overflow-y-auto pr-1.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
              <div className="relative border-l border-slate-700/50 ml-3 space-y-5 pb-4">
                {recentAbsensi.length === 0 ? (
                  <p className="pl-6 text-sm text-slate-500">Belum ada aktivitas dalam 30 hari terakhir.</p>
                ) : (
                  recentAbsensi.map((absen, i) => {
                    const isRecent = i === 0
                    const waktuStr = format(new Date(absen.waktu_absen), "dd MMM, HH:mm")
                    const statusColor =
                      absen.status === "hadir" ? "text-emerald-400 bg-emerald-500/10" :
                      absen.status === "terlambat" ? "text-amber-400 bg-amber-500/10" :
                      "text-slate-400 bg-slate-500/10"
                    const dotColor =
                      absen.status === "hadir" ? "bg-emerald-400" :
                      absen.status === "terlambat" ? "bg-amber-400" :
                      "bg-slate-500"
                    return (
                      <div key={absen.id} className="relative pl-6 group/activity">
                        <div className={`absolute w-2 h-2 rounded-full -left-[4.25px] top-2.5 border-2 border-slate-900 ${dotColor} ${isRecent ? "shadow-[0_0_10px_rgba(167,139,250,0.6)] animate-pulse" : ""}`} />
                        <p className="text-[9px] text-slate-500 font-semibold tracking-wide uppercase mb-0.5">{waktuStr}</p>
                        <p className="text-sm font-medium text-slate-200 leading-tight group-hover/activity:text-slate-100 transition-colors">
                          <span className="text-white font-semibold">{absen.user?.nama}</span>
                          {" "}<span className="text-slate-400">tercatat</span>{" "}
                          <span className={`font-bold text-xs px-2 py-0.5 rounded ${statusColor}`}>{absen.status}</span>
                          {" "}<span className="text-slate-400">di</span>{" "}
                          <span className="text-slate-300 font-medium">{absen.sesi?.judul}</span>
                        </p>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
