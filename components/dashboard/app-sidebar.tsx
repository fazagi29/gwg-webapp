"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  ClipboardList,
  FileSpreadsheet,
  LogOut,
  Music2,
  X,
  CheckCircle,
  Search,
} from "lucide-react"

interface AppSidebarProps {
  role: string
  isOpen?: boolean
  setIsOpen?: (open: boolean) => void
}

export function AppSidebar({ role, isOpen, setIsOpen }: AppSidebarProps) {
  const pathname = usePathname()
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  const memberRoutes = [
    {
      title: "DASHBOARD",
      icon: LayoutDashboard,
      href: "/dashboard",
      show: true,
    },
    {
      title: role === "admin" ? "EVENT & JADWAL" : "EVENT AKTIF",
      icon: CalendarDays,
      href: role === "admin" ? "/dashboard/events" : "/dashboard/anggota/events",
      show: true,
    },
    {
      title: "PRESENSI",
      icon: CheckCircle,
      href: "/dashboard/presensi",
      show: role !== "admin",
    },
    {
      title: "ANGGOTA AKTIF",
      icon: ClipboardList,
      href: "/dashboard/anggota",
      show: role !== "admin",
    },
    {
      title: "PARTITUR",
      icon: Music2,
      href: "/dashboard/partitur",
      show: true,
    },
  ]

  const adminRoutes = [
    {
      title: "KELOLA ANGGOTA",
      icon: Users,
      href: "/dashboard/admin/anggota",
      show: role === "admin",
    },
    {
      title: "APPROVAL IZIN",
      icon: CheckCircle,
      href: "/dashboard/admin/izin",
      show: role === "admin",
    },
    {
      title: "LAPORAN",
      icon: FileSpreadsheet,
      href: "/dashboard/admin/laporan",
      show: role === "admin",
    },
  ]

  const searchHref = role === "admin" ? "/dashboard/events" : "/dashboard/anggota/events"

  return (
    <aside className={cn(
      "liquid-sidebar w-64 max-w-[250px] flex flex-col h-screen fixed left-0 top-0 z-50 transition-transform duration-300 lg:left-4 lg:top-4 lg:h-[calc(100vh-2rem)] lg:rounded-[1.75rem] lg:border",
      isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
    )}>
      <div className="p-6 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity" onClick={() => setIsOpen?.(false)}>
          <div className="liquid-button w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
             <span className="font-bold text-white text-sm">GWG</span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight leading-none">
              UKM PSM
            </h2>
            <p className="text-[10px] text-slate-500 font-medium tracking-wider mt-1 uppercase">Gita Widya Giri</p>
          </div>
        </Link>
        <button onClick={() => setIsOpen?.(false)} className="lg:hidden p-1 text-slate-400 hover:text-white transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>

      <form action={searchHref} className="px-4 lg:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            name="q"
            placeholder={role === "admin" ? "Cari event..." : "Cari event aktif..."}
            className="liquid-input h-10 w-full rounded-xl pl-10 pr-3 text-sm text-white outline-none transition-colors placeholder:text-slate-500"
          />
        </div>
      </form>

      <div className="flex-1 px-4 mt-6 overflow-y-auto">
        <div className="space-y-1">
          {memberRoutes.filter((route) => route.show).map((route) => {
            const isActive = hasMounted && (
              pathname === route.href ||
              (route.href !== "/dashboard" && route.href !== "/dashboard/anggota" && route.href !== "#" && pathname.startsWith(route.href))
            )
            return (
              <Link
                key={route.title}
                href={route.href}
                onClick={() => setIsOpen?.(false)}
                className={cn(
                  "liquid-nav-item flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative",
                  isActive
                    ? "text-white bg-[#ffffff0a] font-semibold"
                    : "text-slate-400 hover:text-white font-medium"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-violet-500 rounded-r-md" />
                )}
                <route.icon className={cn("h-5 w-5", isActive ? "text-violet-400" : "text-slate-500 group-hover:text-slate-300 transition-colors")} />
                <span className="text-xs uppercase tracking-wider">{route.title}</span>
              </Link>
            )
          })}
        </div>

        {role === "admin" && (
          <div className="mt-8 space-y-1">
            <p className="px-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Admin Panel</p>
            {adminRoutes.map((route) => {
              const isActive = hasMounted && (pathname === route.href || (route.href !== "/dashboard" && pathname.startsWith(route.href)))
              return (
                <Link
                  key={route.title}
                  href={route.href}
                  onClick={() => setIsOpen?.(false)}
                  className={cn(
                  "liquid-nav-item flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative",
                    isActive
                      ? "text-white bg-[#ffffff0a] font-semibold"
                      : "text-slate-400 hover:text-white font-medium"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-violet-500 rounded-r-md" />
                  )}
                  <route.icon className={cn("h-5 w-5", isActive ? "text-violet-400" : "text-slate-500 group-hover:text-slate-300 transition-colors")} />
                  <span className="text-xs uppercase tracking-wider">{route.title}</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <div className="p-4 mt-auto border-t border-[#ffffff0a]">
        <form action="/api/auth/signout" method="post">
          <button
            type="submit"
            className="liquid-nav-item w-full flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-red-400 transition-colors rounded-xl hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-xs font-semibold tracking-wider uppercase">Keluar</span>
          </button>
        </form>
      </div>
    </aside>
  )
}
