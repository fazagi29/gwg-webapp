"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

export async function createPartitur(formData: FormData) {
  try {
    const session = await auth()
    if (session?.user?.role !== "admin") throw new Error("Unauthorized")

    const judul = formData.get("judul") as string
    const tahunRaw = formData.get("tahun") as string
    const komposer = formData.get("komposer") as string
    const arranger = formData.get("arranger") as string
    const asal_lagu = formData.get("asal_lagu") as string
    const file_url = formData.get("file_url") as string

    if (!judul) throw new Error("Judul partitur tidak boleh kosong")

    const parsedTahun = tahunRaw && !isNaN(parseInt(tahunRaw.trim())) ? parseInt(tahunRaw.trim()) : null

    await prisma.partitur.create({
      data: {
        judul,
        tahun: parsedTahun,
        komposer: komposer || null,
        arranger: arranger || null,
        asal_lagu: asal_lagu || null,
        file_url: file_url || null,
      },
    })

    revalidatePath("/dashboard/partitur")
    return { success: true }
  } catch (error: unknown) {
    return { error: (error instanceof Error ? error.message : String(error)) || "Gagal menambah partitur" }
  }
}

export async function updatePartitur(id: string, formData: FormData) {
  try {
    const session = await auth()
    if (session?.user?.role !== "admin") throw new Error("Unauthorized")

    const judul = formData.get("judul") as string
    const tahunRaw = formData.get("tahun") as string
    const komposer = formData.get("komposer") as string
    const arranger = formData.get("arranger") as string
    const asal_lagu = formData.get("asal_lagu") as string
    const file_url = formData.get("file_url") as string

    if (!judul) throw new Error("Judul tidak boleh kosong")

    const parsedTahun = tahunRaw && !isNaN(parseInt(tahunRaw.trim())) ? parseInt(tahunRaw.trim()) : null

    await prisma.partitur.update({
      where: { id },
      data: {
        judul,
        tahun: parsedTahun,
        komposer: komposer || null,
        arranger: arranger || null,
        asal_lagu: asal_lagu || null,
        file_url: file_url || null,
      },
    })

    revalidatePath("/dashboard/partitur")
    return { success: true }
  } catch (error: unknown) {
    return { error: (error instanceof Error ? error.message : String(error)) || "Gagal mengupdate partitur" }
  }
}

export async function deletePartitur(id: string) {
  try {
    const session = await auth()
    if (session?.user?.role !== "admin") throw new Error("Unauthorized")

    await prisma.partitur.delete({ where: { id } })

    revalidatePath("/dashboard/partitur")
    return { success: true }
  } catch (error: unknown) {
    return { error: (error instanceof Error ? error.message : String(error)) || "Gagal menghapus partitur" }
  }
}
