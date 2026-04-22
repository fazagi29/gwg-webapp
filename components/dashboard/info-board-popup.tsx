"use client"

import { useState } from "react"
import { createPortal } from "react-dom"
import { useEffect } from "react"

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(timer)
  }, [])
  if (!mounted) return null
  return createPortal(children, document.body)
}

interface Pengumuman {
  id: string
  judul: string
  isi: string
  waktu: string
}

interface InfoBoardProps {
  pengumuman: Pengumuman[]
}

export function InfoBoardPopup({ pengumuman }: InfoBoardProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full mt-6 py-3.5 rounded-xl bg-[#ffffff0a] border border-[#ffffff1a] hover:bg-[#ffffff10] text-[10px] font-bold text-slate-300 transition-colors uppercase tracking-[0.2em] relative z-10"
      >
        Lihat Papan Informasi
      </button>

      {isOpen && (
        <Portal>
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="bg-[#131118] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl shadow-violet-900/20 max-h-[80vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">📋 Papan Informasi</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white text-xl leading-none"
                >
                  ×
                </button>
              </div>
              <div className="overflow-y-auto flex-1 p-6 space-y-4">
                {pengumuman.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-8">Belum ada pengumuman.</p>
                ) : (
                  pengumuman.map((p) => (
                    <div key={p.id} className="p-4 rounded-xl bg-[#ffffff05] border border-white/5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">{p.judul}</span>
                        <span className="text-[9px] text-slate-500 font-bold">{p.waktu}</span>
                      </div>
                      <p className="text-sm text-slate-200 leading-relaxed">{p.isi}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  )
}
