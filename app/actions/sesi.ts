"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

export async function createSesi(formData: FormData) {
  try {
    const session = await auth()
    if (session?.user?.role !== "admin") {
      throw new Error("Unauthorized")
    }

    const eventId = formData.get("event_id") as string
    const judul = formData.get("judul") as string
    const waktu_mulai = formData.get("waktu_mulai") as string
    const waktu_selesai = formData.get("waktu_selesai") as string
    const lokasi = formData.get("lokasi") as string
    const catatan = formData.get("catatan") as string
    const durasi_ontime_menit = parseInt(formData.get("durasi_ontime_menit") as string) || 30

    if (!eventId || !judul || !waktu_mulai || !waktu_selesai) {
      throw new Error("Data wajib belum lengkap")
    }

    await prisma.sesiLatihan.create({
      data: {
        event_id: eventId,
        judul,
        waktu_mulai: new Date(waktu_mulai),
        waktu_selesai: new Date(waktu_selesai),
        lokasi: lokasi || null,
        catatan: catatan || null,
        status: "terjadwal",
        durasi_ontime_menit
      }
    })

    revalidatePath(`/dashboard/events/${eventId}`)
    return { success: true }
  } catch (error: unknown) {
    return { error: (error instanceof Error ? error.message : String(error)) || "Terjadi kesalahan saat membuat sesi" }
  }
}

export async function openAbsensi(sesiId: string, eventId: string) {
  try {
    const session = await auth()
    if (session?.user?.role !== "admin") {
      throw new Error("Unauthorized")
    }

    // Generate random 4 alphanumeric code
    const kode = Math.random().toString(36).substring(2, 6).toUpperCase()
    
    // Valid for 2 hours
    const expiredAt = new Date()
    expiredAt.setHours(expiredAt.getHours() + 2)

    await prisma.sesiLatihan.update({
      where: { id: sesiId },
      data: {
        status: "berlangsung",
        kode_absen: kode,
        kode_expired_at: expiredAt,
        dibuka_oleh: session.user.id as string
      }
    })

    revalidatePath(`/dashboard/events/${eventId}`)
    return { success: true, kode }
  } catch (error: unknown) {
    return { error: "Gagal membuka sesi absensi" }
  }
}

export async function submitAbsensi(kode: string, eventId: string) {
  try {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    // Find any active session in this event that has the matching code and is not expired
    const activeSesions = await prisma.sesiLatihan.findMany({
      where: {
        event_id: eventId,
        kode_absen: kode.toUpperCase(),
        kode_expired_at: {
          gt: new Date()
        }
      }
    })

    if (activeSesions.length === 0) {
      return { error: "Kode absensi salah atau sudah kedaluwarsa!" }
    }

    const sesi = activeSesions[0]
    const sesi_id = sesi.id
    const user_id = session.user.id as string

    // Kalkulasi Keterlambatan
    // Batas ontime adalah waktu_mulai + durasi_ontime_menit
    const batasOntime = new Date(sesi.waktu_mulai)
    batasOntime.setMinutes(batasOntime.getMinutes() + sesi.durasi_ontime_menit)
    
    // Status Terlambat jika waktu absen sekarang > batasOntime
    const statusHadiran = new Date() > batasOntime ? "terlambat" : "hadir"

    // Insert or update absensi
    await prisma.absensi.upsert({
      where: {
        sesi_id_user_id: {
          sesi_id,
          user_id
        }
      },
      create: {
        sesi_id,
        user_id,
        status: statusHadiran,
        metode: "kode_manual",
        waktu_absen: new Date()
      },
      update: {
        status: statusHadiran,
        waktu_absen: new Date(),
        metode: "kode_manual"
      }
    })

    revalidatePath(`/dashboard/events/${eventId}`)
    return { success: true, statusKehadiran: statusHadiran }
  } catch (error: unknown) {
    return { error: (error instanceof Error ? error.message : String(error)) || "Gagal melakukan absensi" }
  }
}

export async function updateAdminAbsensi(sesiId: string, userId: string, status: string, eventId: string) {
  try {
    const session = await auth()
    if (session?.user?.role !== "admin") throw new Error("Unauthorized")

    await prisma.absensi.upsert({
      where: {
        sesi_id_user_id: {
          sesi_id: sesiId,
          user_id: userId
        }
      },
      create: {
        sesi_id: sesiId,
        user_id: userId,
        status: status,
        metode: "admin",
        waktu_absen: new Date()
      },
      update: {
        status: status,
        metode: "admin"
        // kita tidak update waktu_absen karena admin yg mengubah, kecuali diinginkan.
      }
    })

    revalidatePath(`/dashboard/events/${eventId}/sesi/${sesiId}`)
    return { success: true }
  } catch (error: unknown) {
    return { error: (error instanceof Error ? error.message : String(error)) || "Gagal mengubah absensi" }
  }
}
