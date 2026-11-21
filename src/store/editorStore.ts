import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ElementType = "text" | "image" | "shape";

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
}

export interface TextElement extends BaseElement {
  type: "text";
  content: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: "normal" | "bold";
  fontStyle: "normal" | "italic";
  color: string;
  textAlign: "left" | "center" | "right";
  textDecoration: "none" | "underline" | "line-through";
  lineHeight: number;
  backgroundColor: string;
  padding: number;
}

export interface ImageElement extends BaseElement {
  type: "image";
  src: string;
  alt: string;
  objectFit: "cover" | "contain" | "fill";
  borderRadius: number;
  opacity: number;
}

export interface ShapeElement extends BaseElement {
  type: "shape";
  shape: "rectangle" | "ellipse";
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  borderRadius: number;
}

export type SlideElement = TextElement | ImageElement | ShapeElement;

export interface Slide {
  id: string;
  name: string;
  background: string;
  elements: SlideElement[];
}

export interface Presentation {
  title: string;
  slides: Slide[];
}

interface EditorState {
  presentation: Presentation;
  currentSlideId: string | null;
  selectedElementId: string | null;
  setTitle: (title: string) => void;
  addSlide: () => void;
  deleteSlide: (id: string) => void;
  duplicateSlide: (id: string) => void;
  selectSlide: (id: string) => void;
  reorderSlides: (from: number, to: number) => void;
  setSlideBackground: (id: string, color: string) => void;
  addElement: (slideId: string, element: Omit<SlideElement, "id" | "zIndex">) => string;
  updateElement: (slideId: string, elementId: string, patch: Partial<SlideElement>) => void;
  deleteElement: (slideId: string, elementId: string) => void;
  selectElement: (id: string | null) => void;
  bringForward: (slideId: string, elementId: string) => void;
  sendBackward: (slideId: string, elementId: string) => void;
  loadPresentation: (p: Presentation) => void;
  newPresentation: () => void;
}

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function makeSlide(name: string): Slide {
  return {
    id: uid(),
    name,
    background: "#ffffff",
    elements: [],
  };
}

function defaultTextElement(): Omit<TextElement, "id" | "zIndex"> {
  return {
    type: "text",
    x: 80,
    y: 80,
    width: 360,
    height: 80,
    rotation: 0,
    content: "متن خود را اینجا بنویسید",
    fontSize: 24,
    fontFamily: "Tahoma, sans-serif",
    fontWeight: "normal",
    fontStyle: "normal",
    color: "#1f2937",
    textAlign: "right",
    textDecoration: "none",
    lineHeight: 1.4,
    backgroundColor: "transparent",
    padding: 8,
  };
}

