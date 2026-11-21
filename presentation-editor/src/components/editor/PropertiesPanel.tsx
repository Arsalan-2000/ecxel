'use client'

import { useEditorStore } from '@/store/editor-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Copy,
  Trash2,
  BringToFront,
  SendToBack,
} from 'lucide-react'
import { Toggle } from '@/components/ui/toggle'
import { cn } from '@/lib/utils'
import { CanvasElement, SlideBackground } from '@/lib/types'

const FONT_FAMILIES = [
  { label: 'Inter (سانس)', value: 'Inter, sans-serif' },
  { label: 'Vazirmatn (وزیر)', value: 'Vazirmatn, sans-serif' },
  { label: 'Noto Naskh (نسخ)', value: '"Noto Naskh Arabic", serif' },
  { label: 'Noto Serif (سریف)', value: '"Noto Serif", serif' },
  { label: 'Tahoma', value: 'Tahoma, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Courier', value: '"Courier New", monospace' },
]

const COLOR_PRESETS = [
  '#1f2937', '#374151', '#6b7280', '#9ca3af',
  '#ef4444', '#f97316', '#f59e0b', '#10b981',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
  '#ffffff', '#000000',
]

function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  suffix,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  suffix?: string
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-neutral-500">{label}</Label>
      <div className="flex items-center gap-1">
        <Input
          type="number"
          value={Math.round(value * 10) / 10}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const v = parseFloat(e.target.value)
            if (!isNaN(v)) onChange(Math.max(min, Math.min(max, v)))
          }}
          className="h-8 text-xs"
        />
        {suffix && <span className="text-xs text-neutral-400">{suffix}</span>}
      </div>
    </div>
  )
}

