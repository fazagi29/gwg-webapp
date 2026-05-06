"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

export async function submitPengajuanIzin(sesiId: string, alasan: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const userId = session.user.id as string

    if (!sesiId || !alasan.trim()) {
      throw new Error("Data izin tidak lengkap")
    }

    // Check if sesi exists
    const sesi = await prisma.sesiLatihan.findUnique({
      where: { id: sesiId },
      include: { event: true }
    })

    if (!sesi) {
      throw new Error("Sesi latihan tidak ditemukan")
    }

    // Check if user already submitted izin for this session
    const existingIzin = await prisma.pengajuanIzin.findFirst({
      where: {
        sesi_id: sesiId,
        user_id: userId,
        status_izin: "menunggu"
      }
    })

    if (existingIzin) {
      throw new Error("Anda sudah mengajukan izin untuk sesi ini")
    }

    // Check if user already has attendance record
    const existingAbsensi = await prisma.absensi.findUnique({
      where: {
        sesi_id_user_id: {
          sesi_id: sesiId,
          user_id: userId
        }
      }
    })

    if (existingAbsensi && existingAbsensi.status !== "izin") {
      throw new Error("Anda sudah tercatat hadir/absen untuk sesi ini")
    }

    // Create pengajuan izin
    await prisma.pengajuanIzin.create({
      data: {
        sesi_id: sesiId,
        user_id: userId,
        alasan,
        status_izin: "menunggu"
      }
    })

    revalidatePath("/dashboard/presensi")
    return { success: true }
  } catch (error: unknown) {
    return { 
      error: error instanceof Error ? error.message : "Gagal mengajukan izin" 
    }
  }
}

export async function getPengajuanIzinByUser(userId: string) {
  try {
    const izin = await prisma.pengajuanIzin.findMany({
      where: { user_id: userId },
      orderBy: { diajukan_at: "desc" },
      include: {
        sesi: { include: { event: true } },
        approver: true
      }
    })
    return izin
  } catch (error: unknown) {
    console.error("Error fetching izin:", error)
    return []
  }
}

export async function getPengajuanIzinList(filters?: { status?: string; eventId?: string }) {
  try {
    const session = await auth()
    if (session?.user?.role !== "admin") throw new Error("Unauthorized")

    const izinList = await prisma.pengajuanIzin.findMany({
      where: {
        ...(filters?.status && { status_izin: filters.status }),
        ...(filters?.eventId && { sesi: { event_id: filters.eventId } })
      },
      orderBy: { diajukan_at: "desc" },
      include: {
        user: true,
        sesi: { include: { event: true } },
        approver: true
      }
    })
    return izinList
  } catch (error: unknown) {
    console.error("Error fetching izin list:", error)
    return []
  }
}

export async function approvePengajuanIzin(izinId: string, eventId: string) {
  try {
    const session = await auth()
    if (session?.user?.role !== "admin") throw new Error("Unauthorized")

    const adminId = session.user.id as string

    const izin = await prisma.pengajuanIzin.findUnique({
      where: { id: izinId }
    })

    if (!izin) throw new Error("Pengajuan izin tidak ditemukan")

    // Update izin status
    await prisma.pengajuanIzin.update({
      where: { id: izinId },
      data: {
        status_izin: "disetujui",
        disetujui_oleh: adminId,
        diproses_at: new Date()
      }
    })

    // Create or update absensi with status izin
    await prisma.absensi.upsert({
      where: {
        sesi_id_user_id: {
          sesi_id: izin.sesi_id,
          user_id: izin.user_id
        }
      },
      create: {
        sesi_id: izin.sesi_id,
        user_id: izin.user_id,
        status: "izin",
        metode: "admin",
        waktu_absen: new Date(),
        keterangan: izin.alasan
      },
      update: {
        status: "izin",
        metode: "admin",
        keterangan: izin.alasan
      }
    })

    revalidatePath("/dashboard/admin/laporan")
    revalidatePath("/dashboard/presensi")
    return { success: true }
  } catch (error: unknown) {
    return { 
      error: error instanceof Error ? error.message : "Gagal menyetujui izin" 
    }
  }
}

export async function rejectPengajuanIzin(izinId: string, eventId: string) {
  try {
    const session = await auth()
    if (session?.user?.role !== "admin") throw new Error("Unauthorized")

    const adminId = session.user.id as string

    const izin = await prisma.pengajuanIzin.findUnique({
      where: { id: izinId }
    })

    if (!izin) throw new Error("Pengajuan izin tidak ditemukan")

    // Update izin status
    await prisma.pengajuanIzin.update({
      where: { id: izinId },
      data: {
        status_izin: "ditolak",
        disetujui_oleh: adminId,
        diproses_at: new Date()
      }
    })

    revalidatePath("/dashboard/admin/laporan")
    return { success: true }
  } catch (error: unknown) {
    return { 
      error: error instanceof Error ? error.message : "Gagal menolak izin" 
    }
  }
}
