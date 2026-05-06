"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { TopNav } from "@/components/dashboard/top-nav"
import { Menu } from "lucide-react"

interface UserProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
}

export function DashboardClientLayout({
  children,
  user
}: {
  children: React.ReactNode,
  user: UserProps | null | undefined
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, left: 0 })
    window.scrollTo({ top: 0, left: 0 })
  }, [pathname])

  return (
    <>
      <AppSidebar 
        role={user?.role as string} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />
      
      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="liquid-overlay fixed inset-0 z-40 lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {!isSidebarOpen && (
        <button
          type="button"
          aria-label="Buka menu navigasi"
          onClick={() => setIsSidebarOpen(true)}
          className="liquid-button fixed left-4 top-4 z-50 inline-flex h-11 w-11 items-center justify-center rounded-xl text-white transition-transform hover:scale-105 active:scale-95 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      {/* Main Content Space */}
      <div className="flex-1 lg:ml-72 flex min-h-0 flex-col h-dvh overflow-hidden z-10 relative w-full">
        <TopNav user={user} />
        
        <main ref={mainRef} className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth w-full">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </>
  )
}
