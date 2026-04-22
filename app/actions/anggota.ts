"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

export async function createAnggota(formData: FormData) {
  try {
    const session = await auth()
    if (session?.user?.role !== "admin") {
      throw new Error("Unauthorized")
    }

    const nama = formData.get("nama") as string
    const email = formData.get("email") as string
    const role = formData.get("role") as string
    const bagian_suara = formData.get("bagian_suara") as string
    const password = formData.get("password") as string || "choir123" // default password

    if (!nama || !email || !role) {
      throw new Error("Invalid form data")
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return { error: "Email sudah terdaftar!" }
    }

    const password_hash = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        nama,
        email,
        role,
        bagian_suara: bagian_suara || null,
        password_hash,
      }
    })

    revalidatePath("/dashboard/admin/anggota")
    return { success: true }
  } catch (error: unknown) {
    console.error("Create anggota error:", error)
    return { error: error instanceof Error ? error.message : String(error) || "Terjadi kesalahan internal" }
  }
}

export async function toggleAnggotaStatus(userId: string, currentStatus: boolean) {
  try {
    const session = await auth()
    if (session?.user?.role !== "admin") {
      throw new Error("Unauthorized")
    }

    await prisma.user.update({
      where: { id: userId },
      data: { is_active: !currentStatus }
    })

    revalidatePath("/dashboard/admin/anggota")
    return { success: true }
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : String(error) || "Gagal mengubah status" }
  }
}

export async function updateAnggota(userId: string, formData: FormData) {
  try {
    const session = await auth()
    if (session?.user?.role !== "admin") {
      throw new Error("Unauthorized")
    }

    const nama = formData.get("nama") as string
    const email = formData.get("email") as string
    const role = formData.get("role") as string
    const bagian_suara = formData.get("bagian_suara") as string | null
    const foto_url = formData.get("foto_url") as string | null
    const tempat_tanggal_lahir = formData.get("tempat_tanggal_lahir") as string | null
    const domisili = formData.get("domisili") as string | null

    if (!nama || !email || !role) {
      throw new Error("Data wajib tidak lengkap")
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        nama,
        email,
        role,
        bagian_suara: bagian_suara || null,
        foto_url: foto_url || null,
        tempat_tanggal_lahir: tempat_tanggal_lahir || null,
        domisili: domisili || null
      }
    })

    revalidatePath("/dashboard/admin/anggota")
    return { success: true }
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : String(error) || "Gagal memperbarui anggota" }
  }
}

export async function deleteAnggota(userId: string) {
  try {
    const session = await auth()
    if (session?.user?.role !== "admin") {
      throw new Error("Unauthorized")
    }

    await prisma.user.delete({
      where: { id: userId }
    })

    revalidatePath("/dashboard/admin/anggota")
    return { success: true }
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : String(error) || "Gagal menghapus anggota" }
  }
}

export async function updateProfilSaya(formData: FormData) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      throw new Error("Unauthorized")
    }
    const userId = session.user.id as string

    const nama = formData.get("nama") as string
    const no_hp = formData.get("no_hp") as string | null
    const bagian_suara = formData.get("bagian_suara") as string | null
    const angkatan = formData.get("angkatan") as string | null
    const foto_url = formData.get("foto_url") as string | null
    const tempat_tanggal_lahir = formData.get("tempat_tanggal_lahir") as string | null
    const domisili = formData.get("domisili") as string | null

    if (!nama) throw new Error("Nama tidak boleh kosong")

    await prisma.user.update({
      where: { id: userId },
      data: {
        nama,
        no_hp: no_hp || null,
        bagian_suara: bagian_suara || null,
        angkatan: angkatan || null,
        foto_url: foto_url || null,
        tempat_tanggal_lahir: tempat_tanggal_lahir || null,
        domisili: domisili || null
      }
    })

    revalidatePath("/dashboard/profil")
    return { success: true }
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : String(error) || "Gagal memperbarui profil" }
  }
}
