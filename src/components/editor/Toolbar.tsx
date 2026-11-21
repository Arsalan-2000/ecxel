"use client";

import { useState, useRef } from "react";
import { useEditorStore, createDefaultTextElement, createDefaultShapeElement } from "@/store/editorStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Type, Image as ImageIcon, Square, Circle, ZoomIn, ZoomOut, FileText, Presentation as PresentationIcon, Loader2, Save, FolderOpen, Trash } from "lucide-react";
import { toast } from "sonner";

export default function Toolbar({ zoom, setZoom }: { zoom: number; setZoom: (z: number) => void }) {
  const presentation = useEditorStore((s) => s.presentation);
  const currentSlideId = useEditorStore((s) => s.currentSlideId);
  const setTitle = useEditorStore((s) => s.setTitle);
  const addElement = useEditorStore((s) => s.addElement);
  const loadPresentation = useEditorStore((s) => s.loadPresentation);
  const newPresentation = useEditorStore((s) => s.newPresentation);

  const [exportingPptx, setExportingPptx] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addText = () => {
    if (!currentSlideId) return;
    addElement(currentSlideId, createDefaultTextElement() as any);
    toast.success("متن اضافه شد");
  };

  const addShape = (shape: "rectangle" | "ellipse") => {
    if (!currentSlideId) return;
    addElement(currentSlideId, createDefaultShapeElement(shape) as any);
    toast.success(shape === "rectangle" ? "مستطیل اضافه شد" : "بیضی اضافه شد");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentSlideId) return;
    if (!file.type.startsWith("image/")) {
      toast.error("فقط فایل تصویری مجاز است");
      e.target.value = "";
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error("حجم فایل باید کمتر از ۱۵ مگابایت باشد");
      e.target.value = "";
      return;
    }
    try {
      // Read file as data URL on the client (no server needed - works on any host)
      const dataUrl = await readFileAsDataURL(file);
      // Resize/compress to keep localStorage size reasonable (max ~1600px, JPEG 0.85)
      const compressed = await compressImage(dataUrl, file.type, 1600, 0.85);
      // Load image to get natural dimensions for default size
      const img = new Image();
      img.onload = () => {
        const maxW = 400;
        const maxH = 300;
        const ratio = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
        addElement(currentSlideId, {
          type: "image",
          x: 100,
          y: 100,
          width: Math.round(img.naturalWidth * ratio),
          height: Math.round(img.naturalHeight * ratio),
          rotation: 0,
          src: compressed,
          alt: file.name || "تصویر",
          objectFit: "cover",
          borderRadius: 8,
          opacity: 1,
        } as any);
        toast.success("تصویر اضافه شد");
      };
      img.onerror = () => {
        addElement(currentSlideId, {
          type: "image",
          x: 100,
          y: 100,
          width: 320,
          height: 200,
          rotation: 0,
          src: compressed,
          alt: file.name || "تصویر",
          objectFit: "cover",
          borderRadius: 8,
          opacity: 1,
        } as any);
        toast.success("تصویر اضافه شد");
      };
      img.src = compressed;
    } catch (err) {
      console.error(err);
      toast.error("خطا در پردازش تصویر: " + (err instanceof Error ? err.message : ""));
    } finally {
      e.target.value = "";
    }
  };

  const exportPptx = async () => {
    setExportingPptx(true);
    try {
      const res = await fetch("/api/export/pptx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: presentation.title,
          slides: presentation.slides,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        toast.error(j.error || "خطا در ساخت پاورپوینت");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${presentation.title || "presentation"}.pptx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("فایل پاورپوینت دانلود شد");
    } catch (err) {
      toast.error("خطا در ساخت پاورپوینت");
    } finally {
      setExportingPptx(false);
    }
  };

  const exportPdf = async () => {
    setExportingPdf(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const html2canvas = (await import("html2canvas")).default;

      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [960, 540], compress: true });
      const slides = presentation.slides;
      // Render each slide onto a hidden export container with explicit colors
      // (html2canvas 1.x can't parse oklch/lab from Tailwind 4 variables).
      for (let i = 0; i < slides.length; i++) {
        const node = document.createElement("div");
        node.style.width = "960px";
        node.style.height = "540px";
        node.style.position = "fixed";
        node.style.left = "-9999px";
        node.style.top = "0";
        node.style.background = slides[i].background;
        node.style.color = "#000000";
        node.style.overflow = "hidden";
        node.style.fontFamily = "Tahoma, sans-serif";
        node.dir = "rtl";

        const sorted = [...slides[i].elements].sort((a, b) => a.zIndex - b.zIndex);
        for (const el of sorted) {
          const child = document.createElement("div");
          child.style.position = "absolute";
          child.style.left = `${el.x}px`;
          child.style.top = `${el.y}px`;
          child.style.width = `${el.width}px`;
          child.style.height = `${el.height}px`;
          child.style.transform = `rotate(${el.rotation || 0}deg)`;
          child.style.transformOrigin = "center center";
          child.style.zIndex = String(el.zIndex);
          child.style.color = "#000000";
          if (el.type === "text") {
            const t = el as any;
            child.style.padding = `${t.padding || 0}px`;
            child.style.background = t.backgroundColor === "transparent" ? "transparent" : (t.backgroundColor || "transparent");
            child.style.boxSizing = "border-box";
            child.style.display = "flex";
            child.style.alignItems = "flex-start";
            child.style.justifyContent = t.textAlign === "center" ? "center" : t.textAlign === "right" ? "flex-end" : "flex-start";
            child.style.fontFamily = t.fontFamily;
            const inner = document.createElement("div");
            inner.style.width = "100%";
            inner.style.fontSize = `${t.fontSize}px`;
            inner.style.color = t.color || "#000000";
            inner.style.fontWeight = t.fontWeight;
            inner.style.fontStyle = t.fontStyle;
            inner.style.textDecoration = t.textDecoration;
            inner.style.textAlign = t.textAlign;
            inner.style.lineHeight = String(t.lineHeight);
            inner.style.direction = "rtl";
            inner.style.whiteSpace = "pre-wrap";
            inner.style.wordBreak = "break-word";
            inner.textContent = t.content || "";
            child.appendChild(inner);
          } else if (el.type === "image") {
            const im = el as any;
            const img = document.createElement("img");
            // resolve relative URL to absolute for html2canvas
            img.src = im.src.startsWith("http") ? im.src : window.location.origin + im.src;
            img.style.width = "100%";
            img.style.height = "100%";
            img.style.objectFit = im.objectFit;
            img.style.borderRadius = `${im.borderRadius || 0}px`;
            img.style.opacity = String(im.opacity ?? 1);
            img.crossOrigin = "anonymous";
            child.appendChild(img);
          } else if (el.type === "shape") {
            const sh = el as any;
            child.style.background = sh.fill;
            if (sh.strokeWidth > 0) {
              child.style.border = `${sh.strokeWidth}px solid ${sh.stroke}`;
            }
            child.style.opacity = String(sh.opacity ?? 1);
            child.style.borderRadius = sh.shape === "ellipse" ? "50%" : `${sh.borderRadius || 0}px`;
          }

          node.appendChild(child);
        }
        document.body.appendChild(node);
        // wait for images to load
        const imgs = Array.from(node.querySelectorAll("img"));
        await Promise.all(imgs.map((img) => new Promise<void>((resolve) => {
          if (img.complete) resolve();
          else {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          }
        })));
        const canvas = await html2canvas(node, {
          scale: 2,
          useCORS: true,
          backgroundColor: slides[i].background,
          logging: false,
          // Override oklch CSS variables from Tailwind 4 - html2canvas 1.x can't parse them.
          onclone: (clonedDoc: Document) => {
            const root = clonedDoc.documentElement;
            const body = clonedDoc.body;
            // Replace oklch variables with safe hex equivalents
            const safeVars: Record<string, string> = {
              "--background": "#ffffff",
              "--foreground": "#000000",
              "--card": "#ffffff",
              "--card-foreground": "#000000",
              "--popover": "#ffffff",
              "--popover-foreground": "#000000",
              "--primary": "#000000",
              "--primary-foreground": "#ffffff",
              "--secondary": "#f5f5f5",
              "--secondary-foreground": "#000000",
              "--muted": "#f5f5f5",
              "--muted-foreground": "#737373",
              "--accent": "#f5f5f5",
              "--accent-foreground": "#000000",
              "--destructive": "#ef4444",
              "--border": "#e5e5e5",
              "--input": "#e5e5e5",
              "--ring": "#a3a3a3",
            };
            Object.entries(safeVars).forEach(([k, v]) => {
              root.style.setProperty(k, v);
              body.style.setProperty(k, v);
            });
            body.style.color = "#000000";
            body.style.background = "transparent";
            // Force node tree to inherit explicit black
            node.style.color = "#000000";
          },
        });
        document.body.removeChild(node);
        const imgData = canvas.toDataURL("image/jpeg", 0.92);
        if (i > 0) pdf.addPage([960, 540], "landscape");
        pdf.addImage(imgData, "JPEG", 0, 0, 960, 540);
      }
      pdf.save(`${presentation.title || "presentation"}.pdf`);
      toast.success("فایل PDF دانلود شد");
    } catch (err) {
      console.error(err);
      toast.error("خطا در ساخت PDF: " + (err instanceof Error ? err.message : ""));
    } finally {
      setExportingPdf(false);
    }
  };

  const saveJson = () => {
    const data = JSON.stringify(presentation, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${presentation.title || "presentation"}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("فایل پروژه ذخیره شد");
  };

  const loadJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (!parsed.slides || !Array.isArray(parsed.slides)) throw new Error("ساختار نامعتبر");
        loadPresentation(parsed);
        toast.success("پروژه بارگذاری شد");
      } catch {
        toast.error("فایل نامعتبر است");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="border-b bg-background px-3 py-2 flex items-center gap-2 flex-wrap" dir="rtl">
      <div className="flex items-center gap-1.5">
        <PresentationIcon className="h-5 w-5 text-primary" />
        <span className="font-bold text-sm">ویرایشگر اسلاید</span>
      </div>

      <div className="h-6 w-px bg-border" />

      <Input
        value={presentation.title}
        onChange={(e) => setTitle(e.target.value)}
        className="h-8 w-44"
        placeholder="عنوان ارائه"
      />

      <div className="h-6 w-px bg-border" />

      {/* Add elements */}
      <Button size="sm" variant="outline" onClick={addText} className="h-8 gap-1">
        <Type className="h-4 w-4" /> متن
      </Button>
      <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} className="h-8 gap-1">
        <ImageIcon className="h-4 w-4" /> تصویر
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleImageUpload}
      />
      <Button size="sm" variant="outline" onClick={() => addShape("rectangle")} className="h-8 gap-1">
        <Square className="h-4 w-4" /> مستطیل
      </Button>
      <Button size="sm" variant="outline" onClick={() => addShape("ellipse")} className="h-8 gap-1">
        <Circle className="h-4 w-4" /> بیضی
      </Button>

      <div className="h-6 w-px bg-border" />

      {/* Zoom */}
      <div className="flex items-center gap-1">
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setZoom(Math.max(0.25, zoom - 0.1))}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-xs w-10 text-center">{Math.round(zoom * 100)}%</span>
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setZoom(Math.min(2, zoom + 0.1))}>
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1" />

      {/* Save/Load */}
      <Button size="sm" variant="ghost" onClick={saveJson} className="h-8 gap-1">
        <Save className="h-4 w-4" /> ذخیره پروژه
      </Button>
      <Button size="sm" variant="ghost" onClick={() => document.getElementById("load-json-input")?.click()} className="h-8 gap-1">
        <FolderOpen className="h-4 w-4" /> بارگذاری
      </Button>
      <input id="load-json-input" type="file" accept=".json" className="sr-only" onChange={loadJson} />
      <Button size="sm" variant="ghost" onClick={() => { if (confirm("شروع یک پروژه جدید؟ تمام تغییرات از بین می‌رود.")) newPresentation(); }} className="h-8 gap-1">
        <Trash className="h-4 w-4" /> جدید
      </Button>

      <div className="h-6 w-px bg-border" />

      {/* Export */}
      <Button size="sm" onClick={exportPdf} disabled={exportingPdf} className="h-8 gap-1">
        {exportingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
        خروجی PDF
      </Button>
      <Button size="sm" onClick={exportPptx} disabled={exportingPptx} variant="default" className="h-8 gap-1">
        {exportingPptx ? <Loader2 className="h-4 w-4 animate-spin" /> : <PresentationIcon className="h-4 w-4" />}
        خروجی پاورپوینت
      </Button>
    </div>
  );
}

