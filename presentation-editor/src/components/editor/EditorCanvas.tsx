'use client'

import { useEffect, useRef, useState, forwardRef } from 'react'
import { useEditorStore } from '@/store/editor-store'
import { CanvasElementView } from './CanvasElementView'
import { PRESENTATION_ASPECT_RATIO, Slide } from '@/lib/types'
import { cn } from '@/lib/utils'

interface EditorCanvasProps {
  interactive?: boolean
  slide?: Slide
}

export const EditorCanvas = forwardRef<HTMLDivElement, EditorCanvasProps>(
  function EditorCanvas({ interactive = true, slide: externalSlide }, ref) {
    const slides = useEditorStore((s) => s.slides)
    const currentSlideIndex = useEditorStore((s) => s.currentSlideIndex)
    const selectedElementId = useEditorStore((s) => s.selectedElementId)
    const setSelectedElementId = useEditorStore((s) => s.setSelectedElementId)
    const updateElement = useEditorStore((s) => s.updateElement)

    const slide = externalSlide ?? slides[currentSlideIndex]

    const containerRef = useRef<HTMLDivElement>(null)
    const [canvasSize, setCanvasSize] = useState({ width: 960, height: 540 })

    useEffect(() => {
      if (!containerRef.current) return
      const updateSize = () => {
        const el = containerRef.current
        if (!el) return
        const parentWidth = el.clientWidth
        const parentHeight = el.clientHeight
        const ratio = PRESENTATION_ASPECT_RATIO
        let width = parentWidth
        let height = parentWidth / ratio
        if (height > parentHeight) {
          height = parentHeight
          width = parentHeight * ratio
        }
        setCanvasSize({ width: Math.round(width), height: Math.round(height) })
      }
      updateSize()
      const ro = new ResizeObserver(updateSize)
      ro.observe(containerRef.current)
      return () => ro.disconnect()
    }, [])

    const handleBgClick = (e: React.MouseEvent) => {
      if (!interactive) return
      // click on the canvas background (not an element) -> deselect
      if (e.target === e.currentTarget) {
        setSelectedElementId(null)
      }
    }

    const bg =
      slide?.background.type === 'gradient'
        ? `linear-gradient(135deg, ${slide.background.color1}, ${slide.background.color2})`
        : slide?.background.color1 ?? '#ffffff'

    return (
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center p-6 bg-neutral-100 dark:bg-neutral-900 overflow-hidden"
      >
        <div
          ref={ref}
          onClick={handleBgClick}
          className="relative shadow-2xl rounded-md overflow-hidden ring-1 ring-black/10"
          style={{
            width: canvasSize.width,
            height: canvasSize.height,
            background: bg,
          }}
        >
          {slide?.elements.map((el) => (
            <CanvasElementView
              key={el.id}
              element={el}
              canvasWidth={canvasSize.width}
              canvasHeight={canvasSize.height}
              selected={interactive && selectedElementId === el.id}
              interactive={interactive}
            />
          ))}
          {interactive && (!slide || slide.elements.length === 0) && (
            <div className="absolute inset-0 flex items-center justify-center text-neutral-400 pointer-events-none select-none">
              <div className="text-center">
                <p className="text-lg font-medium">صفحه خالی</p>
                <p className="text-sm mt-1">از نوار ابزار بالا متن یا تصویر اضافه کنید</p>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  },
)