function ElementProperties({ element }: { element: CanvasElement }) {
  const updateElement = useEditorStore((s) => s.updateElement)
  const updateElementStyle = useEditorStore((s) => s.updateElementStyle)
  const updateElementGeometry = useEditorStore((s) => s.updateElementGeometry)
  const deleteElement = useEditorStore((s) => s.deleteElement)
  const duplicateElement = useEditorStore((s) => s.duplicateElement)
  const bringForward = useEditorStore((s) => s.bringForward)
  const sendBackward = useEditorStore((s) => s.sendBackward)

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => duplicateElement(element.id)}>
          <Copy className="h-3 w-3" />
          کپی
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 gap-1"
          onClick={() => bringForward(element.id)}
        >
          <BringToFront className="h-3 w-3" />
          جلو
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 gap-1"
          onClick={() => sendBackward(element.id)}
        >
          <SendToBack className="h-3 w-3" />
          عقب
        </Button>
        <Button
          size="sm"
          variant="destructive"
          className="gap-1"
          onClick={() => deleteElement(element.id)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <NumberField
          label="موقعیت X"
          value={element.x}
          onChange={(v) => updateElementGeometry(element.id, { x: v })}
          suffix="٪"
        />
        <NumberField
          label="موقعیت Y"
          value={element.y}
          onChange={(v) => updateElementGeometry(element.id, { y: v })}
          suffix="٪"
        />
        <NumberField
          label="عرض"
          value={element.width}
          onChange={(v) => updateElementGeometry(element.id, { width: v })}
          suffix="٪"
        />
        <NumberField
          label="ارتفاع"
          value={element.height}
          onChange={(v) => updateElementGeometry(element.id, { height: v })}
          suffix="٪"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-neutral-500">چرخش (درجه)</Label>
        <Slider
          value={[element.rotation]}
          min={-180}
          max={180}
          step={1}
          onValueChange={([v]) => updateElementGeometry(element.id, { rotation: v })}
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-neutral-500">شفافیت</Label>
        <Slider
          value={[element.opacity * 100]}
          min={0}
          max={100}
          step={1}
          onValueChange={([v]) => updateElement(element.id, { opacity: v / 100 })}
        />
      </div>

      {element.type === 'text' && (
        <>
          <div className="border-t border-neutral-200 dark:border-neutral-800 pt-3 space-y-3">
            <div className="space-y-1">
              <Label className="text-xs text-neutral-500">فونت</Label>
              <Select
                value={element.style.fontFamily}
                onValueChange={(v) => updateElementStyle(element.id, { fontFamily: v })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_FAMILIES.map((f) => (
                    <SelectItem key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-neutral-500">اندازه متن: {element.style.fontSize}px</Label>
              <Slider
                value={[element.style.fontSize]}
                min={8}
                max={120}
                step={1}
                onValueChange={([v]) => updateElementStyle(element.id, { fontSize: v })}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-neutral-500">ارتفاع خط: {element.style.lineHeight.toFixed(1)}</Label>
              <Slider
                value={[element.style.lineHeight * 10]}
                min={10}
                max={30}
                step={1}
                onValueChange={([v]) => updateElementStyle(element.id, { lineHeight: v / 10 })}
              />
            </div>

            <div className="flex gap-1">
              <Toggle
                size="sm"
                pressed={element.style.bold}
                onPressedChange={(v) => updateElementStyle(element.id, { bold: v })}
                aria-label="Bold"
              >
                <Bold className="h-4 w-4" />
              </Toggle>
              <Toggle
                size="sm"
                pressed={element.style.italic}
                onPressedChange={(v) => updateElementStyle(element.id, { italic: v })}
                aria-label="Italic"
              >
                <Italic className="h-4 w-4" />
              </Toggle>
              <Toggle
                size="sm"
                pressed={element.style.underline}
                onPressedChange={(v) => updateElementStyle(element.id, { underline: v })}
                aria-label="Underline"
              >
                <Underline className="h-4 w-4" />
              </Toggle>
              <div className="w-px bg-neutral-200 dark:bg-neutral-700 mx-1" />
              <Toggle
                size="sm"
                pressed={element.style.align === 'left'}
                onPressedChange={(v) =>
                  v && updateElementStyle(element.id, { align: 'left' })
                }
                aria-label="Align left"
              >
                <AlignLeft className="h-4 w-4" />
              </Toggle>
              <Toggle
                size="sm"
                pressed={element.style.align === 'center'}
                onPressedChange={(v) =>
                  v && updateElementStyle(element.id, { align: 'center' })
                }
                aria-label="Align center"
              >
                <AlignCenter className="h-4 w-4" />
              </Toggle>
              <Toggle
                size="sm"
                pressed={element.style.align === 'right'}
                onPressedChange={(v) =>
                  v && updateElementStyle(element.id, { align: 'right' })
                }
                aria-label="Align right"
              >
                <AlignRight className="h-4 w-4" />
              </Toggle>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-neutral-500">رنگ متن</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={element.style.color}
                  onChange={(e) => updateElementStyle(element.id, { color: e.target.value })}
                  className="h-8 w-10 rounded border border-neutral-200 dark:border-neutral-700 cursor-pointer"
                />
                <Input
                  value={element.style.color}
                  onChange={(e) => updateElementStyle(element.id, { color: e.target.value })}
                  className="h-8 text-xs flex-1"
                />
              </div>
              <div className="grid grid-cols-7 gap-1 mt-2">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    onClick={() => updateElementStyle(element.id, { color: c })}
                    className={cn(
                      'h-6 rounded border border-neutral-200 dark:border-neutral-700',
                      element.style.color === c && 'ring-2 ring-emerald-500',
                    )}
                    style={{ background: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function SlideBackgroundEditor({ background }: { background: SlideBackground }) {
  const updateSlideBackground = useEditorStore((s) => s.updateSlideBackground)

  const PRESET_BG = [
    { name: 'سفید', bg: { type: 'solid' as const, color1: '#ffffff', color2: '#ffffff' } },
    { name: 'مشکی', bg: { type: 'solid' as const, color1: '#0a0a0a', color2: '#0a0a0a' } },
    { name: 'خاکستری روشن', bg: { type: 'solid' as const, color1: '#f3f4f6', color2: '#f3f4f6' } },
    { name: 'کرم', bg: { type: 'solid' as const, color1: '#fef9e7', color2: '#fef9e7' } },
    {
      name: 'گرادیان آبی-سبز',
      bg: { type: 'gradient' as const, color1: '#0ea5e9', color2: '#10b981' },
    },
    {
      name: 'گرادیان بنفش-صورتی',
      bg: { type: 'gradient' as const, color1: '#8b5cf6', color2: '#ec4899' },
    },
    {
      name: 'گرادیان نارنجی-قرمز',
      bg: { type: 'gradient' as const, color1: '#f97316', color2: '#ef4444' },
    },
    {
      name: 'گرادیان تیره',
      bg: { type: 'gradient' as const, color1: '#1e293b', color2: '#334155' },
    },
  ]

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs text-neutral-500 mb-2 block">قالب آماده پس‌زمینه</Label>
        <div className="grid grid-cols-2 gap-2">
          {PRESET_BG.map((p) => (
            <button
              key={p.name}
              onClick={() => updateSlideBackground(p.bg)}
              className="h-12 rounded border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-white/90 shadow-inner"
              style={{
                background:
                  p.bg.type === 'gradient'
                    ? `linear-gradient(135deg, ${p.bg.color1}, ${p.bg.color2})`
                    : p.bg.color1,
                color:
                  p.bg.color1 === '#ffffff' || p.bg.color1 === '#f3f4f6' || p.bg.color1 === '#fef9e7'
                    ? '#1f2937'
                    : '#ffffff',
              }}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-neutral-200 dark:border-neutral-800 pt-3 space-y-2">
        <Label className="text-xs text-neutral-500">نوع پس‌زمینه</Label>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={background.type === 'solid' ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => updateSlideBackground({ type: 'solid' })}
          >
            رنگ ثابت
          </Button>
          <Button
            size="sm"
            variant={background.type === 'gradient' ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => updateSlideBackground({ type: 'gradient' })}
          >
            گرادیان
          </Button>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-neutral-500">رنگ ۱</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={background.color1}
              onChange={(e) => updateSlideBackground({ color1: e.target.value })}
              className="h-8 w-10 rounded border border-neutral-200 dark:border-neutral-700 cursor-pointer"
            />
            <Input
              value={background.color1}
              onChange={(e) => updateSlideBackground({ color1: e.target.value })}
              className="h-8 text-xs flex-1"
            />
          </div>
        </div>
        {background.type === 'gradient' && (
          <div className="space-y-1">
            <Label className="text-xs text-neutral-500">رنگ ۲</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={background.color2}
                onChange={(e) => updateSlideBackground({ color2: e.target.value })}
                className="h-8 w-10 rounded border border-neutral-200 dark:border-neutral-700 cursor-pointer"
              />
              <Input
                value={background.color2}
                onChange={(e) => updateSlideBackground({ color2: e.target.value })}
                className="h-8 text-xs flex-1"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function PropertiesPanel() {
  const slides = useEditorStore((s) => s.slides)
  const currentSlideIndex = useEditorStore((s) => s.currentSlideIndex)
  const selectedElementId = useEditorStore((s) => s.selectedElementId)
  const slide = slides[currentSlideIndex]
  const selectedElement = slide?.elements.find((e) => e.id === selectedElementId)

  return (
    <aside className="w-72 shrink-0 border-r border-neutral-200 dark:border-neutral-800 bg-background flex flex-col">
      <div className="p-3 border-b border-neutral-200 dark:border-neutral-800">
        <span className="text-sm font-medium">ویژگی‌ها</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        {selectedElement ? (
          <ElementProperties element={selectedElement} />
        ) : (
          <Tabs defaultValue="background">
            <TabsList className="w-full">
              <TabsTrigger value="background" className="flex-1">پس‌زمینه</TabsTrigger>
              <TabsTrigger value="info" className="flex-1">راهنما</TabsTrigger>
            </TabsList>
            <TabsContent value="background" className="mt-3">
              {slide && <SlideBackgroundEditor background={slide.background} />}
            </TabsContent>
            <TabsContent value="info" className="mt-3 text-xs text-neutral-500 space-y-2">
              <p>برای ویرایش متن روی آن دابل‌کلیک کنید.</p>
              <p>برای جابجایی المان آن را بکشید و برای تغییر اندازه از گوشه‌ها استفاده کنید.</p>
              <p>برای انتخاب یک المان روی آن کلیک کنید. برای لغو انتخاب روی فضای خالی کلیک کنید.</p>
              <p>کلید Delete المان انتخاب‌شده را حذف می‌کند.</p>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </aside>
  )
}
