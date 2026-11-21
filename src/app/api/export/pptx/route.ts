import { NextRequest, NextResponse } from "next/server";
import PptxGenJS from "pptxgenjs";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

// Canvas logical size: 960 x 540 (16:9). PPTX uses inches: 13.333 x 7.5.
const CANVAS_W = 960;
const CANVAS_H = 540;
const SLIDE_W_IN = 13.333;
const SLIDE_H_IN = 7.5;
const scale = SLIDE_W_IN / CANVAS_W; // same scale for both dims

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) {
    h = h.split("").map((c) => c + c).join("");
  }
  const num = parseInt(h, 16);
  if (isNaN(num)) return { r: 0, g: 0, b: 0 };
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function isHex(hex: string) {
  return /^#?[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(hex.trim());
}

async function imageToDataUrl(filePath: string): Promise<string | null> {
  try {
    const abs = filePath.startsWith("/uploads/")
      ? path.join(process.cwd(), "public", filePath)
      : filePath;
    if (!fs.existsSync(abs)) return null;
    const buf = fs.readFileSync(abs);
    const ext = path.extname(abs).toLowerCase();
    const mime =
      ext === ".png" ? "image/png" :
      ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" :
      ext === ".gif" ? "image/gif" :
      ext === ".webp" ? "image/webp" :
      ext === ".bmp" ? "image/bmp" :
      ext === ".svg" ? "image/svg+xml" : "image/png";
    if (mime === "image/svg+xml") {
      // pptxgenjs supports svg, but data url must be svg
      const text = buf.toString("utf-8");
      const b64 = Buffer.from(text).toString("base64");
      return `data:image/svg+xml;base64,${b64}`;
    }
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const title: string = body.title || "ارائه";
    const slides: any[] = body.slides || [];

    const pptx = new PptxGenJS();
    pptx.defineLayout({ name: "CUSTOM", width: SLIDE_W_IN, height: SLIDE_H_IN });
    pptx.layout = "CUSTOM";
    pptx.title = title;
    pptx.author = "Slide Editor";
    pptx.rtlMode = true;

    for (const slide of slides) {
      const s = pptx.addSlide();
      s.background = { color: isHex(slide.background) ? slide.background.replace("#", "") : "FFFFFF" };

      // sort elements by zIndex ascending so higher z draws on top
      const elements = [...(slide.elements || [])].sort((a, b) => a.zIndex - b.zIndex);

      for (const el of elements) {
        const x = el.x * scale;
        const y = el.y * scale;
        const w = el.width * scale;
        const h = el.height * scale;
        const rot = el.rotation || 0;

        if (el.type === "text") {
          const color = isHex(el.color) ? el.color.replace("#", "") : "1F2937";
          const bg = el.backgroundColor && el.backgroundColor !== "transparent" && isHex(el.backgroundColor)
            ? { color: el.backgroundColor.replace("#", "") }
            : undefined;
          const align = el.textAlign === "left" ? "left" : el.textAlign === "center" ? "center" : "right";
          const bold = el.fontWeight === "bold";
          const italic = el.fontStyle === "italic";
          const underline = el.textDecoration === "underline";
          const strike = el.textDecoration === "line-through";
          // Use Vazirmatn / Tahoma fallback for Persian
          const fontFace = el.fontFamily && el.fontFamily.length > 0 ? el.fontFamily.split(",")[0].trim() : "Tahoma";
          s.addText(el.content || "", {
            x, y, w, h,
            fontSize: el.fontSize,
            color,
            fontFace,
            bold,
            italic,
            underline,
            strike,
            align,
            valign: "top",
            rotate: rot,
            fill: bg,
            lineSpacingMultiple: el.lineSpacing || 1.2,
            margin: (el.padding || 8) * scale,
            wrap: true,
            rtlMode: true,
          });
        } else if (el.type === "image") {
          const dataUrl = await imageToDataUrl(el.src);
          if (dataUrl) {
            const sizing =
              el.objectFit === "cover" ? { type: "cover", w: w, h: h } :
              el.objectFit === "contain" ? { type: "contain", w: w, h: h } :
              undefined;
            s.addImage({
              data: dataUrl,
              x, y, w, h,
              rotate: rot,
              rounding: el.borderRadius > 0,
              sizing,
              transparency: el.opacity != null ? Math.round((1 - el.opacity) * 100) : 0,
            });
          }
        } else if (el.type === "shape") {
          const fill = isHex(el.fill) ? el.fill.replace("#", "") : "F59E0B";
          const stroke = isHex(el.stroke) ? el.stroke.replace("#", "") : "92400E";
          const shapeType = el.shape === "ellipse" ? pptx.ShapeType.ellipse : pptx.ShapeType.rect;
          s.addShape(shapeType, {
            x, y, w, h,
            rotate: rot,
            fill: { color: fill, transparency: el.opacity != null ? Math.round((1 - el.opacity) * 100) : 0 },
            line: el.strokeWidth > 0 ? { color: stroke, width: el.strokeWidth } : undefined,
            rectRadius: el.borderRadius ? el.borderRadius * scale : undefined,
          });
        }
      }
    }

    const buffer = (await pptx.write({ outputType: "nodebuffer" })) as Buffer;
    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(title)}.pptx"`,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: "خطا در ساخت پاورپوینت: " + (e instanceof Error ? e.message : String(e)) },
      { status: 500 }
    );
  }
}
