"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"

export function LiveClockHeader() {
  const [time, setTime] = useState<Date | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setTime(new Date()), 0)
    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [])

  if (!time) {
    return (
      <div className="w-full h-full min-h-[250px] bg-[#171421] rounded-[2rem] border border-[#ffffff0a] flex items-center justify-center">
         <span className="text-slate-500 animate-pulse">Menyelaraskan waktu...</span>
      </div>
    )
  }

  return (
    <div className="w-full h-full min-h-[250px] bg-[#0c0a13] rounded-[2.5rem] border border-[#ffffff0a] relative overflow-hidden flex flex-col items-center justify-center py-12 px-6">
       {/* Background glow */}
       <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
       <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />
       
       <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-violet-400 mb-6 relative z-10 w-full text-center">
          Waktu Sekarang
       </span>
       
       <div className="text-7xl lg:text-8xl font-black text-white tracking-tighter leading-none mb-4 relative z-10 w-full text-center tabular-nums">
         {format(time, 'HH:mm')}
       </div>
       
       <div className="text-sm font-bold tracking-widest text-slate-400 uppercase relative z-10 w-full text-center mt-2">
         {format(time, 'EEEE, dd MMM', { locale: id })}
       </div>

       <div className="absolute bottom-8 flex items-center gap-2">
          <div className="flex gap-1">
             <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse"></span>
             <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse delay-75"></span>
             <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse delay-150"></span>
          </div>
          <span className="text-[9px] font-black tracking-widest text-violet-500 uppercase">Live Sync</span>
       </div>
    </div>
  )
}
