import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, MapPin, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { AbsenKelola } from "./client-actions"

export default async function SesiDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; sesiId: string }>
  searchParams: Promise<{ q?: string; sort?: string; order?: string }>
}) {
  const resolvedParams = await params
  const eventId = resolvedParams.id
  const sesiId = resolvedParams.sesiId
  const resolvedQuery = await searchParams
  const q = resolvedQuery.q || ""
  const sort = resolvedQuery.sort || "nama"
  const order = resolvedQuery.order || "asc"

  const session = await auth()
  const isAdmin = session?.user?.role === "admin"
  if (!isAdmin) return redirect(`/dashboard/events/${eventId}`)

  const sesi = await prisma.sesiLatihan.findUnique({
    where: { id: sesiId },
    include: {
      event: {
        include: {
          members: {
            include: { user: true },
          },
        },
      },
      absensi: true,
    },
  })

  if (!sesi || sesi.event_id !== eventId) return notFound()

  // Build absensi map
  const absensiMap = new Map(sesi.absensi.map((a) => [a.user_id, a]))

  // Filter by search
  let members = sesi.event.members.filter((m) =>
    q ? m.user.nama.toLowerCase().includes(q.toLowerCase()) : true
  )

  // Sort
  members = [...members].sort((a, b) => {
    let valA: string, valB: string
    if (sort === "suara") {
      valA = a.user.bagian_suara || ""
      valB = b.user.bagian_suara || ""
    } else if (sort === "status") {
      valA = absensiMap.get(a.user_id)?.status || "alpha"
      valB = absensiMap.get(b.user_id)?.status || "alpha"
    } else {
      valA = a.user.nama || ""
      valB = b.user.nama || ""
    }
    const cmp = valA.localeCompare(valB)
    return order === "desc" ? -cmp : cmp
  })

  const totalHadir = sesi.absensi.filter((a) => a.status === "hadir").length
  const totalTerlambat = sesi.absensi.filter((a) => a.status === "terlambat").length
  const totalIzin = sesi.absensi.filter((a) => a.status === "izin").length
  const totalAlpha = sesi.event.members.length - (totalHadir + totalTerlambat + totalIzin)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-5xl mx-auto pb-24">
      <Link href={`/dashboard/events/${eventId}`} className="inline-flex items-center text-sm text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" /> Kembali ke Event
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
        <div className="relative z-10 w-full">
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 mb-4 px-3 py-1 uppercase tracking-widest text-[10px]">
            {sesi.status}
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">{sesi.judul}</h1>
          <p className="text-slate-400">Kelola absensi singers untuk sesi ini</p>

          <div className="flex flex-wrap gap-3 mt-5 border-t border-white/5 pt-4">
            <div className="flex items-center text-sm text-slate-300 bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
              <CalendarDays className="mr-2 h-4 w-4 text-violet-400" />
              {format(new Date(sesi.waktu_mulai), "dd MMMM yyyy — HH:mm")}
            </div>
            {sesi.lokasi && (
              <div className="flex items-center text-sm text-slate-300 bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
                <MapPin className="mr-2 h-4 w-4 text-rose-400" />
                {sesi.lokasi}
              </div>
            )}
            <div className="text-sm text-slate-300 bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
              Toleransi Terlambat: <strong>{sesi.durasi_ontime_menit} menit</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Hadir", value: totalHadir, color: "emerald" },
          { label: "Terlambat", value: totalTerlambat, color: "amber" },
          { label: "Izin / Sakit", value: totalIzin, color: "blue" },
          { label: "Alpha", value: totalAlpha, color: "red" },
        ].map(({ label, value, color }) => (
          <Card key={label} className={`bg-${color}-500/10 border-${color}-500/20`}>
            <CardContent className="p-4 text-center">
              <div className={`text-3xl font-black text-${color}-400`}>{value}</div>
              <div className={`text-[10px] text-${color}-500 uppercase tracking-widest mt-1 font-bold`}>{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table with client-side search + sort */}
      <AbsenKelola
        members={members}
        absensiMap={Object.fromEntries(absensiMap)}
        sesiId={sesi.id}
        eventId={eventId}
        totalMembers={sesi.event.members.length}
        q={q}
        sort={sort}
        order={order}
      />
    </div>
  )
}
