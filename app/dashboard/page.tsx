import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card } from "@/components/ui/card"
import { Users, CalendarDays, MapPin, Clock } from "lucide-react"
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
  const activeEvents = isAdmin 
    ? await prisma.event.count({ where: { status: { in: ["persiapan", "aktif"] } } })
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
    <div className="liquid-rise space-y-10 max-w-7xl mx-auto pb-24 font-sans text-white">

      {/* Header */}
      <div>
        <h1 className="text-4xl md:text-5xl font-normal tracking-tight text-white mb-2 leading-tight">
          Halo, <span className="font-semibold">{userName}.</span>
        </h1>
        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
          {dateStr}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">

        {/* Left Column */}
        <div className="lg:col-span-2 space-y-10">

          {/* ADMIN VIEW */}
          {isAdmin && (
            <>
              {/* Section 1: 2 stat cards */}
              <div className="grid grid-cols-2 gap-6">

                {/* Anggota Aktif */}
                <div className="liquid-card liquid-tint-violet liquid-glow-violet rounded-[2rem] p-8 relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 text-[#ffffff05] text-[120px] font-black pointer-events-none select-none leading-none">
                    {totalAnggota}
                  </div>
                  <div className="liquid-content">
                    <div className="w-10 h-10 rounded-xl bg-violet-600/30 border border-violet-500/30 flex items-center justify-center mb-4">
                      <Users className="w-5 h-5 text-violet-300" />
                    </div>
                    <p className="text-[10px] font-bold text-violet-300 uppercase tracking-widest mb-2">Anggota Aktif</p>
                    <p className="text-5xl font-black text-white">{totalAnggota}</p>
                    <p className="text-xs text-slate-400 mt-2">total penyanyi terdaftar</p>
                  </div>
                </div>

                {/* Event/Agenda Aktif */}
                <div className="liquid-card liquid-tint-cyan liquid-glow-cyan rounded-[2rem] p-8 relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 text-[#ffffff05] text-[120px] font-black pointer-events-none select-none leading-none">
                    {activeEvents}
                  </div>
                  <div className="liquid-content">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/30 flex items-center justify-center mb-4">
                      <CalendarDays className="w-5 h-5 text-blue-300" />
                    </div>
                    <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mb-2">Event Aktif</p>
                    <p className="text-5xl font-black text-white">{activeEvents}</p>
                    <p className="text-xs text-slate-400 mt-2">agenda dalam persiapan</p>
                  </div>
                </div>
              </div>

              {/* Section 2: Agenda Mendatang */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-extrabold tracking-tight">Agenda Mendatang</h3>
                  <Link href="/dashboard/events" className="text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors uppercase tracking-widest">
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
                          className="liquid-card liquid-glow-violet flex items-center gap-4 p-4 rounded-2xl transition-all group"
                        >
                          <div className="liquid-content w-14 h-14 rounded-xl bg-violet-900/40 border border-violet-500/20 flex flex-col items-center justify-center shrink-0">
                            <span className="text-[8px] font-bold text-violet-400 uppercase tracking-widest">{label}</span>
                            <span className="text-lg font-black text-white">{format(tgl, "HH:mm")}</span>
                          </div>
                          <div className="liquid-content flex-1 min-w-0">
                            <p className="font-bold text-white text-sm truncate group-hover:text-violet-300 transition-colors">{sesi.judul}</p>
                            <p className="text-[10px] text-slate-500 font-medium mt-0.5 truncate">{sesi.event?.nama}</p>
                            {sesi.lokasi && (
                              <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-2.5 h-2.5" />{sesi.lokasi}
                              </p>
                            )}
                          </div>
                          <div className="liquid-content shrink-0 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            <Clock className="w-3.5 h-3.5 text-slate-600" />
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
            />
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">

          {/* Pengumuman */}
          <Card className="liquid-card liquid-glow-rose rounded-[2rem] p-6 relative overflow-hidden">
            <div className="absolute -bottom-10 -right-10 text-[#ffffff05] tracking-tighter text-8xl font-black pointer-events-none select-none z-0">
              INFO
            </div>

            <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-slate-400 mb-6 relative z-10">Pengumuman Terkini</h3>

            <div className="space-y-5 relative z-10">
              {pengumuman.slice(0, 3).map((p, i) => (
                <div key={p.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">{p.judul}</span>
                    <span className="text-[9px] text-slate-500 font-bold">{p.waktu}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-200 line-clamp-2">{p.isi}</p>
                  {i < 2 && <div className="h-px bg-linear-to-r from-[#ffffff1a] to-transparent w-full mt-5" />}
                </div>
              ))}
            </div>

            {/* Popup trigger */}
            <InfoBoardPopup pengumuman={pengumuman} />
          </Card>

          {/* Aktivitas Terkini — scrollable, 1 bulan */}
          <Card className="liquid-card liquid-glow-blue rounded-[2.5rem] p-6">
            <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-slate-400 mb-6">Aktivitas Terkini</h3>

            {/* Scrollable container */}
            <div className="max-h-80 overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
              <div className="relative border-l border-[#ffffff1a] ml-2 space-y-6 pb-4">
                {recentAbsensi.length === 0 ? (
                  <p className="pl-6 text-sm text-slate-500">Belum ada aktivitas dalam 30 hari terakhir.</p>
                ) : (
                  recentAbsensi.map((absen, i) => {
                    const isRecent = i === 0
                    const waktuStr = format(new Date(absen.waktu_absen), "dd MMM, HH:mm")
                    const statusColor =
                      absen.status === "hadir" ? "text-emerald-400" :
                      absen.status === "terlambat" ? "text-amber-400" :
                      "text-slate-400"
                    return (
                      <div key={absen.id} className="relative pl-6">
                        <div className={`absolute w-2.5 h-2.5 rounded-full -left-[5.5px] top-1 border-2 border-[#171421] ${isRecent ? "bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)] animate-pulse" : "bg-slate-600"}`} />
                        <p className="text-[9px] text-slate-500 font-bold tracking-widest uppercase mb-0.5">{waktuStr}</p>
                        <p className="text-sm font-medium text-slate-200 leading-tight">
                          <span className="text-white font-semibold">{absen.user?.nama}</span>
                          {" "}tercatat{" "}
                          <span className={`font-bold ${statusColor}`}>{absen.status}</span>
                          {" "}di{" "}
                          <span className="text-slate-300">{absen.sesi?.judul}</span>
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
