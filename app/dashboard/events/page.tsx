import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CreateEventDialog } from "./create-dialog"
import { EventsClient } from "./events-client"

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const session = await auth()
  const isAdmin = session?.user?.role === "admin"
  const params = await searchParams
  const q = params?.q || ""

  const allEvents: import('@prisma/client').Event[] = await prisma.event.findMany({
    where: q ? { nama: { contains: q } } : undefined,
    orderBy: { created_at: "desc" },
    include: {
      _count: {
        select: { members: true, sesi_latihan: true },
      },
    },
  })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-6xl mx-auto pb-24">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#ffffff0a] pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white uppercase font-sans mb-2">
            Event & Jadwal
          </h1>
          <p className="text-slate-400 max-w-md text-sm">
            Daftar agenda resmi PSM Gita Widya Giri. Kelola partisipasi dan pantau jadwal pertunjukan.
          </p>
        </div>
      </div>

      {/* Admin: tombol tambah event */}
      {isAdmin && <CreateEventDialog />}

      {/* Client component: filter + grid */}
      <EventsClient events={allEvents} isAdmin={isAdmin} />
    </div>
  )
}
