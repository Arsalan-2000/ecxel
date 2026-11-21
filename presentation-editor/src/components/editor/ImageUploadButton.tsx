'use client'

import { useRef } from 'react'
import { ImagePlus } from 'lucide-react'
import { useEditorStore } from '@/store/editor-store'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

const MAX_FILE_SIZE_MB = 5

export function ImageUploadButton() {
  const inputRef = useRef<HTMLInputElement>(null)
  const addImageElement = useEditorStore((s) => s.addImageElement)

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('فقط فایل تصویری مجاز است')
      return
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`حجم تصویر باید کمتر از ${MAX_FILE_SIZE_MB} مگابایت باشد`)
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result === 'string') {
        addImageElement(result)
        toast.success('تصویر اضافه شد')
      }
    }
    reader.onerror = () => toast.error('خطا در خواندن فایل')
    reader.readAsDataURL(file)
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        className="gap-2"
      >
        <ImagePlus className="h-4 w-4" />
        تصویر
      </Button>
    </>
  )
}
