import { prisma } from "@/lib/prisma"
import { CreateAnggotaDialog } from "./create-dialog"
import { AnggotaClientTable } from "./anggota-client"

export default async function AnggotaPage() {
  const users = await prisma.user.findMany({
    orderBy: { created_at: 'desc' }
  })

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Manajemen Anggota</h1>
          <p className="text-slate-400">Total {users.length} anggota terdaftar dalam sistem.</p>
        </div>
        <CreateAnggotaDialog />
      </div>

      <AnggotaClientTable initialUsers={users} />
    </div>
  )
}
