import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import {
  CanvasElement,
  DEFAULT_GRADIENT,
  DEFAULT_TEXT_STYLE,
  Slide,
  SlideBackground,
  TextStyle,
} from '@/lib/types'

interface EditorStore {
  slides: Slide[]
  currentSlideIndex: number
  selectedElementId: string | null
  presentationTitle: string

  setPresentationTitle: (title: string) => void
  setCurrentSlideIndex: (index: number) => void
  setSelectedElementId: (id: string | null) => void

  addSlide: () => void
  duplicateSlide: (index: number) => void
  deleteSlide: (index: number) => void
  reorderSlide: (from: number, to: number) => void
  updateSlideBackground: (background: Partial<SlideBackground>) => void

  addTextElement: (text?: string) => void
  addImageElement: (dataUrl: string, name?: string) => void
  updateElement: (id: string, patch: Partial<CanvasElement>) => void
  updateElementStyle: (id: string, patch: Partial<TextStyle>) => void
  updateElementGeometry: (
    id: string,
    geom: { x?: number; y?: number; width?: number; height?: number; rotation?: number },
  ) => void
  deleteElement: (id: string) => void
  bringForward: (id: string) => void
  sendBackward: (id: string) => void
  duplicateElement: (id: string) => void

  newPresentation: () => void
}

const createEmptySlide = (name: string): Slide => ({
  id: uuidv4(),
  name,
  elements: [],
  background: { ...DEFAULT_GRADIENT },
})

const makeTextElement = (text: string): CanvasElement => ({
  id: uuidv4(),
  type: 'text',
  x: 10,
  y: 10,
  width: 60,
  height: 15,
  rotation: 0,
  content: text,
  style: { ...DEFAULT_TEXT_STYLE },
  zIndex: 1,
  opacity: 1,
})

const makeImageElement = (dataUrl: string): CanvasElement => ({
  id: uuidv4(),
  type: 'image',
  x: 15,
  y: 15,
  width: 40,
  height: 40,
  rotation: 0,
  content: dataUrl,
  style: { ...DEFAULT_TEXT_STYLE },
  zIndex: 1,
  opacity: 1,
})

