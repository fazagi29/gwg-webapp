import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Music2 } from "lucide-react"
import { PartiturClient } from "./partitur-client"

export default async function PartiturPage() {
  const session = await auth()
  const isAdmin = session?.user?.role === "admin"

  const partiturList = await prisma.partitur.findMany({
    orderBy: { created_at: "desc" },
  })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-4xl mx-auto pb-24">

      {/* Header */}
      <div className="flex items-end justify-between border-b border-[#ffffff0a] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/20 flex items-center justify-center">
              <Music2 className="w-5 h-5 text-violet-400" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white uppercase">
              Partitur
            </h1>
          </div>
          <p className="text-slate-400 text-sm max-w-md">
            Koleksi partitur resmi PSM Gita Widya Giri. Buka dan unduh file PDF langsung dari browser.
          </p>
        </div>

        <div className="text-right hidden md:block">
          <p className="text-3xl font-black text-white">{partiturList.length}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Partitur Tersedia</p>
        </div>
      </div>

      {/* Client component (search + CRUD + PDF viewer) */}
      <PartiturClient partiturList={partiturList} isAdmin={isAdmin} />
    </div>
  )
}
