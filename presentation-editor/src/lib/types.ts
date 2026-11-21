export type ElementType = 'text' | 'image'

export type TextAlign = 'left' | 'center' | 'right'

export interface TextStyle {
  fontSize: number
  fontFamily: string
  color: string
  bold: boolean
  italic: boolean
  underline: boolean
  align: TextAlign
  lineHeight: number
}

export interface CanvasElement {
  id: string
  type: ElementType
  x: number // percent of slide width (0-100)
  y: number // percent of slide height (0-100)
  width: number // percent of slide width (0-100)
  height: number // percent of slide height (0-100)
  rotation: number // degrees
  content: string // text content or image data URL
  style: TextStyle
  zIndex: number
  opacity: number
}

export type BackgroundType = 'solid' | 'gradient'

export interface SlideBackground {
  type: BackgroundType
  color1: string
  color2: string
}

export interface Slide {
  id: string
  name: string
  elements: CanvasElement[]
  background: SlideBackground
}

export interface EditorState {
  slides: Slide[]
  currentSlideIndex: number
  selectedElementId: string | null
}

export const PRESENTATION_ASPECT_RATIO = 16 / 9 // standard presentation

export const DEFAULT_TEXT_STYLE: TextStyle = {
  fontSize: 24,
  fontFamily: 'Inter, sans-serif',
  color: '#1f2937',
  bold: false,
  italic: false,
  underline: false,
  align: 'left',
  lineHeight: 1.4,
}

export const DEFAULT_GRADIENT: SlideBackground = {
  type: 'solid',
  color1: '#ffffff',
  color2: '#f3f4f6',
}
