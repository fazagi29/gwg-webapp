"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

export async function createEvent(formData: FormData) {
  try {
    const session = await auth()
    if (session?.user?.role !== "admin") {
      throw new Error("Unauthorized")
    }

    const nama = formData.get("nama") as string
    const deskripsi = formData.get("deskripsi") as string
    const lokasi = formData.get("lokasi") as string
    const tanggal_pentas = formData.get("tanggal_pentas") as string
    const kategori = formData.get("kategori") as string

    if (!nama) {
      throw new Error("Nama event tidak boleh kosong")
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!adminUser) {
      throw new Error("Akun sesi admin Anda tidak ditemukan (mungkin terhapus di database). Silakan logout dan login kembali.")
    }

    const event = await prisma.event.create({
      data: {
        nama,
        deskripsi: deskripsi || null,
        lokasi: lokasi || null,
        tanggal_pentas: tanggal_pentas ? new Date(tanggal_pentas) : null,
        kategori: kategori || null,
        created_by: session.user.id as string,
        status: "persiapan"
      }
    })

    revalidatePath("/dashboard/events")
    return { success: true, eventId: event.id }
  } catch (error: unknown) {
    return { error: (error instanceof Error ? error.message : String(error)) || "Terjadi kesalahan internal saat membuat event" }
  }
}

export async function addMemberToEvent(eventId: string, userId: string, peran: string = "penyanyi", bagian_suara?: string) {
  try {
    const session = await auth()
    if (session?.user?.role !== "admin") {
      throw new Error("Unauthorized")
    }

    await prisma.eventMember.create({
      data: {
        event_id: eventId,
        user_id: userId,
        peran: peran,
        bagian_suara_event: bagian_suara || null
      }
    })

    revalidatePath(`/dashboard/events/${eventId}`)
    return { success: true }
  } catch (error: unknown) {
    return { error: (error instanceof Error ? error.message : String(error)) || "Gagal menambah anggota ke event" }
  }
}

export async function removeMemberFromEvent(eventId: string, userId: string) {
  try {
    const session = await auth()
    if (session?.user?.role !== "admin") {
      throw new Error("Unauthorized")
    }

    await prisma.eventMember.delete({
      where: {
        event_id_user_id: { event_id: eventId, user_id: userId }
      }
    })

    revalidatePath(`/dashboard/events/${eventId}`)
    return { success: true }
  } catch (error: unknown) {
    return { error: "Gagal menghapus anggota dari event" }
  }
}

export async function updateEvent(eventId: string, formData: FormData) {
  try {
    const session = await auth()
    if (session?.user?.role !== "admin") {
      throw new Error("Unauthorized")
    }

    const nama = formData.get("nama") as string
    const deskripsi = formData.get("deskripsi") as string
    const lokasi = formData.get("lokasi") as string
    const tanggal_pentas = formData.get("tanggal_pentas") as string
    const kategori = formData.get("kategori") as string

    if (!nama) throw new Error("Nama event tidak boleh kosong")

    await prisma.event.update({
      where: { id: eventId },
      data: {
        nama,
        deskripsi: deskripsi || null,
        lokasi: lokasi || null,
        tanggal_pentas: tanggal_pentas ? new Date(tanggal_pentas) : null,
        kategori: kategori || null,
      }
    })

    revalidatePath("/dashboard/events")
    revalidatePath(`/dashboard/events/${eventId}`)
    return { success: true }
  } catch (error: unknown) {
    return { error: (error instanceof Error ? error.message : String(error)) || "Terjadi kesalahan internal" }
  }
}

export async function deleteEvent(eventId: string) {
  try {
    const session = await auth()
    if (session?.user?.role !== "admin") {
      throw new Error("Unauthorized")
    }

    await prisma.event.delete({
      where: { id: eventId }
    })

    revalidatePath("/dashboard/events")
    return { success: true }
  } catch (error: unknown) {
    return { error: (error instanceof Error ? error.message : String(error)) || "Gagal menghapus event" }
  }
}

const VALID_SECTION_KEYS = ["partitur_info", "dresscode_info", "media_info", "rundown_info"] as const
type SectionKey = typeof VALID_SECTION_KEYS[number]

export async function updateEventSection(eventId: string, sectionKey: string, content: string) {
  try {
    const session = await auth()
    if (session?.user?.role !== "admin") throw new Error("Unauthorized")

    if (!VALID_SECTION_KEYS.includes(sectionKey as SectionKey)) {
      throw new Error("Section key tidak valid")
    }

    await prisma.event.update({
      where: { id: eventId },
      data: { [sectionKey]: content || null },
    })

    revalidatePath(`/dashboard/events/${eventId}`)
    return { success: true }
  } catch (error: unknown) {
    return { error: (error instanceof Error ? error.message : String(error)) || "Gagal menyimpan section" }
  }
}
