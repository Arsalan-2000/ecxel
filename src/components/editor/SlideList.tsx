"use client";

import { useEditorStore } from "@/store/editorStore";
import { Plus, Copy, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { CANVAS_W, CANVAS_H } from "./SlideCanvas";

export default function SlideList() {
  const presentation = useEditorStore((s) => s.presentation);
  const currentSlideId = useEditorStore((s) => s.currentSlideId);
  const selectSlide = useEditorStore((s) => s.selectSlide);
  const addSlide = useEditorStore((s) => s.addSlide);
  const deleteSlide = useEditorStore((s) => s.deleteSlide);
  const duplicateSlide = useEditorStore((s) => s.duplicateSlide);
  const reorderSlides = useEditorStore((s) => s.reorderSlides);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  return (
    <div className="h-full flex flex-col bg-muted/30 border-r" dir="rtl">
      <div className="flex items-center justify-between p-3 border-b bg-background">
        <span className="text-sm font-semibold">اسلایدها ({presentation.slides.length})</span>
        <Button size="sm" onClick={addSlide} className="h-8 gap-1">
          <Plus className="h-4 w-4" /> اسلاید جدید
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scroll">
        {presentation.slides.map((slide, idx) => {
          const active = slide.id === currentSlideId;
          return (
            <div
              key={slide.id}
              draggable
              onDragStart={() => setDragIndex(idx)}
              onDragEnter={() => setOverIndex(idx)}
              onDragEnd={() => {
                if (dragIndex !== null && overIndex !== null && dragIndex !== overIndex) {
                  reorderSlides(dragIndex, overIndex);
                }
                setDragIndex(null);
                setOverIndex(null);
              }}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => selectSlide(slide.id)}
              className={cn(
                "group relative rounded-md border bg-background cursor-pointer transition-all",
                active ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50",
                overIndex === idx && dragIndex !== null && "border-primary border-dashed"
              )}
            >
              <div className="flex items-center gap-2 p-2">
                <div className="text-xs text-muted-foreground w-5 text-center flex flex-col items-center gap-1">
                  <GripVertical className="h-3 w-3 opacity-30 group-hover:opacity-100 cursor-grab" />
                  <span>{idx + 1}</span>
                </div>
                {/* slide thumbnail */}
                <div
                  className="relative overflow-hidden rounded border"
                  style={{
                    width: 110,
                    height: 110 * (CANVAS_H / CANVAS_W),
                    background: slide.background,
                  }}
                >
                  {slide.elements
                    .slice()
                    .sort((a, b) => a.zIndex - b.zIndex)
                    .map((el) => (
                      <MiniElement key={el.id} element={el} />
                    ))}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate" title={slide.name}>{slide.name}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {slide.elements.length} عنصر
                  </div>
                  <div className="flex gap-1 mt-2 opacity-70 group-hover:opacity-100">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={(e) => { e.stopPropagation(); duplicateSlide(slide.id); }}
                      title="کپی اسلاید"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 hover:text-destructive"
                      disabled={presentation.slides.length <= 1}
                      onClick={(e) => { e.stopPropagation(); deleteSlide(slide.id); }}
                      title="حذف اسلاید"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MiniElement({ element }: { element: any }) {
  const W = 110;
  const H = 110 * (CANVAS_H / CANVAS_W);
  const sx = W / CANVAS_W;
  const sy = H / CANVAS_H;
  const style: React.CSSProperties = {
    position: "absolute",
    left: element.x * sx,
    top: element.y * sy,
    width: element.width * sx,
    height: element.height * sy,
    zIndex: element.zIndex,
    transform: `rotate(${element.rotation || 0}deg)`,
    transformOrigin: "center center",
  };
  if (element.type === "text") {
    return (
      <div style={{
        ...style,
        background: element.backgroundColor === "transparent" ? undefined : element.backgroundColor,
        color: element.color,
        fontSize: Math.max(2, element.fontSize * Math.min(sx, sy)),
        fontWeight: element.fontWeight,
        fontStyle: element.fontStyle,
        textAlign: element.textAlign,
        lineHeight: element.lineHeight,
        overflow: "hidden",
        padding: 1,
        direction: "rtl",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}>
        {element.content}
      </div>
    );
  }
  if (element.type === "image") {
    return (
      <img
        src={element.src}
        alt=""
        style={{
          ...style,
          objectFit: element.objectFit,
          borderRadius: element.borderRadius * Math.min(sx, sy),
          opacity: element.opacity,
        }}
      />
    );
  }
  // shape
  return (
    <div style={{
      ...style,
      background: element.fill,
      border: element.strokeWidth > 0 ? `${element.strokeWidth * Math.min(sx, sy)}px solid ${element.stroke}` : "none",
      opacity: element.opacity,
      borderRadius: element.shape === "ellipse" ? "50%" : `${element.borderRadius * Math.min(sx, sy)}px`,
    }} />
  );
}
