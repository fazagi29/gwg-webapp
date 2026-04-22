"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { TopNav } from "@/components/dashboard/top-nav"

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
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Space */}
      <div className="flex-1 lg:ml-64 flex flex-col h-screen overflow-hidden z-10 relative w-full">
        <TopNav user={user} onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth w-full">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </>
  )
}