const initialSlide = makeSlide("اسلاید ۱");
initialSlide.elements.push({
  ...defaultTextElement(),
  id: uid(),
  zIndex: 1,
} as TextElement);

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      presentation: {
        title: "ارائه من",
        slides: [initialSlide],
      },
      currentSlideId: initialSlide.id,
      selectedElementId: null,

      setTitle: (title) =>
        set((s) => ({ presentation: { ...s.presentation, title } })),

      addSlide: () => {
        const slides = get().presentation.slides;
        const newSlide = makeSlide(`اسلاید ${slides.length + 1}`);
        set((s) => ({
          presentation: {
            ...s.presentation,
            slides: [...slides, newSlide],
          },
          currentSlideId: newSlide.id,
          selectedElementId: null,
        }));
      },

      deleteSlide: (id) => {
        const { slides } = get().presentation;
        if (slides.length <= 1) return;
        const filtered = slides.filter((s) => s.id !== id);
        const newCurrent =
          get().currentSlideId === id ? filtered[0].id : get().currentSlideId;
        set((s) => ({
          presentation: { ...s.presentation, slides: filtered },
          currentSlideId: newCurrent,
          selectedElementId: null,
        }));
      },

      duplicateSlide: (id) => {
        const { slides } = get().presentation;
        const idx = slides.findIndex((s) => s.id === id);
        if (idx < 0) return;
        const src = slides[idx];
        const copy: Slide = {
          id: uid(),
          name: src.name + " (کپی)",
          background: src.background,
          elements: src.elements.map((el) => ({ ...el, id: uid() })),
        };
        const next = [...slides];
        next.splice(idx + 1, 0, copy);
        set((s) => ({
          presentation: { ...s.presentation, slides: next },
          currentSlideId: copy.id,
          selectedElementId: null,
        }));
      },

      selectSlide: (id) =>
        set({ currentSlideId: id, selectedElementId: null }),

      reorderSlides: (from, to) => {
        const { slides } = get().presentation;
        if (from < 0 || to < 0 || from >= slides.length || to >= slides.length)
          return;
        const next = [...slides];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        set((s) => ({ presentation: { ...s.presentation, slides: next } }));
      },

      setSlideBackground: (id, color) =>
        set((s) => ({
          presentation: {
            ...s.presentation,
            slides: s.presentation.slides.map((sl) =>
              sl.id === id ? { ...sl, background: color } : sl
            ),
          },
        })),

      addElement: (slideId, element) => {
        const id = uid();
        const { slides } = get().presentation;
        const slide = slides.find((s) => s.id === slideId);
        if (!slide) return id;
        const maxZ = slide.elements.reduce(
          (m, el) => Math.max(m, el.zIndex),
          0
        );
        const newEl = { ...element, id, zIndex: maxZ + 1 } as SlideElement;
        set((s) => ({
          presentation: {
            ...s.presentation,
            slides: s.presentation.slides.map((sl) =>
              sl.id === slideId
                ? { ...sl, elements: [...sl.elements, newEl] }
                : sl
            ),
          },
          selectedElementId: id,
        }));
        return id;
      },

      updateElement: (slideId, elementId, patch) =>
        set((s) => ({
          presentation: {
            ...s.presentation,
            slides: s.presentation.slides.map((sl) =>
              sl.id === slideId
                ? {
                    ...sl,
                    elements: sl.elements.map((el) =>
                      el.id === elementId ? ({ ...el, ...patch } as SlideElement) : el
                    ),
                  }
                : sl
            ),
          },
        })),

      deleteElement: (slideId, elementId) =>
        set((s) => ({
          presentation: {
            ...s.presentation,
            slides: s.presentation.slides.map((sl) =>
              sl.id === slideId
                ? {
                    ...sl,
                    elements: sl.elements.filter((el) => el.id !== elementId),
                  }
                : sl
            ),
          },
          selectedElementId: null,
        })),

      selectElement: (id) => set({ selectedElementId: id }),

      bringForward: (slideId, elementId) => {
        const { slides } = get().presentation;
        const slide = slides.find((s) => s.id === slideId);
        if (!slide) return;
        const maxZ = slide.elements.reduce((m, el) => Math.max(m, el.zIndex), 0);
        set((s) => ({
          presentation: {
            ...s.presentation,
            slides: s.presentation.slides.map((sl) =>
              sl.id === slideId
                ? {
                    ...sl,
                    elements: sl.elements.map((el) =>
                      el.id === elementId ? { ...el, zIndex: maxZ + 1 } : el
                    ),
                  }
                : sl
            ),
          },
        }));
      },

      sendBackward: (slideId, elementId) => {
        const { slides } = get().presentation;
        const slide = slides.find((s) => s.id === slideId);
        if (!slide) return;
        const minZ = slide.elements.reduce((m, el) => Math.min(m, el.zIndex), 0);
        set((s) => ({
          presentation: {
            ...s.presentation,
            slides: s.presentation.slides.map((sl) =>
              sl.id === slideId
                ? {
                    ...sl,
                    elements: sl.elements.map((el) =>
                      el.id === elementId ? { ...el, zIndex: minZ - 1 } : el
                    ),
                  }
                : sl
            ),
          },
        }));
      },

      loadPresentation: (p) =>
        set({
          presentation: p,
          currentSlideId: p.slides[0]?.id ?? null,
          selectedElementId: null,
        }),

      newPresentation: () => {
        const slide = makeSlide("اسلاید ۱");
        slide.elements.push({
          ...defaultTextElement(),
          id: uid(),
          zIndex: 1,
        } as TextElement);
        set({
          presentation: { title: "ارائه جدید", slides: [slide] },
          currentSlideId: slide.id,
          selectedElementId: null,
        });
      },
    }),
    {
      name: "slide-editor-storage",
      partialize: (s) => ({
        presentation: s.presentation,
        currentSlideId: s.currentSlideId,
      }),
      merge: (persisted, current) => {
        const p = (persisted as Partial<EditorState>) || {};
        const presentation = p.presentation ?? current.presentation;
        const currentSlideId =
          p.currentSlideId && presentation.slides.some((s) => s.id === p.currentSlideId)
            ? p.currentSlideId
            : presentation.slides[0]?.id ?? null;
        return {
          ...current,
          presentation,
          currentSlideId,
          selectedElementId: null,
        };
      },
    }
  )
);

export function createDefaultTextElement(): Omit<TextElement, "id" | "zIndex"> {
  return defaultTextElement();
}

export function createDefaultImageElement(src: string): Omit<ImageElement, "id" | "zIndex"> {
  return {
    type: "image",
    x: 80,
    y: 120,
    width: 320,
    height: 200,
    rotation: 0,
    src,
    alt: "تصویر کاربر",
    objectFit: "cover",
    borderRadius: 8,
    opacity: 1,
  };
}

export function createDefaultShapeElement(shape: "rectangle" | "ellipse"): Omit<ShapeElement, "id" | "zIndex"> {
  return {
    type: "shape",
    shape,
    x: 120,
    y: 120,
    width: 200,
    height: 140,
    rotation: 0,
    fill: "#f59e0b",
    stroke: "#92400e",
    strokeWidth: 0,
    opacity: 1,
    borderRadius: shape === "rectangle" ? 8 : 999,
  };
}
