"use client"

import { useState, useRef, useEffect } from "react"
import { LogOut, Search, User2, ChevronDown } from "lucide-react"
import { logoutAction } from "@/app/actions/auth"
import Link from "next/link"

interface TopNavProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  } | null
}

export function TopNav({ user }: TopNavProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 })

  // Update dropdown position
  useEffect(() => {
    if (buttonRef.current && dropdownOpen) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      })
    }
  }, [dropdownOpen])

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) && 
          buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [dropdownOpen])

  const initials = user?.name?.charAt(0).toUpperCase() || "?"

  return (
    <header className="liquid-glass h-16 shrink-0 pl-16 pr-4 md:mx-4 md:mt-4 md:px-5 flex items-center justify-between relative z-20 rounded-none md:rounded-2xl border-x-0 border-t-0 md:border overflow-visible">
      {/* Left: Mobile menu trigger + Search */}
      <div className="flex items-center gap-4 flex-1">
        {/* Search bar */}
        <form action="/dashboard/events" className="hidden lg:flex items-center relative group">
          <Search className="h-4 w-4 absolute left-3 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
          <input
            type="text"
            name="q"
            placeholder="Cari event..."
            className="liquid-input hover:border-white/20 outline-none rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-500 w-52 transition-all focus:w-64 xl:w-56 xl:focus:w-72"
          />
        </form>
      </div>

      {/* Right: Profile dropdown */}
      <div className="flex items-center gap-3">
        <div className="h-8 w-px bg-white/10" />

        {/* Profile dropdown trigger */}
        <div className="relative">
          <button
            ref={buttonRef}
            onClick={() => setDropdownOpen(prev => !prev)}
            className="flex items-center gap-3 hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors group"
          >
            {/* Name + role */}
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-white leading-none mb-0.5">{user?.name || "User"}</p>
              <p className="text-[10px] text-slate-400 leading-none capitalize font-medium">{user?.role}</p>
            </div>

            {/* Avatar */}
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-violet-500 via-sky-400 to-emerald-400 p-[2px] shrink-0 shadow-[0_0_24px_rgba(124,58,237,0.18)]">
              <div className="h-full w-full rounded-full bg-slate-900 overflow-hidden flex items-center justify-center">
                {user?.image ? (
                  <img src={user.image || undefined} alt={user.name || "User"} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-white">{initials}</span>
                )}
              </div>
            </div>

            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown panel - using fixed positioning */}
          {dropdownOpen && (
            <div 
              ref={dropdownRef}
              style={{
                position: 'fixed',
                top: `${dropdownPos.top}px`,
                right: `${dropdownPos.right}px`,
              }}
              className="liquid-glass w-64 rounded-2xl z-[9999] animate-in fade-in slide-in-from-top-2 duration-150 border border-white/10 shadow-xl"
            >
              {/* User info header */}
              <div className="px-5 py-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-violet-500 to-blue-500 p-[2px] shrink-0">
                    <div className="h-full w-full rounded-full bg-slate-900 overflow-hidden flex items-center justify-center">
                      {user?.image ? (
                        <img src={user.image || undefined} alt={user.name || "User"} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-white">{initials}</span>
                      )}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{user?.name || "User"}</p>
                    <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="p-2">
                <Link
                  href="/dashboard/profil"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group/item"
                >
                  <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/20 flex items-center justify-center">
                    <User2 className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Edit Profil</p>
                    <p className="text-[10px] text-slate-500">Ubah data dan foto profil</p>
                  </div>
                </Link>
              </div>

              {/* Logout */}
              <div className="p-2 border-t border-white/5">
                <form action={logoutAction} className="w-full">
                  <button
                    type="submit"
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 transition-colors group/logout text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                      <LogOut className="w-4 h-4 text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-400">Keluar</p>
                      <p className="text-[10px] text-slate-500">Logout dari sesi ini</p>
                    </div>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
