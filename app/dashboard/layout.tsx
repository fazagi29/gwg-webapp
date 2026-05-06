import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { DashboardClientLayout } from "./client-layout"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="liquid-dashboard-bg flex h-dvh text-slate-50 overflow-hidden relative">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(91,66,190,0.24),transparent_34%),radial-gradient(circle_at_78%_20%,rgba(22,119,130,0.16),transparent_32%)] pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-black/30 to-transparent pointer-events-none" />

      <DashboardClientLayout user={session.user}>
        {children}
      </DashboardClientLayout>
    </div>
  )
}
