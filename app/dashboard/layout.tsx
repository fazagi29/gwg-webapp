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
    <div className="flex min-h-screen bg-slate-950 text-slate-50 overflow-hidden relative">
      {/* Background ambient lighting */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-900/20 blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[120px] mix-blend-screen pointer-events-none" />

      <DashboardClientLayout user={session.user}>
        {children}
      </DashboardClientLayout>
    </div>
  )
}