export const useEditorStore = create<EditorStore>()(
  persist(
    (set, get) => ({
      slides: [createEmptySlide('اسلاید ۱')],
      currentSlideIndex: 0,
      selectedElementId: null,
      presentationTitle: 'ارائه من',

      setPresentationTitle: (title) => set({ presentationTitle: title }),
      setCurrentSlideIndex: (index) =>
        set({ currentSlideIndex: index, selectedElementId: null }),
      setSelectedElementId: (id) => set({ selectedElementId: id }),

      addSlide: () => {
        const { slides, currentSlideIndex } = get()
        const newSlide = createEmptySlide(`اسلاید ${slides.length + 1}`)
        const newSlides = [
          ...slides.slice(0, currentSlideIndex + 1),
          newSlide,
          ...slides.slice(currentSlideIndex + 1),
        ]
        set({
          slides: newSlides,
          currentSlideIndex: currentSlideIndex + 1,
          selectedElementId: null,
        })
      },

      duplicateSlide: (index) => {
        const { slides } = get()
        const slide = slides[index]
        if (!slide) return
        const newSlide: Slide = {
          id: uuidv4(),
          name: `${slide.name} (کپی)`,
          elements: slide.elements.map((el) => ({ ...el, id: uuidv4() })),
          background: { ...slide.background },
        }
        const newSlides = [
          ...slides.slice(0, index + 1),
          newSlide,
          ...slides.slice(index + 1),
        ]
        set({
          slides: newSlides,
          currentSlideIndex: index + 1,
          selectedElementId: null,
        })
      },

      deleteSlide: (index) => {
        const { slides } = get()
        if (slides.length <= 1) return
        const newSlides = slides.filter((_, i) => i !== index)
        const newCurrent = Math.min(index, newSlides.length - 1)
        set({ slides: newSlides, currentSlideIndex: newCurrent, selectedElementId: null })
      },

      reorderSlide: (from, to) => {
        const { slides } = get()
        if (to < 0 || to >= slides.length) return
        const newSlides = [...slides]
        const [moved] = newSlides.splice(from, 1)
        newSlides.splice(to, 0, moved)
        set({ slides: newSlides, currentSlideIndex: to })
      },

      updateSlideBackground: (background) => {
        const { slides, currentSlideIndex } = get()
        const slide = slides[currentSlideIndex]
        if (!slide) return
        const newSlides = [...slides]
        newSlides[currentSlideIndex] = {
          ...slide,
          background: { ...slide.background, ...background },
        }
        set({ slides: newSlides })
      },

      addTextElement: (text = 'متن جدید را اینجا بنویسید') => {
        const { slides, currentSlideIndex } = get()
        const slide = slides[currentSlideIndex]
        if (!slide) return
        const newEl = makeTextElement(text)
        const newSlides = [...slides]
        newSlides[currentSlideIndex] = {
          ...slide,
          elements: [...slide.elements, newEl],
        }
        set({ slides: newSlides, selectedElementId: newEl.id })
      },

      addImageElement: (dataUrl) => {
        const { slides, currentSlideIndex } = get()
        const slide = slides[currentSlideIndex]
        if (!slide) return
        const newEl = makeImageElement(dataUrl)
        const newSlides = [...slides]
        newSlides[currentSlideIndex] = {
          ...slide,
          elements: [...slide.elements, newEl],
        }
        set({ slides: newSlides, selectedElementId: newEl.id })
      },

      updateElement: (id, patch) => {
        const { slides, currentSlideIndex } = get()
        const slide = slides[currentSlideIndex]
        if (!slide) return
        const newSlides = [...slides]
        newSlides[currentSlideIndex] = {
          ...slide,
          elements: slide.elements.map((el) =>
            el.id === id ? { ...el, ...patch } : el,
          ),
        }
        set({ slides: newSlides })
      },

      updateElementStyle: (id, patch) => {
        const { slides, currentSlideIndex } = get()
        const slide = slides[currentSlideIndex]
        if (!slide) return
        const newSlides = [...slides]
        newSlides[currentSlideIndex] = {
          ...slide,
          elements: slide.elements.map((el) =>
            el.id === id ? { ...el, style: { ...el.style, ...patch } } : el,
          ),
        }
        set({ slides: newSlides })
      },

      updateElementGeometry: (id, geom) => {
        const { slides, currentSlideIndex } = get()
        const slide = slides[currentSlideIndex]
        if (!slide) return
        const newSlides = [...slides]
        newSlides[currentSlideIndex] = {
          ...slide,
          elements: slide.elements.map((el) =>
            el.id === id ? { ...el, ...geom } : el,
          ),
        }
        set({ slides: newSlides })
      },

      deleteElement: (id) => {
        const { slides, currentSlideIndex, selectedElementId } = get()
        const slide = slides[currentSlideIndex]
        if (!slide) return
        const newSlides = [...slides]
        newSlides[currentSlideIndex] = {
          ...slide,
          elements: slide.elements.filter((el) => el.id !== id),
        }
        set({
          slides: newSlides,
          selectedElementId: selectedElementId === id ? null : selectedElementId,
        })
      },

      bringForward: (id) => {
        const { slides, currentSlideIndex } = get()
        const slide = slides[currentSlideIndex]
        if (!slide) return
        const newSlides = [...slides]
        newSlides[currentSlideIndex] = {
          ...slide,
          elements: slide.elements.map((el) =>
            el.id === id ? { ...el, zIndex: el.zIndex + 1 } : el,
          ),
        }
        set({ slides: newSlides })
      },

      sendBackward: (id) => {
        const { slides, currentSlideIndex } = get()
        const slide = slides[currentSlideIndex]
        if (!slide) return
        const newSlides = [...slides]
        newSlides[currentSlideIndex] = {
          ...slide,
          elements: slide.elements.map((el) =>
            el.id === id ? { ...el, zIndex: Math.max(0, el.zIndex - 1) } : el,
          ),
        }
        set({ slides: newSlides })
      },

      duplicateElement: (id) => {
        const { slides, currentSlideIndex } = get()
        const slide = slides[currentSlideIndex]
        if (!slide) return
        const el = slide.elements.find((e) => e.id === id)
        if (!el) return
        const newEl: CanvasElement = {
          ...el,
          id: uuidv4(),
          x: Math.min(95 - el.width, el.x + 3),
          y: Math.min(95 - el.height, el.y + 3),
          style: { ...el.style },
        }
        const newSlides = [...slides]
        newSlides[currentSlideIndex] = {
          ...slide,
          elements: [...slide.elements, newEl],
        }
        set({ slides: newSlides, selectedElementId: newEl.id })
      },

      newPresentation: () => {
        set({
          slides: [createEmptySlide('اسلاید ۱')],
          currentSlideIndex: 0,
          selectedElementId: null,
          presentationTitle: 'ارائه من',
        })
      },
    }),
    {
      name: 'presentation-editor',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
