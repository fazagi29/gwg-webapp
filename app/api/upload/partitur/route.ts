import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { existsSync } from "fs"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 })
    }

    // Validasi: hanya PDF
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Hanya file PDF yang diizinkan" }, { status: 400 })
    }

    // Maksimum 20MB
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: "Ukuran file maksimum 20MB" }, { status: 400 })
    }

    // Buat folder jika belum ada
    const uploadDir = path.join(process.cwd(), "public", "partitur")
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Sanitasi nama file + tambah timestamp agar unik
    const sanitized = file.name
      .replace(/[^a-zA-Z0-9.\-_\s]/g, "")
      .replace(/\s+/g, "_")
    const filename = `${Date.now()}_${sanitized}`
    const filePath = path.join(uploadDir, filename)

    const bytes = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(bytes))

    const fileUrl = `/partitur/${filename}`
    return NextResponse.json({ url: fileUrl, filename })
  } catch (error: unknown) {
    console.error("[Upload Partitur Error]", error)
    return NextResponse.json({ error: "Gagal mengupload file" }, { status: 500 })
  }
}