/**
 * Read a File object as a data URL (base64). Pure client-side, no server needed.
 */
function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("خواندن فایل ناموفق بود"));
    reader.readAsDataURL(file);
  });
}

/**
 * Compress/resize an image data URL to keep localStorage size reasonable.
 * - Max dimension: maxSize (default 1600px)
 * - Output: JPEG (or PNG if original was PNG with transparency) at given quality
 * SVG and GIF files are returned as-is (re-encoded as PNG to be safe in exports).
 */
async function compressImage(
  dataUrl: string,
  originalType: string,
  maxSize = 1600,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { naturalWidth: w, naturalHeight: h } = img;
      // If image is already small, keep as-is but still re-encode to control size
      if (w > maxSize || h > maxSize) {
        const ratio = Math.min(maxSize / w, maxSize / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      // SVG/GIF: encode as PNG to preserve vector/raster fidelity
      if (originalType === "image/svg+xml" || originalType === "image/gif") {
        try {
          resolve(canvas.toDataURL("image/png"));
        } catch {
          resolve(dataUrl);
        }
        return;
      }
      // PNG with possible transparency -> keep PNG if small enough, else JPEG
      if (originalType === "image/png") {
        // Try PNG first, fallback to JPEG if too large
        const pngUrl = canvas.toDataURL("image/png");
        if (pngUrl.length < 1_500_000) {
          resolve(pngUrl);
          return;
        }
      }
      try {
        resolve(canvas.toDataURL("image/jpeg", quality));
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => reject(new Error("پردازش تصویر ناموفق بود"));
    img.src = dataUrl;
  });
}
