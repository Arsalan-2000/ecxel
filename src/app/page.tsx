"use client";

import { useState, useEffect } from "react";
import Toolbar from "@/components/editor/Toolbar";
import SlideList from "@/components/editor/SlideList";
import PropertiesPanel from "@/components/editor/PropertiesPanel";
import SlideCanvas from "@/components/editor/SlideCanvas";
import { useEditorStore } from "@/store/editorStore";

export default function Home() {
  const presentation = useEditorStore((s) => s.presentation);
  const currentSlideId = useEditorStore((s) => s.currentSlideId);
  const selectedElementId = useEditorStore((s) => s.selectedElementId);
  const [zoom, setZoom] = useState(0.7);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch with persisted state
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const slide = presentation.slides.find((s) => s.id === currentSlideId);

  if (!mounted || !slide) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">در حال بارگذاری...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-muted/20" dir="rtl">
      <Toolbar zoom={zoom} setZoom={setZoom} />
      <div className="flex-1 flex min-h-0">
        {/* Right panel: Properties (RTL → first child appears on right side) */}
        <aside className="w-72 flex-shrink-0 hidden lg:block">
          <PropertiesPanel />
        </aside>

        {/* Center: Canvas */}
        <main className="flex-1 min-w-0 bg-muted/30 overflow-hidden">
          <SlideCanvas
            slideId={slide.id}
            slideBackground={slide.background}
            elements={slide.elements}
            selectedElementId={selectedElementId}
            zoom={zoom}
          />
        </main>

        {/* Left: Slides list */}
        <aside className="w-72 flex-shrink-0">
          <SlideList />
        </aside>
      </div>
    </div>
  );
}
