'use client'

import { useEffect, useSyncExternalStore } from 'react'
import { Toolbar } from '@/components/editor/Toolbar'
import { SlideSidebar } from '@/components/editor/SlideSidebar'
import { PropertiesPanel } from '@/components/editor/PropertiesPanel'
import { EditorCanvas } from '@/components/editor/EditorCanvas'
import { useEditorStore } from '@/store/editor-store'

// Detect client-only mount without triggering setState in effect.
// Returns false during SSR / first render, true after hydration.
const emptySubscribe = () => () => {}
function useHasMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false)
}

export default function Home() {
  const mounted = useHasMounted()
  const deleteElement = useEditorStore((s) => s.deleteElement)
  const selectedElementId = useEditorStore((s) => s.selectedElementId)
  const setSelectedElementId = useEditorStore((s) => s.setSelectedElementId)

  // global keyboard handler for delete and escape
  useEffect(() => {
    if (!mounted) return
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      // skip if user is typing in an input/textarea/contenteditable
      const isTyping =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable
      if (isTyping) return

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementId) {
          e.preventDefault()
          deleteElement(selectedElementId)
        }
      }
      if (e.key === 'Escape') {
        setSelectedElementId(null)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [mounted, selectedElementId, deleteElement, setSelectedElementId])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <div className="text-neutral-500">در حال بارگذاری ویرایشگر...</div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden" dir="rtl">
      <Toolbar />
      <div className="flex-1 flex min-h-0">
        <PropertiesPanel />
        <main className="flex-1 min-w-0">
          <EditorCanvas />
        </main>
        <SlideSidebar />
      </div>
      <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-background py-1.5 px-3 text-xs text-neutral-500 text-center">
        ویرایشگر ارائه — ساخته‌شده با Next.js، React و Tailwind CSS — آماده دیپلوی روی GitHub و Vercel
      </footer>
    </div>
  )
}
