import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { CalendarDays, MapPin, Users, Clock, Tag } from "lucide-react"
import { format } from "date-fns"
import {
  CreateSesiDialog,
  BukaAbsenButton,
  AbsenInput,
  SectionEditor,
  SingersPanel,
} from "./client-actions"
import { Badge } from "@/components/ui/badge"
import { CheckCircle } from "lucide-react"

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const eventId = resolvedParams.id

  const session = await auth()
  const isAdmin = session?.user?.role === "admin"
  const userId = session?.user?.id as string

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      members: {
        include: { user: true },
        orderBy: { joined_at: "asc" },
      },
      sesi_latihan: {
        orderBy: { waktu_mulai: "asc" },
        include: { absensi: true },
      },
    },
  })

  if (!event) return notFound()

  const isMember = event.members.some((m) => m.user_id === userId)
  const isActiveUkmEvent = event.status === "persiapan" || event.status === "aktif"
  const canViewTrainingDetail = isAdmin || isMember
  if (!isAdmin && !isMember && !isActiveUkmEvent) return notFound()

  let availableUsers: import('@prisma/client').User[] = []
  if (isAdmin) {
    const memberIds = event.members.map((m) => m.user_id)
    availableUsers = await prisma.user.findMany({
      where: { id: { notIn: memberIds }, is_active: true },
      orderBy: { nama: "asc" },
    })
  }

  const dtPentas = event.tanggal_pentas ? new Date(event.tanggal_pentas) : null
  const fallbackBanner = "https://images.unsplash.com/photo-1549834125-82d3c48159a3?q=80&w=1200&auto=format&fit=crop"

  // Build Google Maps embed URL from event.lokasi
  const mapsQuery = event.lokasi ? encodeURIComponent(event.lokasi) : ""
  const mapsEmbedUrl = mapsQuery
    ? `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU3aFo&q=${mapsQuery}`
    : null

  // Section data — nilai diambil langsung dari database
  const sections = [
    {
      key: "partitur_info",
      icon: "📄",
      label: "Partitur",
      value: (event as import('@prisma/client').Event & { [key: string]: unknown }).partitur_info as string | null,
      placeholder: "Belum ada keterangan partitur. Klik ikon edit untuk menambahkan.",
    },
    {
      key: "dresscode_info",
      icon: "👔",
      label: "Dresscode",
      value: (event as import('@prisma/client').Event & { [key: string]: unknown }).dresscode_info as string | null,
      placeholder: "Belum ada keterangan dresscode.",
    },
    {
      key: "media_info",
      icon: "🎵",
      label: "Media & Materi",
      value: (event as import('@prisma/client').Event & { [key: string]: unknown }).media_info as string | null,
      placeholder: "Belum ada media atau materi yang diunggah.",
    },
    {
      key: "rundown_info",
      icon: "📋",
      label: "Rundown",
      value: (event as import('@prisma/client').Event & { [key: string]: unknown }).rundown_info as string | null,
      placeholder: "Belum ada rundown acara.",
    },
  ]

  const KATEGORI_COLORS: Record<string, string> = {
    Konser: "bg-violet-600/80 text-violet-100",
    Lomba: "bg-rose-600/80 text-rose-100",
    Internal: "bg-blue-600/80 text-blue-100",
    Lainnya: "bg-slate-600/80 text-slate-100",
  }
  // Cast ke any karena Prisma client type cache mungkin belum refresh pasca generate
  const ev = event as import('@prisma/client').Event & { [key: string]: unknown }
  const kategoriColor = KATEGORI_COLORS[ev.kategori || "Lainnya"] || "bg-slate-600/80 text-slate-100"

  return (
    <div className="space-y-0 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-6xl mx-auto pb-24 font-sans text-white relative">

      {/* Hero Banner */}
      <div className="relative h-[380px] w-full rounded-b-[3rem] overflow-hidden -mx-6 md:-mx-10 px-6 md:px-10 -mt-6">
        <img src={fallbackBanner} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60" alt="Event" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1e0a4f]/70 via-[#0c0c0e]/70 to-[#0c0c0e]" />

        <div className="relative z-10 pt-16 flex flex-col justify-end h-full pb-10">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            {ev.kategori && (
              <span className={`text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-full uppercase ${kategoriColor}`}>
                {ev.kategori}
              </span>
            )}
            <span className="text-[10px] font-bold tracking-widest text-violet-300 bg-violet-900/60 border border-violet-500/30 px-3 py-1.5 rounded-full uppercase">
              {event.status}
            </span>
            <span className="text-[10px] text-violet-300 flex items-center gap-1.5 opacity-80">
              <Users className="w-3.5 h-3.5" /> {event.members.length} Singers
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white max-w-2xl leading-tight">
            {event.nama}
          </h1>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 -mt-6 relative z-20 mb-10">
        <div className="bg-[#171421] border border-[#ffffff1a] rounded-2xl p-5 flex flex-col gap-2 hover:bg-[#ffffff05] transition-colors">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Tanggal Pentas</span>
          <div className="flex items-center text-white font-semibold gap-3">
            <CalendarDays className="w-5 h-5 text-slate-400" />
            {dtPentas ? format(dtPentas, "dd MMM yyyy") : "TBA"}
          </div>
        </div>
        <div className="bg-[#171421] border border-[#ffffff1a] rounded-2xl p-5 flex flex-col gap-2 hover:bg-[#ffffff05] transition-colors">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Kategori</span>
          <div className="flex items-center text-white font-semibold gap-3">
            <Tag className="w-5 h-5 text-slate-400" />
            {ev.kategori || "—"}
          </div>
        </div>
        <div className="bg-[#171421] border border-[#ffffff1a] rounded-2xl p-5 flex flex-col gap-2 hover:bg-[#ffffff05] transition-colors">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Lokasi</span>
          <div className="flex items-center text-white font-semibold gap-3">
            <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
            <span className="truncate">{event.lokasi || "TBA"}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Left Column */}
        <div className={`${canViewTrainingDetail ? "lg:col-span-2" : "lg:col-span-3"} space-y-10`}>
          {!canViewTrainingDetail && (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 text-sm text-amber-100">
              Event ini sedang aktif di UKM. Rincian latihan dan presensi hanya tersedia untuk anggota yang terdaftar di event ini.
            </div>
          )}

          {/* Section cards: Partitur, Dresscode, Media, Rundown */}
          <section>
            <h3 className="text-xl font-bold mb-5">Kelengkapan Event</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sections.map((sec) => (
                <SectionEditor
                  key={sec.key}
                  sectionKey={sec.key}
                  icon={sec.icon}
                  label={sec.label}
                  value={sec.value}
                  placeholder={sec.placeholder}
                  isAdmin={isAdmin}
                  eventId={event.id}
                />
              ))}
            </div>
          </section>

          {/* About + Map */}
          <section>
            <h3 className="text-xl font-bold mb-4">Tentang Event</h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-2xl mb-6">
              {event.deskripsi || "Belum ada deskripsi untuk event ini."}
            </p>

            {/* Google Maps Embed */}
            <div className="rounded-3xl overflow-hidden border border-white/10 h-52 relative">
              {mapsEmbedUrl ? (
                <iframe
                  src={mapsEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Lokasi Event"
                />
              ) : (
                <div className="h-full bg-slate-800 flex items-center justify-center text-slate-500 text-sm">
                  <MapPin className="w-8 h-8 mb-2 text-slate-600 mr-2" />
                  Lokasi belum ditentukan
                </div>
              )}
              {event.lokasi && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.lokasi)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-3 right-3 bg-white text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg hover:bg-slate-100 transition-colors"
                >
                  Buka di Maps ↗
                </a>
              )}
            </div>
          </section>

          {/* Jadwal Sesi Latihan */}
          {canViewTrainingDetail && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Jadwal Sesi Latihan</h3>
                {isAdmin && <CreateSesiDialog eventId={event.id} />}
              </div>

              <div className="space-y-4">
                {event.sesi_latihan.length === 0 ? (
                  <p className="text-slate-500 text-sm border border-dashed border-white/10 p-8 text-center rounded-2xl">
                    Belum ada sesi latihan terjadwal.
                  </p>
                ) : (
                  event.sesi_latihan.map((sesi) => {
                    const isActive = sesi.status === "berlangsung" && sesi.kode_expired_at && new Date(sesi.kode_expired_at) > new Date()
                    const isPast = sesi.status === "selesai" || (sesi.waktu_selesai && new Date(sesi.waktu_selesai) < new Date())
                    const userRecord = !isAdmin ? sesi.absensi.find((a) => a.user_id === userId) : null
                    const userStatus = userRecord ? userRecord.status : null

                    return (
                      <div key={sesi.id} className={`p-5 rounded-2xl border transition-all ${isActive ? "bg-violet-900/20 border-violet-500/50" : "bg-[#13111a] border-white/5"}`}>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-white font-bold text-lg">{sesi.judul}</h4>
                          {isActive && <Badge className="bg-violet-600 text-white animate-pulse border-none">Absen Dibuka</Badge>}
                        </div>
                        <div className="flex gap-4 text-xs font-semibold text-slate-400 tracking-wider">
                          <span className="flex items-center"><CalendarDays className="h-3.5 w-3.5 mr-1 text-slate-500" /> {format(new Date(sesi.waktu_mulai), "dd MMM yyyy")}</span>
                          <span className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1 text-slate-500" /> {format(new Date(sesi.waktu_mulai), "HH:mm")}</span>
                        </div>

                        {isAdmin && (
                          <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
                            <div className="text-xs font-bold tracking-widest uppercase text-slate-400">
                              Kehadiran: <span className="text-violet-400">{sesi.absensi.length}</span> / {event.members.length}
                            </div>
                            <div className="flex items-center gap-2">
                              <a
                                href={`/dashboard/events/${event.id}/sesi/${sesi.id}`}
                                className="text-xs bg-[#ffffff0a] hover:bg-[#ffffff1a] border border-[#ffffff1a] text-white px-4 py-2 rounded-xl font-bold transition-colors"
                              >
                                Kelola Absen
                              </a>
                              {!isActive && !isPast && <BukaAbsenButton sesiId={sesi.id} eventId={event.id} />}
                              {isActive && (
                                <span className="text-violet-300 font-mono text-sm tracking-widest font-bold bg-violet-950 px-4 py-2 rounded-xl border border-violet-500/30">
                                  KODE: {sesi.kode_absen}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {!isAdmin && isActive && !userStatus && (
                          <div className="mt-4 pt-4 border-t border-violet-500/20">
                            <p className="text-xs font-bold text-violet-300 tracking-wide uppercase mb-3 text-center">Masukkan 4 Digit Kode Presensi</p>
                            <AbsenInput eventId={event.id} />
                          </div>
                        )}

                        {!isAdmin && userStatus && (
                          <div className={`mt-4 pt-4 border-t flex items-center text-xs font-bold uppercase tracking-wider ${userStatus === "terlambat" ? "border-amber-500/20 text-amber-500" : "border-emerald-500/20 text-emerald-500"}`}>
                            <CheckCircle className="h-4 w-4 mr-2" /> Tercatat: {userStatus}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </section>
          )}
        </div>

        {/* Right Sidebar — Daftar Singers */}
        {canViewTrainingDetail && (
          <div>
            <SingersPanel
              eventId={event.id}
              members={event.members}
              availableUsers={availableUsers}
              isAdmin={isAdmin}
            />
          </div>
        )}
      </div>
    </div>
  )
}
