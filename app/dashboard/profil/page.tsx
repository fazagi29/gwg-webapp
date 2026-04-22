import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { redirect } from "next/navigation"
import { ProfilForm } from "./client-form"

export default async function ProfilPage() {
  const session = await auth()
  if (!session?.user) redirect("/")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id as string }
  })

  if (!user) return null

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Profil Saya</h1>
        <p className="text-slate-400">Kelola informasi personal dan data keanggotaan Anda di UKM Choir.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 items-start">
        <Card className="bg-white/5 border-white/10 backdrop-blur-xl md:col-span-1 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-br from-violet-600/40 to-blue-600/40" />
          <CardContent className="pt-12 flex flex-col items-center text-center relative z-10">
            <div className="h-28 w-28 rounded-full bg-slate-900 border-4 border-slate-900 shadow-xl overflow-hidden mb-4 flex items-center justify-center p-1 bg-gradient-to-tr from-violet-500 to-blue-500">
              <div className="h-full w-full rounded-full bg-slate-900 overflow-hidden text-center flex justify-center items-center font-bold text-3xl">
                {user.foto_url ? (
                  <img src={user.foto_url} alt={user.nama} className="h-full w-full object-cover" />
                ) : (
                  <span>{user.nama.charAt(0).toUpperCase()}</span>
                )}
              </div>
            </div>
            <h3 className="font-bold text-xl text-white mb-1">{user.nama}</h3>
            <p className="text-slate-400 text-sm mb-4">{user.email}</p>
            <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 uppercase tracking-widest text-xs font-bold">
              {user.role}
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-xl md:col-span-2 shadow-2xl">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle className="text-white">Informasi Personal</CardTitle>
            <CardDescription className="text-slate-400">
              Pastikan data Anda selalu *up-to-date*.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ProfilForm user={user} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
