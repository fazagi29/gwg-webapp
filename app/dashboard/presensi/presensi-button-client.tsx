"use client"

import { useState } from "react"
import { CalendarX } from "lucide-react"
import { IzinModal } from "./izin-modal"

interface PresensiButtonClientProps {
  sesiId?: string
  sesiJudul?: string
}

export function PresensiButtonClient({
  sesiId,
  sesiJudul,
}: PresensiButtonClientProps) {
  const [showIzinModal, setShowIzinModal] = useState(false)

  const isDisabled = !sesiId || !sesiJudul

  return (
    <>
      <button
        onClick={() => setShowIzinModal(true)}
        disabled={isDisabled}
        className="flex-1 sm:max-w-[140px] rounded-3xl bg-[#ffffff0a] hover:bg-[#ffffff1a] border border-[#ffffff1a] transition-all flex flex-col items-center justify-center p-6 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <CalendarX className="w-5 h-5 mb-2 text-slate-400" />
        <span className="font-bold text-slate-300 text-sm">Izin Absen</span>
      </button>

      {showIzinModal && sesiId && sesiJudul && (
        <IzinModal
          sesiId={sesiId}
          sesiJudul={sesiJudul}
          onClose={() => setShowIzinModal(false)}
        />
      )}
    </>
  )
}
