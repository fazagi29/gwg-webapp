"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EditAnggotaDialog, DeleteAnggotaDialog } from "./edit-delete-dialog"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

import { User } from "@prisma/client"
import  Image  from "next/image"

export function AnggotaClientTable({ initialUsers }: { initialUsers: User[] }) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)

  const sortedUsers = [...initialUsers].sort((a, b) => {
    if (!sortConfig) return 0
    const { key, direction } = sortConfig
    let comparison = 0

    if (key === 'nama') {
      comparison = a.nama.localeCompare(b.nama)
    } else if (key === 'email') {
      comparison = a.email.localeCompare(b.email)
    } else if (key === 'peran') {
      comparison = a.role.localeCompare(b.role)
    } else if (key === 'status') {
      comparison = (a.is_active === b.is_active) ? 0 : a.is_active ? -1 : 1
    }

    return direction === 'asc' ? comparison : -comparison
  })

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    } else if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
      // Clear sort if clicked a third time
      setSortConfig(null)
      return
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (columnKey: string) => {
    if (sortConfig?.key === columnKey) {
      return sortConfig.direction === 'asc' ? <ArrowUp className="ml-2 h-4 w-4 shrink-0" /> : <ArrowDown className="ml-2 h-4 w-4 shrink-0" />
    }
    return <ArrowUpDown className="ml-2 h-4 w-4 opacity-30 shrink-0 group-hover:opacity-100 transition-opacity" />
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
      <Table className="min-w-200">
        <TableHeader className="bg-black/20 border-b border-white/5">
          <TableRow className="hover:bg-transparent border-none">
            <TableHead 
              className="text-slate-400 cursor-pointer group hover:text-white transition-colors py-4 px-4"
              onClick={() => requestSort('nama')}
            >
              <div className="flex items-center">
                Nama Pengguna {getSortIcon('nama')}
              </div>
            </TableHead>
            <TableHead 
              className="text-slate-400 cursor-pointer group hover:text-white transition-colors"
              onClick={() => requestSort('email')}
            >
              <div className="flex items-center">
                Email {getSortIcon('email')}
              </div>
            </TableHead>
            <TableHead 
              className="text-slate-400 cursor-pointer group hover:text-white transition-colors"
              onClick={() => requestSort('peran')}
            >
              <div className="flex items-center">
                Peran & Suara {getSortIcon('peran')}
              </div>
            </TableHead>
            <TableHead 
              className="text-slate-400 cursor-pointer group hover:text-white transition-colors"
              onClick={() => requestSort('status')}
            >
              <div className="flex items-center">
                Status {getSortIcon('status')}
              </div>
            </TableHead>
            <TableHead className="text-right text-slate-400 py-4 px-4">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedUsers.map((user) => (
            <TableRow key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
              <TableCell className="font-medium text-white flex items-center gap-3 py-4 px-4">
                <div className="h-10 w-10 rounded-full bg-linear-to-tr from-violet-500 to-blue-500 overflow-hidden p-0.5 shrink-0">
                  <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center">
                    {user.foto_url ? (
                      <Image src={user.foto_url} alt={user.nama} className="h-full w-full object-cover rounded-full" />
                    ) : (
                      <span className="text-xs font-bold">{user.nama.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                </div>
                {user.nama}
              </TableCell>
              <TableCell className="text-slate-300">{user.email}</TableCell>
              <TableCell>
                <div className="flex flex-col gap-1 items-start">
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 capitalize font-normal">{user.role}</Badge>
                  <span className="text-xs text-slate-400 capitalize">{user.bagian_suara || "Belum dipilih"}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={`${user.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'} border-none font-normal`}>
                  {user.is_active ? 'Aktif' : 'Nonaktif'}
                </Badge>
              </TableCell>
              <TableCell className="text-right px-4">
                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <EditAnggotaDialog user={user} />
                   <DeleteAnggotaDialog user={user} />
                </div>
              </TableCell>
            </TableRow>
          ))}
          
          {sortedUsers.length === 0 && (
            <TableRow>
               <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  Belum ada anggota.
               </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
