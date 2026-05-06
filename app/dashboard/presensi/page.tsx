import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Mic, CalendarX, ArrowRight, ArrowLeft } from "lucide-react"
import { LiveClockHeader } from "./clock-cmp"
import { PresensiButtonClient } from "./presensi-button-client"
import Link from "next/link"

export default async function PresensiMemberPage() {
  const session = await auth()
  const userId = session?.user?.id as string
  if (session?.user?.role === "admin") return redirect('/dashboard/events')

  // Find user's logs
  const logs = await prisma.absensi.findMany({
    where: { user_id: userId },
    orderBy: { waktu_absen: 'desc' },
    include: {
      sesi: true
    },
    take: 12
  })

  // Find incoming active session user is part of. 
  // Normally we check if user has not yet checked in to an active session for their event.
  const allEventsUserJoined = await prisma.eventMember.findMany({
     where: { user_id: userId },
     select: { event_id: true }
  })
  
  const eventIds = allEventsUserJoined.map(e => e.event_id)

  const activeSesi = await prisma.sesiLatihan.findFirst({
    where: {
       event_id: { in: eventIds },
       status: "berlangsung",
       kode_expired_at: { gt: new Date() }
    },
    include: {
      absensi: { where: { user_id: userId } },
      event: true
    }
  })

  const hasCheckedIn = activeSesi ? activeSesi.absensi.length > 0 : false

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-6xl mx-auto pb-24 font-sans text-white">
      
      <div className="flex flex-col lg:flex-row gap-8 justify-between">
         {/* Left Hero Section */}
         <div className="lg:w-1/2 flex flex-col justify-center">
            <h1 className="text-5xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
              Siap untuk <br /><span className="text-violet-400">Latihan</span> hari <br />ini?
            </h1>
            <p className="text-slate-400 text-sm max-w-md mb-10 leading-relaxed font-medium">
              Catat kehadiranmu dalam harmoni Gita Widya Giri. Kedisiplinan adalah kunci kualitas suara kita.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              {activeSesi ? (
                 hasCheckedIn ? (
                   <div className="flex-1 min-h-[100px] rounded-3xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center p-6 text-emerald-400 font-bold">
                     ✅ Presensi Tercatat
                   </div>
                 ) : (
                   <Link href={`/dashboard/events/${activeSesi.event_id}`} className="flex-1 group min-h-[100px] rounded-3xl bg-violet-600 hover:bg-violet-500 transition-all flex flex-col items-center justify-center p-6 cursor-pointer shadow-[0_0_40px_rgba(124,58,237,0.3)]">
                     <Mic className="w-6 h-6 mb-2 text-violet-200 group-hover:scale-110 transition-transform" />
                     <span className="font-bold text-white tracking-wide">Hadir Latihan</span>
                   </Link>
                 )
              ) : (
                 <div className="flex-1 min-h-[100px] rounded-3xl bg-[#ffffff0a] border border-[#ffffff1a] flex items-center justify-center p-6 text-slate-400 font-bold text-sm text-center">
                   Belum ada Latihan<br/>Aktif Saat Ini
                 </div>
              )}

              <PresensiButtonClient
                sesiId={activeSesi?.id}
                sesiJudul={activeSesi?.judul}
              />
            </div>
         </div>

         {/* Right Digital Clock Card */}
         <div className="lg:w-5/12">
            <LiveClockHeader />
         </div>
      </div>

      <section>
         <div className="flex items-center justify-between mb-8">
            <div>
               <h3 className="text-2xl font-bold tracking-tight text-white mb-1">Riwayat Kehadiran</h3>
               <p className="text-sm text-slate-400">Log detail aktivitas latihan Anda bulan ini.</p>
            </div>
            <div className="flex items-center gap-3">
               <div className="bg-[#ffffff0a] border border-[#ffffff1a] text-sm text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer font-medium hover:bg-white/5">
                 📅 Oktober 2023
               </div>
               <div className="bg-[#ffffff0a] border border-[#ffffff1a] p-2 rounded-lg cursor-pointer hover:bg-white/5">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
               </div>
            </div>
         </div>

         <div className="bg-[#0f0f13] border border-[#ffffff1a] rounded-3xl overflow-hidden pb-4">
            <div className="overflow-x-auto">
               <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-[#ffffff05] border-b border-[#ffffff1a]">
                    <tr>
                      <th className="px-8 py-5 font-bold tracking-widest text-slate-500 text-[10px] uppercase">Sesi Latihan</th>
                      <th className="px-8 py-5 font-bold tracking-widest text-slate-500 text-[10px] uppercase">Jam Datang</th>
                      <th className="px-8 py-5 font-bold tracking-widest text-slate-500 text-[10px] uppercase">Status</th>
                      <th className="px-8 py-5 font-bold tracking-widest text-slate-500 text-[10px] uppercase text-right">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ffffff0a]">
                     {logs.length === 0 ? (
                       <tr><td colSpan={4} className="text-center py-10 text-slate-500">Belum ada riwayat tercatat.</td></tr>
                     ) : logs.map(log => (
                       <tr key={log.id} className="hover:bg-white/5 transition-colors">
                         <td className="px-8 py-5">
                            <p className="text-slate-200 font-bold">{log.sesi.judul}</p>
                            <p className="text-[10px] text-violet-400 uppercase tracking-widest mt-1 font-bold">{format(new Date(log.sesi.waktu_mulai), 'dd MMM yyyy')}</p>
                         </td>
                         <td className="px-8 py-5 text-slate-300 font-mono text-xs">
                            {format(new Date(log.waktu_absen), 'HH:mm')}
                         </td>
                         <td className="px-8 py-5">
                            <span className={`px-3 py-1.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest border flex w-max items-center gap-1.5 ${
                               log.status === "hadir" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : 
                               log.status === "terlambat" ? "bg-amber-500/10 text-amber-400 border-amber-500/30" :
                               log.status === "izin" ? "bg-blue-500/10 text-blue-400 border-blue-500/30" :
                               "bg-red-500/10 text-red-500 border-red-500/30"
                            }`}>
                               <div className={`w-1.5 h-1.5 rounded-full ${
                                 log.status === "hadir" ? "bg-emerald-400" : 
                                 log.status === "terlambat" ? "bg-amber-400" :
                                 log.status === "izin" ? "bg-blue-400" : "bg-red-500"
                               }`} />
                               {log.status === "hadir" ? "TEPAT WAKTU" : log.status}
                            </span>
                         </td>
                         <td className="px-8 py-5 text-slate-500 text-xs text-right">
                            {/* Normally descriptive context mapping or user note, let's fake some placeholder text mapping matching image 3. */}
                            {log.status === "hadir" ? "Berhasil absensi via sistem" : "Toleransi sistem terlambat tercatat"}
                         </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>

            <div className="flex items-center justify-between px-8 pt-6 border-t border-[#ffffff0a] mt-2">
               <span className="text-[10px] tracking-widest uppercase font-bold text-slate-500">Menampilkan {Math.min(3, logs.length)} dari {logs.length} Sesi</span>
               <div className="flex gap-2">
                 <button className="w-8 h-8 rounded-full bg-[#ffffff0a] hover:bg-white/10 flex items-center justify-center"><ArrowLeft className="w-3 h-3 text-slate-400" /></button>
                 <button className="w-8 h-8 rounded-full bg-[#ffffff0a] hover:bg-white/10 flex items-center justify-center"><ArrowRight className="w-3 h-3 text-slate-400" /></button>
               </div>
            </div>
         </div>
      </section>

    </div>
  )
}
