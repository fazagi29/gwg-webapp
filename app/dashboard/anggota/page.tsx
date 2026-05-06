import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Mail, Mic2, Users } from "lucide-react"
import Image from "next/image"

export default async function AnggotaAktifPage() {
  const session = await auth()
  if (session?.user?.role === "admin") redirect("/dashboard/admin/anggota")

  const users = await prisma.user.findMany({
    where: {
      role: "anggota",
      is_active: true,
    },
    orderBy: [{ bagian_suara: "asc" }, { nama: "asc" }],
    select: {
      id: true,
      nama: true,
      email: true,
      bagian_suara: true,
      angkatan: true,
      foto_url: true,
    },
  })

  const counts = users.reduce<Record<string, number>>((acc, user) => {
    const key = user.bagian_suara || "Belum dipilih"
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-24 text-white animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="mb-2 text-4xl font-extrabold tracking-tight">Anggota Aktif</h1>
          <p className="max-w-xl text-sm leading-relaxed text-slate-400">
            Daftar anggota aktif UKM PSM Gita Widya Giri yang dapat dilihat oleh anggota.
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-emerald-300" />
            <div>
              <p className="text-2xl font-black text-white">{users.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">Anggota aktif</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(counts).map(([label, total]) => (
          <span key={label} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold capitalize text-slate-300">
            {label}: {total}
          </span>
        ))}
      </div>

      {users.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-10 text-center text-sm text-slate-500">
          Belum ada anggota aktif.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <article key={user.id} className="rounded-2xl border border-white/10 bg-[#14121c] p-5 transition-colors hover:border-violet-500/30 hover:bg-violet-950/20">
              <div className="mb-5 flex items-center gap-4">
                <div className="h-12 w-12 overflow-hidden rounded-full bg-linear-to-tr from-violet-500 to-blue-500 p-0.5">
                  <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-slate-950">
                    {user.foto_url ? (
                      <Image src={user.foto_url} alt={user.nama} width={48} height={48} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-sm font-black">{user.nama.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-base font-bold text-white">{user.nama}</h2>
                  <p className="text-xs text-slate-500">{user.angkatan ? `Angkatan ${user.angkatan}` : "Angkatan belum diisi"}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Mic2 className="h-4 w-4 text-violet-300" />
                  <Badge variant="outline" className="border-violet-500/20 bg-violet-500/10 capitalize text-violet-200">
                    {user.bagian_suara || "Belum dipilih"}
                  </Badge>
                </div>
                <div className="flex min-w-0 items-center gap-2 text-sm text-slate-400">
                  <Mail className="h-4 w-4 shrink-0 text-slate-500" />
                  <span className="truncate">{user.email}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
