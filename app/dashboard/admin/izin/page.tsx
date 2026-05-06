import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { CheckCircle2, XCircle, FileText, User, Clock } from "lucide-react"
import { IzinApprovalClient } from "./izin-approval-client"

export default async function IzinApprovalPage() {
  const session = await auth()
  if (session?.user?.role !== "admin") return redirect("/dashboard")

  const pendingIzin = await prisma.pengajuanIzin.findMany({
    where: { status_izin: "menunggu" },
    orderBy: { diajukan_at: "desc" },
    include: {
      user: true,
      sesi: { include: { event: true } }
    }
  })

  const approvedIzin = await prisma.pengajuanIzin.findMany({
    where: { status_izin: "disetujui" },
    orderBy: { diproses_at: "desc" },
    take: 10,
    include: {
      user: true,
      sesi: { include: { event: true } },
      approver: true
    }
  })

  const rejectedIzin = await prisma.pengajuanIzin.findMany({
    where: { status_izin: "ditolak" },
    orderBy: { diproses_at: "desc" },
    take: 10,
    include: {
      user: true,
      sesi: { include: { event: true } },
      approver: true
    }
  })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-7xl mx-auto pb-24">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Approval Izin Absen</h1>
        <p className="text-slate-400">Kelola permintaan izin absen dari anggota choir</p>
      </div>

      {/* Pending Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-violet-400" />
          <h2 className="text-2xl font-bold text-white">
            Menunggu Persetujuan ({pendingIzin.length})
          </h2>
        </div>

        {pendingIzin.length === 0 ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-8 text-center text-emerald-300">
            ✅ Semua izin telah diproses!
          </div>
        ) : (
          <div className="space-y-3">
            {pendingIzin.map((izin) => (
              <div
                key={izin.id}
                className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Left */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <p className="font-semibold text-white">{izin.user.nama}</p>
                      <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                        {izin.user.email}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <p className="text-sm text-slate-300">
                        {izin.sesi.judul} • {format(new Date(izin.sesi.waktu_mulai), "dd MMM yyyy HH:mm", { locale: localeId })}
                      </p>
                    </div>

                    <p className="text-sm text-slate-400">Event: {izin.sesi.event.nama}</p>

                    <div className="bg-black/30 rounded-lg p-3 mt-3">
                      <p className="text-xs font-semibold text-slate-300 mb-2">Alasan:</p>
                      <p className="text-sm text-slate-300">{izin.alasan}</p>
                    </div>

                    <p className="text-xs text-slate-500 mt-2">
                      Diajukan: {format(new Date(izin.diajukan_at), "dd MMM yyyy HH:mm", { locale: localeId })}
                    </p>
                  </div>

                  {/* Actions */}
                  <IzinApprovalClient izinId={izin.id} eventId={izin.sesi.event_id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approved Section */}
      {approvedIzin.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <h2 className="text-2xl font-bold text-white">
              Disetujui ({approvedIzin.length})
            </h2>
          </div>
          <div className="space-y-2">
            {approvedIzin.map((izin) => (
              <div key={izin.id} className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4 flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-white text-sm">{izin.user.nama}</p>
                  <p className="text-xs text-slate-400 mt-1">{izin.sesi.judul}</p>
                </div>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded">✓ Disetujui</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rejected Section */}
      {rejectedIzin.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <XCircle className="w-6 h-6 text-red-400" />
            <h2 className="text-2xl font-bold text-white">
              Ditolak ({rejectedIzin.length})
            </h2>
          </div>
          <div className="space-y-2">
            {rejectedIzin.map((izin) => (
              <div key={izin.id} className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-white text-sm">{izin.user.nama}</p>
                  <p className="text-xs text-slate-400 mt-1">{izin.sesi.judul}</p>
                </div>
                <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">✗ Ditolak</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
