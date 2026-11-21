'use client'

import { Plus, Copy, Trash2, GripVertical } from 'lucide-react'
import { useEditorStore } from '@/store/editor-store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Slide } from '@/lib/types'
import { PRESENTATION_ASPECT_RATIO } from '@/lib/types'

interface SlideThumbnailProps {
  slide: Slide
  index: number
  active: boolean
}

function SlideThumbnail({ slide, index, active }: SlideThumbnailProps) {
  const setCurrentSlideIndex = useEditorStore((s) => s.setCurrentSlideIndex)
  const duplicateSlide = useEditorStore((s) => s.duplicateSlide)
  const deleteSlide = useEditorStore((s) => s.deleteSlide)
  const slidesCount = useEditorStore((s) => s.slides.length)

  const bg =
    slide.background.type === 'gradient'
      ? `linear-gradient(135deg, ${slide.background.color1}, ${slide.background.color2})`
      : slide.background.color1

  return (
    <div
      className={cn(
        'group relative rounded-md border-2 cursor-pointer transition-colors',
        active
          ? 'border-emerald-500'
          : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-400',
      )}
      onClick={() => setCurrentSlideIndex(index)}
    >
      <div className="flex items-center gap-2 px-2 py-1 text-xs text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-700">
        <GripVertical className="h-3 w-3 opacity-50 cursor-grab" />
        <span className="font-medium">{slide.name}</span>
      </div>
      <div
        className="relative"
        style={{
          aspectRatio: `${PRESENTATION_ASPECT_RATIO}`,
          background: bg,
        }}
      >
        {slide.elements.map((el) => {
          const baseStyle: React.CSSProperties = {
            position: 'absolute',
            left: `${el.x}%`,
            top: `${el.y}%`,
            width: `${el.width}%`,
            height: `${el.height}%`,
            zIndex: el.zIndex,
            opacity: el.opacity,
            transform: `rotate(${el.rotation}deg)`,
          }
          if (el.type === 'image') {
            return (
              <img
                key={el.id}
                src={el.content}
                alt=""
                style={{
                  ...baseStyle,
                  objectFit: 'cover',
                  width: '100%',
                  height: '100%',
                }}
                draggable={false}
              />
            )
          }
          return (
            <div
              key={el.id}
              style={{
                ...baseStyle,
                fontSize: Math.max(4, el.style.fontSize * 0.18),
                fontFamily: el.style.fontFamily,
                color: el.style.color,
                fontWeight: el.style.bold ? 'bold' : 'normal',
                fontStyle: el.style.italic ? 'italic' : 'normal',
                textDecoration: el.style.underline ? 'underline' : 'none',
                textAlign: el.style.align,
                lineHeight: el.style.lineHeight,
                overflow: 'hidden',
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap',
              }}
              dir="auto"
            >
              {el.content}
            </div>
          )
        })}
      </div>
      <div className="absolute right-1 top-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          className="p-1 rounded bg-white/90 dark:bg-neutral-800/90 shadow hover:bg-white text-neutral-700 dark:text-neutral-200"
          onClick={(e) => {
            e.stopPropagation()
            duplicateSlide(index)
          }}
          title="کپی اسلاید"
        >
          <Copy className="h-3 w-3" />
        </button>
        <button
          className="p-1 rounded bg-white/90 dark:bg-neutral-800/90 shadow hover:bg-white text-red-600"
          onClick={(e) => {
            e.stopPropagation()
            if (slidesCount > 1) {
              deleteSlide(index)
            }
          }}
          disabled={slidesCount <= 1}
          title="حذف اسلاید"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}

export function SlideSidebar() {
  const slides = useEditorStore((s) => s.slides)
  const currentSlideIndex = useEditorStore((s) => s.currentSlideIndex)
  const addSlide = useEditorStore((s) => s.addSlide)

  return (
    <aside className="w-56 shrink-0 border-l border-neutral-200 dark:border-neutral-800 bg-background flex flex-col">
      <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <span className="text-sm font-medium">اسلایدها</span>
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={addSlide} title="اسلاید جدید">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {slides.map((slide, i) => (
          <SlideThumbnail
            key={slide.id}
            slide={slide}
            index={i}
            active={i === currentSlideIndex}
          />
        ))}
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2 border-dashed"
          onClick={addSlide}
        >
          <Plus className="h-4 w-4" />
          افزودن اسلاید
        </Button>
      </div>
    </aside>
  )
}
