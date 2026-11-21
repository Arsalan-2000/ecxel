import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

export const runtime = "nodejs";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "فایلی ارسال نشده است" }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "فقط فایل تصویری مجاز است" }, { status: 400 });
    }
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "حجم فایل باید کمتر از ۸ مگابایت باشد" }, { status: 400 });
    }
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const ext = path.extname(file.name) || ".png";
    const safeExt = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".bmp"].includes(ext.toLowerCase())
      ? ext.toLowerCase()
      : ".png";
    const name = `${crypto.randomUUID()}${safeExt}`;
    const buf = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(UPLOAD_DIR, name), buf);
    return NextResponse.json({ url: `/uploads/${name}`, name: file.name });
  } catch (e) {
    return NextResponse.json(
      { error: "خطا در آپلود فایل: " + (e instanceof Error ? e.message : String(e)) },
      { status: 500 }
    );
  }
}
