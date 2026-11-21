'use client'

import jsPDF from 'jspdf'
import html2canvas from 'html2canvas-pro'
import { toast } from 'sonner'
import { Slide } from '@/lib/types'

interface ExportOptions {
  title: string
  slides: Slide[]
}

/**
 * Render each slide into a hidden canvas at a fixed size, then export to PDF.
 * We use the EditorCanvas with interactive=false to render each slide cleanly.
 * Since the visible canvas already renders the current slide, we render off-screen
 * copies of all slides into hidden DOM nodes.
 */
export async function exportToPdf({ title, slides }: ExportOptions) {
  if (!slides.length) {
    toast.error('اسلایدی برای خروجی وجود ندارد')
    return
  }
  const loadingToast = toast.loading('در حال آماده‌سازی PDF...')
  try {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: [960, 540],
    })
    const slideWidth = 960
    const slideHeight = 540

    // Build a hidden container that holds every slide as a static render
    const host = document.createElement('div')
    host.style.position = 'fixed'
    host.style.left = '-99999px'
    host.style.top = '0'
    host.style.background = '#fff'
    host.style.pointerEvents = 'none'
    host.style.zIndex = '-1'
    document.body.appendChild(host)

    try {
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i]
        const slideEl = renderStaticSlide(slide, slideWidth, slideHeight)
        host.appendChild(slideEl)

        // wait for images to load
        await waitForImages(slideEl)

        const canvas = await html2canvas(slideEl, {
          scale: 2,
          backgroundColor: null,
          logging: false,
          useCORS: true,
          width: slideWidth,
          height: slideHeight,
        })

        if (i > 0) pdf.addPage([slideWidth, slideHeight], 'landscape')
        const imgData = canvas.toDataURL('image/jpeg', 0.92)
        pdf.addImage(imgData, 'JPEG', 0, 0, slideWidth, slideHeight, undefined, 'FAST')
        host.removeChild(slideEl)
      }
    } finally {
      document.body.removeChild(host)
    }

    const safeTitle = title.replace(/[\\/:*?"<>|]/g, '_') || 'presentation'
    pdf.save(`${safeTitle}.pdf`)
    toast.success('PDF با موفقیت ساخته شد', { id: loadingToast })
  } catch (e) {
    console.error(e)
    toast.error('خطا در ساخت PDF', { id: loadingToast })
  }
}

interface PptxStatic {
  default: new () => any
}

