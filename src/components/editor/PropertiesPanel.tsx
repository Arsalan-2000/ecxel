"use client";

import { useEditorStore, type TextElement, type ImageElement, type ShapeElement, type SlideElement } from "@/store/editorStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AlignRight, AlignCenter, AlignLeft, Bold, Italic, Underline, Strikethrough, BringToFront, SendToBack, Trash2, Copy } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const FONT_FAMILIES = [
  { label: "Tahoma", value: "Tahoma, sans-serif" },
  { label: "Vazirmatn", value: "Vazirmatn, Tahoma, sans-serif" },
  { label: "Iranian Sans", value: "Iranian Sans, sans-serif" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Times New Roman", value: "Times New Roman, serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Courier New", value: "Courier New, monospace" },
];

const PRESET_COLORS = [
  "#000000", "#ffffff", "#1f2937", "#6b7280", "#ef4444",
  "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899",
  "#06b6d4", "#84cc16", "#f97316", "#a855f7", "#14b8a6",
];

export default function PropertiesPanel() {
  const presentation = useEditorStore((s) => s.presentation);
  const currentSlideId = useEditorStore((s) => s.currentSlideId);
  const selectedElementId = useEditorStore((s) => s.selectedElementId);
  const updateElement = useEditorStore((s) => s.updateElement);
  const deleteElement = useEditorStore((s) => s.deleteElement);
  const bringForward = useEditorStore((s) => s.bringForward);
  const sendBackward = useEditorStore((s) => s.sendBackward);
  const setSlideBackground = useEditorStore((s) => s.setSlideBackground);
  const addElement = useEditorStore((s) => s.addElement);

  const slide = presentation.slides.find((s) => s.id === currentSlideId);
  if (!slide) return null;

  const element = slide.elements.find((e) => e.id === selectedElementId) || null;

  return (
    <div className="h-full flex flex-col bg-background border-l" dir="rtl">
      <div className="p-3 border-b">
        <h3 className="text-sm font-semibold">تنظیمات</h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-5">
          {/* Slide settings */}
          <section className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground">پس‌زمینه اسلاید</div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={slide.background.startsWith("#") ? slide.background : "#ffffff"}
                onChange={(e) => setSlideBackground(slide.id, e.target.value)}
                className="h-9 w-12 rounded border cursor-pointer"
              />
              <Input
                value={slide.background}
                onChange={(e) => setSlideBackground(slide.id, e.target.value)}
                className="h-9"
              />
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {["#ffffff", "#000000", "#f1f5f9", "#0f172a", "#fef3c7", "#dbeafe", "#dcfce7", "#fce7f3", "#e9d5ff", "#fed7aa"].map((c) => (
                <button
                  key={c}
                  className="h-7 rounded border border-border hover:scale-105 transition-transform"
                  style={{ background: c }}
                  onClick={() => setSlideBackground(slide.id, c)}
                  title={c}
                />
              ))}
            </div>
          </section>

          {element ? (
            <ElementProperties
              element={element}
              onUpdate={(patch) => updateElement(slide.id, element.id, patch)}
              onDelete={() => deleteElement(slide.id, element.id)}
              onBringForward={() => bringForward(slide.id, element.id)}
              onSendBackward={() => sendBackward(slide.id, element.id)}
              onDuplicate={() => {
                const copy = { ...element, x: element.x + 20, y: element.y + 20 };
                // strip id and zIndex so addElement assigns new ones
                const { id, zIndex, ...rest } = copy;
                addElement(slide.id, rest as any);
              }}
            />
          ) : (
            <div className="text-xs text-muted-foreground py-8 text-center">
              برای ویرایش یک عنصر را انتخاب کنید
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface EPProps {
  element: SlideElement;
  onUpdate: (patch: Partial<SlideElement>) => void;
  onDelete: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onDuplicate: () => void;
}

function ElementProperties({ element, onUpdate, onDelete, onBringForward, onSendBackward, onDuplicate }: EPProps) {
  return (
    <div className="space-y-5">
      {/* Position & Size */}
      <section className="space-y-2">
        <div className="text-xs font-semibold text-muted-foreground">موقعیت و اندازه</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">X</Label>
            <Input
              type="number"
              value={Math.round(element.x)}
              onChange={(e) => onUpdate({ x: Number(e.target.value) } as any)}
              className="h-8"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Y</Label>
            <Input
              type="number"
              value={Math.round(element.y)}
              onChange={(e) => onUpdate({ y: Number(e.target.value) } as any)}
              className="h-8"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">عرض (W)</Label>
            <Input
              type="number"
              value={Math.round(element.width)}
              onChange={(e) => onUpdate({ width: Math.max(20, Number(e.target.value)) } as any)}
              className="h-8"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">ارتفاع (H)</Label>
            <Input
              type="number"
              value={Math.round(element.height)}
              onChange={(e) => onUpdate({ height: Math.max(20, Number(e.target.value)) } as any)}
              className="h-8"
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">چرخش: <span dir="ltr" className="inline-block">{element.rotation || 0}°</span></Label>
          <Slider
            value={[element.rotation || 0]}
            onValueChange={(v) => onUpdate({ rotation: v[0] } as any)}
            min={-180}
            max={180}
            step={1}
          />
        </div>
      </section>

      {element.type === "text" && <TextProperties element={element as TextElement} onUpdate={onUpdate} />}
      {element.type === "image" && <ImageProperties element={element as ImageElement} onUpdate={onUpdate} />}
      {element.type === "shape" && <ShapeProperties element={element as ShapeElement} onUpdate={onUpdate} />}

      <section className="space-y-2">
        <div className="text-xs font-semibold text-muted-foreground">ترتیب لایه</div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={onBringForward} className="gap-1">
            <BringToFront className="h-4 w-4" /> جلو
          </Button>
          <Button variant="outline" size="sm" onClick={onSendBackward} className="gap-1">
            <SendToBack className="h-4 w-4" /> عقب
          </Button>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t">
        <Button variant="outline" size="sm" onClick={onDuplicate} className="gap-1">
          <Copy className="h-4 w-4" /> کپی
        </Button>
        <Button variant="destructive" size="sm" onClick={onDelete} className="gap-1">
          <Trash2 className="h-4 w-4" /> حذف
        </Button>
      </div>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value && value.startsWith("#") ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-10 rounded border cursor-pointer"
        />
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="h-8"
        />
      </div>
    </div>
  );
}

function PresetColorGrid({ onSelect }: { onSelect: (c: string) => void }) {
  return (
    <div className="grid grid-cols-5 gap-1.5">
      {PRESET_COLORS.map((c) => (
        <button
          key={c}
          className="h-6 rounded border border-border hover:scale-110 transition-transform"
          style={{ background: c }}
          onClick={() => onSelect(c)}
          title={c}
        />
      ))}
    </div>
  );
}

function TextProperties({ element, onUpdate }: { element: TextElement; onUpdate: (patch: Partial<SlideElement>) => void }) {
  return (
    <>
      <section className="space-y-2">
        <div className="text-xs font-semibold text-muted-foreground">متن</div>
        <Textarea
          value={element.content}
          onChange={(e) => onUpdate({ content: e.target.value } as any)}
          rows={4}
          dir="rtl"
          className="text-sm"
        />
      </section>

      <section className="space-y-2">
        <div className="text-xs font-semibold text-muted-foreground">فونت</div>
        <select
          value={element.fontFamily}
          onChange={(e) => onUpdate({ fontFamily: e.target.value } as any)}
          className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm"
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={element.fontSize}
            onChange={(e) => onUpdate({ fontSize: Math.max(6, Number(e.target.value)) } as any)}
            className="h-8 w-20"
          />
          <span className="text-xs text-muted-foreground">px</span>
          <div className="flex-1">
            <Slider
              value={[element.fontSize]}
              onValueChange={(v) => onUpdate({ fontSize: v[0] } as any)}
              min={8}
              max={120}
              step={1}
            />
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <div className="text-xs font-semibold text-muted-foreground">سبک متن</div>
        <div className="flex flex-wrap gap-1">
          <Toggle pressed={element.fontWeight === "bold"} onPressedChange={(p) => onUpdate({ fontWeight: p ? "bold" : "normal" } as any)} aria-label="bold">
            <Bold className="h-4 w-4" />
          </Toggle>
          <Toggle pressed={element.fontStyle === "italic"} onPressedChange={(p) => onUpdate({ fontStyle: p ? "italic" : "normal" } as any)} aria-label="italic">
            <Italic className="h-4 w-4" />
          </Toggle>
          <Toggle pressed={element.textDecoration === "underline"} onPressedChange={(p) => onUpdate({ textDecoration: p ? "underline" : "none" } as any)} aria-label="underline">
            <Underline className="h-4 w-4" />
          </Toggle>
          <Toggle pressed={element.textDecoration === "line-through"} onPressedChange={(p) => onUpdate({ textDecoration: p ? "line-through" : "none" } as any)} aria-label="strike">
            <Strikethrough className="h-4 w-4" />
          </Toggle>
        </div>
        <ToggleGroup
          type="single"
          value={element.textAlign}
          onValueChange={(v) => v && onUpdate({ textAlign: v as any } as any)}
          className="justify-start"
        >
          <ToggleGroupItem value="right" aria-label="right"><AlignRight className="h-4 w-4" /></ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="center"><AlignCenter className="h-4 w-4" /></ToggleGroupItem>
          <ToggleGroupItem value="left" aria-label="left"><AlignLeft className="h-4 w-4" /></ToggleGroupItem>
        </ToggleGroup>
      </section>

      <section className="space-y-2">
        <div className="text-xs font-semibold text-muted-foreground">رنگ متن</div>
        <ColorField label="رنگ" value={element.color} onChange={(v) => onUpdate({ color: v } as any)} />
        <PresetColorGrid onSelect={(c) => onUpdate({ color: c } as any)} />
      </section>

      <section className="space-y-2">
        <div className="text-xs font-semibold text-muted-foreground">پس‌زمینه متن</div>
        <div className="flex gap-1.5">
          <Button
            size="sm"
            variant={element.backgroundColor === "transparent" ? "default" : "outline"}
            onClick={() => onUpdate({ backgroundColor: "transparent" } as any)}
            className="h-7"
          >
            بدون پس‌زمینه
          </Button>
        </div>
        <ColorField label="رنگ" value={element.backgroundColor === "transparent" ? "#ffffff" : element.backgroundColor} onChange={(v) => onUpdate({ backgroundColor: v } as any)} />
      </section>

      <section className="space-y-2">
        <div className="text-xs font-semibold text-muted-foreground">فاصله خطوط و حاشیه</div>
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">ارتفاع خط: <span dir="ltr" className="inline-block">{element.lineHeight.toFixed(2)}</span></Label>
          <Slider value={[element.lineSpacing || element.lineHeight]} onValueChange={(v) => onUpdate({ lineHeight: v[0] } as any)} min={1} max={3} step={0.1} />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">حاشیه داخلی: <span dir="ltr" className="inline-block">{element.padding} px</span></Label>
          <Slider value={[element.padding]} onValueChange={(v) => onUpdate({ padding: v[0] } as any)} min={0} max={48} step={1} />
        </div>
      </section>
    </>
  );
}

function ImageProperties({ element, onUpdate }: { element: ImageElement; onUpdate: (patch: Partial<SlideElement>) => void }) {
  return (
    <>
      <section className="space-y-2">
        <div className="text-xs font-semibold text-muted-foreground">نحوه نمایش</div>
        <select
          value={element.objectFit}
          onChange={(e) => onUpdate({ objectFit: e.target.value as any } as any)}
          className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm"
        >
          <option value="cover">پر کردن (cover)</option>
          <option value="contain">جا شدن (contain)</option>
          <option value="fill">کشیدن (fill)</option>
        </select>
      </section>
      <section className="space-y-2">
        <div className="text-xs font-semibold text-muted-foreground">گردی گوشه‌ها: <span dir="ltr" className="inline-block">{element.borderRadius} px</span></div>
        <Slider value={[element.borderRadius]} onValueChange={(v) => onUpdate({ borderRadius: v[0] } as any)} min={0} max={200} step={1} />
      </section>
      <section className="space-y-2">
        <div className="text-xs font-semibold text-muted-foreground">کدری: <span dir="ltr" className="inline-block">{Math.round(element.opacity * 100)}%</span></div>
        <Slider value={[Math.round(element.opacity * 100)]} onValueChange={(v) => onUpdate({ opacity: v[0] / 100 } as any)} min={0} max={100} step={1} />
      </section>
    </>
  );
}

function ShapeProperties({ element, onUpdate }: { element: ShapeElement; onUpdate: (patch: Partial<SlideElement>) => void }) {
  return (
    <>
      <section className="space-y-2">
        <div className="text-xs font-semibold text-muted-foreground">رنگ پر شدن</div>
        <ColorField label="رنگ" value={element.fill} onChange={(v) => onUpdate({ fill: v } as any)} />
        <PresetColorGrid onSelect={(c) => onUpdate({ fill: c } as any)} />
      </section>
      <section className="space-y-2">
        <div className="text-xs font-semibold text-muted-foreground">ضخامت خط دور: <span dir="ltr" className="inline-block">{element.strokeWidth} px</span></div>
        <Slider value={[element.strokeWidth]} onValueChange={(v) => onUpdate({ strokeWidth: v[0] } as any)} min={0} max={20} step={1} />
      </section>
      {element.shape === "rectangle" && (
        <section className="space-y-2">
          <div className="text-xs font-semibold text-muted-foreground">گردی گوشه‌ها: <span dir="ltr" className="inline-block">{element.borderRadius} px</span></div>
          <Slider value={[element.borderRadius]} onValueChange={(v) => onUpdate({ borderRadius: v[0] } as any)} min={0} max={200} step={1} />
        </section>
      )}
      <section className="space-y-2">
        <div className="text-xs font-semibold text-muted-foreground">کدری: <span dir="ltr" className="inline-block">{Math.round(element.opacity * 100)}%</span></div>
        <Slider value={[Math.round(element.opacity * 100)]} onValueChange={(v) => onUpdate({ opacity: v[0] / 100 } as any)} min={0} max={100} step={1} />
      </section>
    </>
  );
}
