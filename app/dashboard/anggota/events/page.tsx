import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, MapPin, ArrowRight, Users, ListChecks, SearchX } from "lucide-react"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"

type EventCard = Awaited<ReturnType<typeof getEvents>>["joinedEvents"][number]

async function getEvents(userId: string, q: string) {
  const activeStatus = ["persiapan", "aktif"]
  const searchFilter = q ? { nama: { contains: q } } : {}

  const [joinedEvents, ukmEvents] = await Promise.all([
    prisma.event.findMany({
      where: {
        ...searchFilter,
        status: { in: activeStatus },
        members: { some: { user_id: userId } },
      },
      orderBy: [{ tanggal_pentas: "asc" }, { created_at: "desc" }],
      include: {
        _count: { select: { members: true, sesi_latihan: true } },
        sesi_latihan: {
          orderBy: { waktu_mulai: "asc" },
          take: 3,
        },
      },
    }),
    prisma.event.findMany({
      where: {
        ...searchFilter,
        status: { in: activeStatus },
        members: { none: { user_id: userId } },
      },
      orderBy: [{ tanggal_pentas: "asc" }, { created_at: "desc" }],
      include: {
        _count: { select: { members: true, sesi_latihan: true } },
      },
    }),
  ])

  return { joinedEvents, ukmEvents }
}

function StatusBadge({ status }: { status: string }) {
  const className =
    status === "aktif"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
      : "bg-amber-500/15 text-amber-300 border-amber-500/30"

  return (
    <Badge variant="outline" className={`${className} uppercase tracking-widest text-[10px]`}>
      {status}
    </Badge>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center text-sm text-slate-500">
      {text}
    </div>
  )
}

function JoinedEventCard({ event }: { event: EventCard }) {
  const nextSesi = event.sesi_latihan[0]

  return (
    <Link
      href={`/dashboard/events/${event.id}`}
      className="group rounded-2xl border border-violet-500/20 bg-[#171421] p-5 transition-all hover:border-violet-400/50 hover:bg-violet-950/30"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <StatusBadge status={event.status} />
          <h3 className="text-xl font-extrabold leading-tight text-white group-hover:text-violet-200">
            {event.nama}
          </h3>
        </div>
        <div className="rounded-xl bg-violet-500/15 p-3 text-violet-300">
          <ListChecks className="h-5 w-5" />
        </div>
      </div>

      <div className="space-y-2 text-sm text-slate-400">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-slate-500" />
          {event.tanggal_pentas ? format(new Date(event.tanggal_pentas), "dd MMMM yyyy", { locale: localeId }) : "Tanggal pentas belum ditentukan"}
        </div>
        {event.lokasi && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-500" />
            <span className="truncate">{event.lokasi}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-slate-500" />
          {event._count.members} anggota, {event._count.sesi_latihan} sesi latihan
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-violet-300">Latihan terdekat</p>
        <p className="text-sm font-semibold text-white">{nextSesi?.judul || "Belum ada latihan terjadwal"}</p>
        {nextSesi && (
          <p className="mt-1 text-xs text-slate-400">
            {format(new Date(nextSesi.waktu_mulai), "dd MMM yyyy, HH:mm", { locale: localeId })}
          </p>
        )}
      </div>

      <div className="mt-5 flex items-center justify-end gap-2 text-xs font-bold uppercase tracking-widest text-violet-300">
        Detail latihan <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  )
}

function UkmEventCard({ event }: { event: Omit<EventCard, "sesi_latihan"> }) {
  return (
    <Link
      href={`/dashboard/events/${event.id}`}
      className="group rounded-2xl border border-white/10 bg-[#101015] p-5 transition-all hover:border-slate-400/30 hover:bg-white/[0.06]"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <StatusBadge status={event.status} />
          <h3 className="text-lg font-bold leading-tight text-white group-hover:text-slate-100">{event.nama}</h3>
        </div>
        <ArrowRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-white" />
      </div>

      <div className="space-y-2 text-sm text-slate-400">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-slate-500" />
          {event.tanggal_pentas ? format(new Date(event.tanggal_pentas), "dd MMMM yyyy", { locale: localeId }) : "TBA"}
        </div>
        {event.lokasi && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-500" />
            <span className="truncate">{event.lokasi}</span>
          </div>
        )}
      </div>

      <p className="mt-5 text-xs text-slate-500">Ringkasan event UKM. Detail latihan hanya tampil untuk event yang Anda ikuti.</p>
    </Link>
  )
}

export default async function AnggotaEventsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const session = await auth()
  if (session?.user?.role === "admin") redirect("/dashboard/events")

  const params = await searchParams
  const q = params?.q?.trim() || ""
  const userId = session?.user?.id as string
  const { joinedEvents, ukmEvents } = await getEvents(userId, q)
  const isSearchEmpty = q && joinedEvents.length === 0 && ukmEvents.length === 0

  return (
    <div className="mx-auto max-w-6xl space-y-10 pb-24 text-white animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="border-b border-white/10 pb-6">
        <h1 className="mb-2 text-4xl font-extrabold tracking-tight">Event Aktif</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-400">
          Pantau event UKM yang sedang berjalan. Event yang Anda ikuti menampilkan rincian latihan, sedangkan event UKM lain tampil sebagai ringkasan.
        </p>
      </div>

      {isSearchEmpty && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 text-amber-100">
          <SearchX className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
          <div>
            <p className="font-bold">Hasil pencarian tidak ditemukan</p>
            <p className="mt-1 text-sm text-amber-100/75">
              Tidak ada event aktif yang cocok dengan kata kunci “{q}”.
            </p>
          </div>
        </div>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Event yang Saya Ikuti</h2>
            <p className="text-sm text-slate-500">Termasuk jadwal latihan dan status presensi Anda.</p>
          </div>
          <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-bold text-violet-300">
            {joinedEvents.length} event
          </span>
        </div>

        {joinedEvents.length === 0 ? (
          <EmptyState text="Anda belum terdaftar di event aktif mana pun." />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {joinedEvents.map((event) => (
              <JoinedEventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Event Aktif UKM</h2>
            <p className="text-sm text-slate-500">Event aktif lain yang dapat dilihat sebagai informasi umum.</p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-slate-300">
            {ukmEvents.length} event
          </span>
        </div>

        {ukmEvents.length === 0 ? (
          <EmptyState text="Tidak ada event aktif UKM lain saat ini." />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {ukmEvents.map((event) => (
              <UkmEventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
