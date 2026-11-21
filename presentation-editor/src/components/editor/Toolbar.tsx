'use client'

import { useState } from 'react'
import { useEditorStore } from '@/store/editor-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Type,
  FileText,
  Download,
  Presentation,
  Trash2,
  Loader2,
} from 'lucide-react'
import { ImageUploadButton } from './ImageUploadButton'
import { exportToPdf, exportToPptx } from '@/lib/export'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export function Toolbar() {
  const addTextElement = useEditorStore((s) => s.addTextElement)
  const slides = useEditorStore((s) => s.slides)
  const presentationTitle = useEditorStore((s) => s.presentationTitle)
  const setPresentationTitle = useEditorStore((s) => s.setPresentationTitle)
  const newPresentation = useEditorStore((s) => s.newPresentation)

  const [exporting, setExporting] = useState<'pdf' | 'pptx' | null>(null)

  const handleExportPdf = async () => {
    setExporting('pdf')
    try {
      await exportToPdf({ title: presentationTitle, slides })
    } finally {
      setExporting(null)
    }
  }

  const handleExportPptx = async () => {
    setExporting('pptx')
    try {
      await exportToPptx({ title: presentationTitle, slides })
    } finally {
      setExporting(null)
    }
  }

  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800 bg-background">
      <div className="flex items-center gap-2 px-3 py-2 flex-wrap">
        <div className="flex items-center gap-2 pl-2 border-l border-neutral-200 dark:border-neutral-800">
          <Presentation className="h-5 w-5 text-emerald-600" />
          <span className="text-sm font-semibold hidden sm:inline">ویرایشگر ارائه</span>
        </div>

        <Input
          value={presentationTitle}
          onChange={(e) => setPresentationTitle(e.target.value)}
          className="h-9 w-48 sm:w-64 text-sm"
          placeholder="عنوان ارائه"
          dir="auto"
        />

        <div className="flex items-center gap-1 px-2 border-r border-neutral-200 dark:border-neutral-800 mr-auto">
          <Button
            size="sm"
            variant="ghost"
            className="gap-2"
            onClick={() => addTextElement('عنوان جدید')}
          >
            <Type className="h-4 w-4" />
            <span className="hidden sm:inline">عنوان</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="gap-2"
            onClick={() => addTextElement('متن جدید را اینجا بنویسید')}
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">متن</span>
          </Button>
          <ImageUploadButton />
        </div>

        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-2" disabled={exporting !== null}>
                {exporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">خروجی</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportPdf} disabled={exporting !== null}>
                <FileText className="h-4 w-4 ml-2" />
                خروجی PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPptx} disabled={exporting !== null}>
                <Presentation className="h-4 w-4 ml-2" />
                خروجی PowerPoint (.pptx)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="ghost" className="gap-2 text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">جدید</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>شروع ارائه جدید؟</AlertDialogTitle>
                <AlertDialogDescription>
                  تمام اسلایدهای فعلی حذف خواهند شد. این عمل قابل بازگشت نیست.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>انصراف</AlertDialogCancel>
                <AlertDialogAction onClick={newPresentation}>شروع جدید</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </header>
  )
}
