'use client'

import { Rnd } from 'react-rnd'
import { useEffect, useRef, useState } from 'react'
import { CanvasElement } from '@/lib/types'
import { useEditorStore } from '@/store/editor-store'
import { cn } from '@/lib/utils'

interface CanvasElementViewProps {
  element: CanvasElement
  canvasWidth: number
  canvasHeight: number
  selected: boolean
  interactive: boolean // true when in edit mode (allow drag/resize); false when in preview/export mode
}

export function CanvasElementView({
  element,
  canvasWidth,
  canvasHeight,
  selected,
  interactive,
}: CanvasElementViewProps) {
  const setSelectedElementId = useEditorStore((s) => s.setSelectedElementId)
  const updateElementGeometry = useEditorStore((s) => s.updateElementGeometry)
  const updateElement = useEditorStore((s) => s.updateElement)
  const deleteElement = useEditorStore((s) => s.deleteElement)

  const [editing, setEditing] = useState(false)
  const textRef = useRef<HTMLDivElement>(null)

  const xPx = (element.x / 100) * canvasWidth
  const yPx = (element.y / 100) * canvasHeight
  const wPx = (element.width / 100) * canvasWidth
  const hPx = (element.height / 100) * canvasHeight

  useEffect(() => {
    if (editing && textRef.current) {
      textRef.current.focus()
      // place cursor at end
      const range = document.createRange()
      range.selectNodeContents(textRef.current)
      range.collapse(false)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
    }
  }, [editing])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setEditing(false)
      setSelectedElementId(null)
    }
    if (e.key === 'Delete' && !editing && selected) {
      deleteElement(element.id)
    }
  }

  if (element.type === 'image') {
    return (
      <Rnd
        size={{ width: wPx, height: hPx }}
        position={{ x: xPx, y: yPx }}
        disableDragging={!interactive}
        enableResizing={interactive}
        bounds="parent"
        onDragStop={(_e, d) => {
          updateElementGeometry(element.id, {
            x: (d.x / canvasWidth) * 100,
            y: (d.y / canvasHeight) * 100,
          })
        }}
        onResizeStop={(_e, _dir, ref, _delta, position) => {
          const newW = parseFloat(ref.style.width)
          const newH = parseFloat(ref.style.height)
          updateElementGeometry(element.id, {
            width: (newW / canvasWidth) * 100,
            height: (newH / canvasHeight) * 100,
            x: (position.x / canvasWidth) * 100,
            y: (position.y / canvasHeight) * 100,
          })
        }}
        onMouseDown={() => {
          if (interactive) setSelectedElementId(element.id)
        }}
        style={{
          zIndex: element.zIndex,
          opacity: element.opacity,
          cursor: interactive ? 'move' : 'default',
        }}
        className={cn(
          'group',
          selected && interactive && 'outline outline-2 outline-emerald-500',
        )}
      >
        <img
          src={element.content}
          alt=""
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            pointerEvents: 'none',
            transform: `rotate(${element.rotation}deg)`,
          }}
        />
      </Rnd>
    )
  }

  // text element
  return (
    <Rnd
      size={{ width: wPx, height: hPx }}
      position={{ x: xPx, y: yPx }}
      disableDragging={!interactive || editing}
      enableResizing={interactive && !editing}
      bounds="parent"
      onDragStop={(_e, d) => {
        updateElementGeometry(element.id, {
          x: (d.x / canvasWidth) * 100,
          y: (d.y / canvasHeight) * 100,
        })
      }}
      onResizeStop={(_e, _dir, ref, _delta, position) => {
        const newW = parseFloat(ref.style.width)
        const newH = parseFloat(ref.style.height)
        updateElementGeometry(element.id, {
          width: (newW / canvasWidth) * 100,
          height: (newH / canvasHeight) * 100,
          x: (position.x / canvasWidth) * 100,
          y: (position.y / canvasHeight) * 100,
        })
      }}
      onMouseDown={() => {
        if (interactive) setSelectedElementId(element.id)
      }}
      onDoubleClick={() => {
        if (interactive) setEditing(true)
      }}
      style={{
        zIndex: element.zIndex,
        opacity: element.opacity,
        cursor: interactive ? (editing ? 'text' : 'move') : 'default',
      }}
      className={cn(
        'group flex',
        selected && interactive && !editing && 'outline outline-2 outline-emerald-500',
      )}
    >
      <div
        ref={textRef}
        contentEditable={editing}
        suppressContentEditableWarning
        onBlur={(e) => {
          if (editing) {
            updateElement(element.id, { content: e.currentTarget.innerText })
            setEditing(false)
          }
        }}
        onKeyDown={handleKeyDown}
        dir="auto"
        className={cn(
          'w-full h-full overflow-hidden break-words whitespace-pre-wrap',
          editing && 'cursor-text outline-none',
        )}
        style={{
          fontSize: element.style.fontSize,
          fontFamily: element.style.fontFamily,
          color: element.style.color,
          fontWeight: element.style.bold ? 'bold' : 'normal',
          fontStyle: element.style.italic ? 'italic' : 'normal',
          textDecoration: element.style.underline ? 'underline' : 'none',
          textAlign: element.style.align,
          lineHeight: element.style.lineHeight,
          transform: `rotate(${element.rotation}deg)`,
          transformOrigin: 'center',
          userSelect: editing ? 'text' : 'none',
          pointerEvents: editing ? 'auto' : 'none',
        }}
      >
        {element.content}
      </div>
    </Rnd>
  )
}
