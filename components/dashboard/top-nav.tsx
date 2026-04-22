"use client"

import { useState, useRef, useEffect } from "react"
import { LogOut, Search, Menu, User2, ChevronDown } from "lucide-react"
import { logoutAction } from "@/app/actions/auth"
import Link from "next/link"

interface TopNavProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  } | null
  onMenuClick?: () => void
}

export function TopNav({ user, onMenuClick }: TopNavProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const initials = user?.name?.charAt(0).toUpperCase() || "?"

  return (
    <header className="h-16 px-4 md:px-6 border-b border-white/5 flex items-center justify-between bg-slate-950/20 backdrop-blur-xl sticky top-0 z-20">
      {/* Left: Mobile menu trigger + Search */}
      <div className="flex items-center gap-4 flex-1">
        <button onClick={onMenuClick} className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors">
          <Menu className="h-5 w-5" />
        </button>

        {/* Search bar */}
        <form action="/dashboard/events" className="hidden md:flex items-center relative group">
          <Search className="h-4 w-4 absolute left-3 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
          <input
            type="text"
            name="q"
            placeholder="Cari event..."
            className="bg-[#ffffff0a] border border-[#ffffff1a] hover:border-white/20 focus:border-violet-500/50 outline-none rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-500 w-56 transition-all focus:w-72 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"
          />
        </form>
      </div>

      {/* Right: Profile dropdown */}
      <div className="flex items-center gap-3">
        <div className="h-8 w-px bg-white/10" />

        {/* Profile dropdown trigger */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setDropdownOpen(prev => !prev)}
            className="flex items-center gap-3 hover:bg-white/5 px-3 py-1.5 rounded-full transition-colors group"
          >
            {/* Name + role */}
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-white leading-none mb-0.5">{user?.name || "User"}</p>
              <p className="text-[10px] text-slate-400 leading-none capitalize font-medium">{user?.role}</p>
            </div>

            {/* Avatar */}
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-violet-500 to-blue-500 p-[2px] shrink-0">
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

          {/* Dropdown panel */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-[#171421] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
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
