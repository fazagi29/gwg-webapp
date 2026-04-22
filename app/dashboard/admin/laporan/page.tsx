import { FileSpreadsheet, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LaporanPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Laporan & Rekap</h1>
          <p className="text-slate-400">Pusat pelaporan data absensi dan keaktifan anggota UKM.</p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-16 text-center border border-dashed border-white/20 rounded-3xl bg-white/5 backdrop-blur-xl">
        <div className="h-20 w-20 rounded-full bg-violet-500/10 flex items-center justify-center mb-6 border border-violet-500/20">
          <FileSpreadsheet className="h-10 w-10 text-violet-400" />
        </div>
        <h2 className="text-2xl font-semibold text-white mb-3">Fitur Laporan Sedang Dibangun</h2>
        <p className="text-slate-400 max-w-md mx-auto mb-8">
          Halaman ini nantinya akan menyediakan visualisasi data kehadiran, filtering berdasarkan event, rekapitulasi anggota per sesi, dan kemampuan untuk mengekspor data ke PDF/Excel.
        </p>
        
        <div className="flex gap-4">
          <Button variant="outline" className="border-white/10 text-white hover:bg-white/10" disabled>
             <Download className="mr-2 h-4 w-4" /> Export PDF (Coming Soon)
          </Button>
          <Button variant="outline" className="border-white/10 text-white hover:bg-white/10" disabled>
             <Download className="mr-2 h-4 w-4" /> Export Excel (Coming Soon)
          </Button>
        </div>
      </div>
    </div>
  )
}