export async function exportToPptx({ title, slides }: ExportOptions) {
  if (!slides.length) {
    toast.error('اسلایدی برای خروجی وجود ندارد')
    return
  }
  const loadingToast = toast.loading('در حال آماده‌سازی PowerPoint...')
  try {
    // dynamic import to keep pptxgenjs out of the initial bundle
    const PptxModule = (await import('pptxgenjs')) as unknown as PptxStatic
    const pptx = new PptxModule.default()

    pptx.layout = 'LAYOUT_WIDE' // 13.333 x 7.5 inches (16:9)
    pptx.title = title
    pptx.author = 'Presentation Editor'
    pptx.company = 'Z.ai'

    // Convert slide dimensions (100% based) to inches
    const slideW = 13.333
    const slideH = 7.5

    for (const slide of slides) {
      const s = pptx.addSlide()
      if (slide.background.type === 'gradient') {
        // pptxgenjs supports fill but not gradient directly — use first color
        s.background = { color: hexToRgb(slide.background.color1) }
      } else {
        s.background = { color: hexToRgb(slide.background.color1) }
      }

      // sort elements by zIndex
      const sorted = [...slide.elements].sort((a, b) => a.zIndex - b.zIndex)

      for (const el of sorted) {
        const x = (el.x / 100) * slideW
        const y = (el.y / 100) * slideH
        const w = (el.width / 100) * slideW
        const h = (el.height / 100) * slideH

        if (el.type === 'image' && el.content.startsWith('data:')) {
          try {
            s.addImage({
              data: el.content,
              x,
              y,
              w,
              h,
              rotate: el.rotation || undefined,
            })
          } catch (err) {
            console.warn('Failed to add image', err)
          }
        } else if (el.type === 'text') {
          const fontSizePt = Math.max(8, Math.round(el.style.fontSize * 0.75))
          s.addText(el.content || ' ', {
            x,
            y,
            w,
            h,
            fontSize: fontSizePt,
            fontFace: mapFontFamily(el.style.fontFamily),
            color: hexToRgb(el.style.color),
            bold: el.style.bold,
            italic: el.style.italic,
            underline: { style: 'sng' as const, color: hexToRgb(el.style.color) },
            align: el.style.align === 'center' ? 'center' : el.style.align === 'right' ? 'right' : 'left',
            valign: 'top',
            lineSpacingMultiple: el.style.lineHeight,
            transparency: Math.round((1 - el.opacity) * 100),
            rotate: el.rotation || undefined,
            rtl: true,
          })
        }
      }
    }

    const safeTitle = title.replace(/[\\/:*?"<>|]/g, '_') || 'presentation'
    await pptx.writeFile({ fileName: `${safeTitle}.pptx` })
    toast.success('PowerPoint با موفقیت ساخته شد', { id: loadingToast })
  } catch (e) {
    console.error(e)
    toast.error('خطا در ساخت PowerPoint', { id: loadingToast })
  }
}

function mapFontFamily(font: string): string {
  if (font.includes('Vazirmatn')) return 'Vazirmatn'
  if (font.includes('Noto Naskh')) return 'Arial'
  if (font.includes('Noto Serif')) return 'Georgia'
  if (font.includes('Georgia')) return 'Georgia'
  if (font.includes('Courier')) return 'Courier New'
  if (font.includes('Tahoma')) return 'Tahoma'
  return 'Arial'
}

function hexToRgb(hex: string): string {
  if (!hex.startsWith('#')) return '000000'
  const cleaned = hex.replace('#', '')
  const full =
    cleaned.length === 3
      ? cleaned
          .split('')
          .map((c) => c + c)
          .join('')
      : cleaned
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return '000000'
  return [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase()
}

function renderStaticSlide(slide: Slide, width: number, height: number): HTMLDivElement {
  const wrapper = document.createElement('div')
  wrapper.style.width = `${width}px`
  wrapper.style.height = `${height}px`
  wrapper.style.position = 'relative'
  wrapper.style.overflow = 'hidden'
  wrapper.style.fontFamily = 'Inter, sans-serif'
  wrapper.style.direction = 'ltr'

  const bg =
    slide.background.type === 'gradient'
      ? `linear-gradient(135deg, ${slide.background.color1}, ${slide.background.color2})`
      : slide.background.color1
  wrapper.style.background = bg

  const sorted = [...slide.elements].sort((a, b) => a.zIndex - b.zIndex)
  for (const el of sorted) {
    if (el.type === 'image') {
      const img = document.createElement('img')
      img.src = el.content
      img.style.position = 'absolute'
      img.style.left = `${el.x}%`
      img.style.top = `${el.y}%`
      img.style.width = `${el.width}%`
      img.style.height = `${el.height}%`
      img.style.objectFit = 'cover'
      img.style.transform = `rotate(${el.rotation}deg)`
      img.style.transformOrigin = 'center'
      img.style.opacity = String(el.opacity)
      img.style.zIndex = String(el.zIndex)
      img.crossOrigin = 'anonymous'
      wrapper.appendChild(img)
    } else {
      const div = document.createElement('div')
      div.innerText = el.content
      div.style.position = 'absolute'
      div.style.left = `${el.x}%`
      div.style.top = `${el.y}%`
      div.style.width = `${el.width}%`
      div.style.height = `${el.height}%`
      div.style.fontSize = `${el.style.fontSize}px`
      div.style.fontFamily = el.style.fontFamily
      div.style.color = el.style.color
      div.style.fontWeight = el.style.bold ? 'bold' : 'normal'
      div.style.fontStyle = el.style.italic ? 'italic' : 'normal'
      div.style.textDecoration = el.style.underline ? 'underline' : 'none'
      div.style.textAlign = el.style.align
      div.style.lineHeight = String(el.style.lineHeight)
      div.style.transform = `rotate(${el.rotation}deg)`
      div.style.transformOrigin = 'center'
      div.style.opacity = String(el.opacity)
      div.style.zIndex = String(el.zIndex)
      div.style.overflow = 'hidden'
      div.style.wordBreak = 'break-word'
      div.style.whiteSpace = 'pre-wrap'
      div.dir = 'auto'
      wrapper.appendChild(div)
    }
  }
  return wrapper
}

function waitForImages(el: HTMLElement): Promise<void> {
  const imgs = Array.from(el.querySelectorAll('img'))
  if (!imgs.length) return Promise.resolve()
  return Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) return resolve()
          img.onload = () => resolve()
          img.onerror = () => resolve()
        }),
    ),
  ).then(() => undefined)
}
