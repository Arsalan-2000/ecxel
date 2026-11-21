"use client";

import { useRef, useEffect, useCallback } from "react";
import { Rnd } from "react-rnd";
import { useEditorStore, type SlideElement, type TextElement, type ImageElement, type ShapeElement } from "@/store/editorStore";

export const CANVAS_W = 960;
export const CANVAS_H = 540;

interface Props {
  slideId: string;
  slideBackground: string;
  elements: SlideElement[];
  selectedElementId: string | null;
  zoom: number;
  onCanvasRef?: (el: HTMLDivElement | null) => void;
}

export default function SlideCanvas({
  slideId,
  slideBackground,
  elements,
  selectedElementId,
  zoom,
  onCanvasRef,
}: Props) {
  const updateElement = useEditorStore((s) => s.updateElement);
  const selectElement = useEditorStore((s) => s.selectElement);
  const deleteElement = useEditorStore((s) => s.deleteElement);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    onCanvasRef?.(canvasRef.current);
  }, [onCanvasRef]);

  const handleSelect = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      selectElement(id);
    },
    [selectElement]
  );

  const handleBackgroundMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Only deselect when clicking directly on the canvas background, not on an element
      if (e.target === e.currentTarget) {
        selectElement(null);
      }
    },
    [selectElement]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // ignore when typing in inputs
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if ((e.key === "Delete" || e.key === "Backspace") && selectedElementId) {
        e.preventDefault();
        deleteElement(slideId, selectedElementId);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedElementId, deleteElement, slideId]);

  const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div className="flex items-center justify-center w-full h-full overflow-auto p-8">
      <div
        ref={canvasRef}
        onMouseDown={handleBackgroundMouseDown}
        className="relative shadow-2xl ring-1 ring-black/10 print:shadow-none print:ring-0"
        style={{
          width: CANVAS_W * zoom,
          height: CANVAS_H * zoom,
          background: slideBackground,
          overflow: "hidden",
        }}
      >
        {sortedElements.map((el) => (
          <ElementRenderer
            key={el.id}
            element={el}
            slideId={slideId}
            zoom={zoom}
            selected={selectedElementId === el.id}
            onSelect={handleSelect}
            updateElement={updateElement}
          />
        ))}
      </div>
    </div>
  );
}

interface ElementProps {
  element: SlideElement;
  slideId: string;
  zoom: number;
  selected: boolean;
  onSelect: (e: React.MouseEvent, id: string) => void;
  updateElement: (slideId: string, elementId: string, patch: Partial<SlideElement>) => void;
}

function ElementRenderer({ element, slideId, zoom, selected, onSelect, updateElement }: ElementProps) {
  const onDragStop = (_e: any, d: { x: number; y: number }) => {
    updateElement(slideId, element.id, {
      x: Math.max(0, Math.min(CANVAS_W - element.width, d.x / zoom)),
      y: Math.max(0, Math.min(CANVAS_H - element.height, d.y / zoom)),
    } as Partial<SlideElement>);
  };
  const onResizeStop = (_e: any, _dir: any, ref: HTMLElement, _delta: any, pos: { x: number; y: number }) => {
    const newW = Math.max(20, ref.offsetWidth / zoom);
    const newH = Math.max(20, ref.offsetHeight / zoom);
    updateElement(slideId, element.id, {
      width: Math.min(CANVAS_W, newW),
      height: Math.min(CANVAS_H, newH),
      x: Math.max(0, pos.x / zoom),
      y: Math.max(0, pos.y / zoom),
    } as Partial<SlideElement>);
  };

  return (
    <Rnd
      size={{ width: element.width * zoom, height: element.height * zoom }}
      position={{ x: element.x * zoom, y: element.y * zoom }}
      onDragStop={onDragStop}
      onResizeStop={onResizeStop}
      enableResizing={{
        top: true, right: true, bottom: true, left: true,
        topRight: true, bottomRight: true, bottomLeft: true, topLeft: true,
      }}
      resizeHandleStyles={selected ? {
        top: { background: "#3b82f6" },
        right: { background: "#3b82f6" },
        bottom: { background: "#3b82f6" },
        left: { background: "#3b82f6" },
        topRight: { background: "#3b82f6" },
        bottomRight: { background: "#3b82f6" },
        bottomLeft: { background: "#3b82f6" },
        topLeft: { background: "#3b82f6" },
      } : undefined}
      bounds="parent"
      style={{
        zIndex: element.zIndex,
        outline: selected ? "2px solid #3b82f6" : "none",
        outlineOffset: 0,
        cursor: "move",
      }}
      onMouseDown={(e) => onSelect(e, element.id)}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `rotate(${element.rotation || 0}deg)`,
          transformOrigin: "center center",
          pointerEvents: "none",
        }}
      >
        <ElementContent element={element} zoom={zoom} />
      </div>
    </Rnd>
  );
}

function ElementContent({ element, zoom }: { element: SlideElement; zoom: number }) {
  if (element.type === "text") {
    const t = element as TextElement;
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          padding: (t.padding || 0) * zoom,
          background: t.backgroundColor || "transparent",
          overflow: "hidden",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "flex-start",
          justifyContent:
            t.textAlign === "center" ? "center" : t.textAlign === "right" ? "flex-end" : "flex-start",
          fontFamily: t.fontFamily,
        }}
      >
        <div
          style={{
            width: "100%",
            fontSize: t.fontSize * zoom,
            color: t.color,
            fontWeight: t.fontWeight,
            fontStyle: t.fontStyle,
            textDecoration: t.textDecoration,
            textAlign: t.textAlign as any,
            lineHeight: t.lineHeight,
            direction: "rtl",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {t.content || ""}
        </div>
      </div>
    );
  }
  if (element.type === "image") {
    const im = element as ImageElement;
    return (
      <img
        src={im.src}
        alt={im.alt}
        draggable={false}
        style={{
          width: "100%",
          height: "100%",
          objectFit: im.objectFit as any,
          borderRadius: (im.borderRadius || 0) * zoom,
          opacity: im.opacity != null ? im.opacity : 1,
          display: "block",
        }}
      />
    );
  }
  // shape
  const sh = element as ShapeElement;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: sh.fill,
        border: sh.strokeWidth > 0 ? `${sh.strokeWidth * zoom}px solid ${sh.stroke}` : "none",
        opacity: sh.opacity != null ? sh.opacity : 1,
        borderRadius: sh.shape === "ellipse" ? "50%" : `${(sh.borderRadius || 0) * zoom}px`,
      }}
    />
  );
}
