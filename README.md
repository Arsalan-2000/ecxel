# ویرایشگر اسلاید (Slide Editor)

یک ویرایشگر ارائه‌ی تحت وب با امکان ساخت، ویرایش و طراحی اسلایدها و گرفتن خروجی PDF و پاورپوینت.

## امکانات

- **مدیریت اسلایدها:** افزودن، حذف، کپی و جابجایی ترتیب اسلایدها با drag & drop
- **عنصر متن:** نوشتن متن فارسی/انگلیسی، انتخاب فونت، اندازه، رنگ، سبک (bold/italic/underline)، ترازبندی، فاصله خطوط، پس‌زمینه و حاشیه داخلی
- **عنصر تصویر:** آپلود تصویر، تنظیم اندازه و جایگذاری آزاد روی صفحه، انتخاب نحوه برش (cover/contain/fill)، گردی گوشه‌ها و شفافیت
- **عنصر شکل:** افزودن مستطیل و بیضی با رنگ، خط دور، گردی گوشه‌ها و شفافیت دلخواه
- **انتخاب جای و اندازه:** کلیک و درگ عنصر برای جابجایی، درگ گوشه‌ها برای تغییر اندازه، چرخش با اسلایدر
- **زوم:** بزرگ‌نمایی 25% تا 200% برای ویرایش دقیق
- **ذخیره پروژه:** ذخیره و بارگذاری پروژه به صورت JSON
- **خروجی PDF:** ساخت فایل PDF از همه اسلایدها با کیفیت بالا
- **خروجی پاورپوینت (PPTX):** ساخت فایل PowerPoint کاملاً قابل ویرایش با حفظ متن، تصاویر و اشکال
- **رابط RTL فارسی:** کامل راست‌چین با فونت Vazirmatn
- **ذخیره خودکار:** ذخیره خودکار پروژه در localStorage مرورگر

## تکنولوژی‌ها

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui
- **Drag & Resize:** react-rnd
- **PDF Export:** jsPDF + html2canvas (سمت کلاینت)
- **PPTX Export:** pptxgenjs (سمت سرور، API Route)
- **State Management:** Zustand با persist
- **آپلود فایل:** API Route با ذخیره روی دیسک

## اجرا روی سیستم محلی

```bash
# نصب پکیج‌ها
bun install   # یا npm install

# اجرای سرور توسعه
bun run dev   # یا npm run dev
```

سپس مرورگر را روی `http://localhost:3000` باز کنید.

## دیپلوی روی GitHub Pages / Vercel

### روش 1: Vercel (پیشنهادی)

1. یک ریپو روی GitHub بسازید و کد را push کنید.
2. به [vercel.com](https://vercel.com) بروید و پروژه را import کنید.
3. با تنظیمات پیش‌فرض Next.js دیپلوی کنید.

### روش 2: GitHub Pages

> توجه: GitHub Pages فقط فایل‌های استاتیک را پشتیبانی می‌کند. این پروژه از API Routes استفاده می‌کند (برای آپلود تصویر و خروجی PPTX) که نیاز به Node.js runtime دارد. برای GitHub Pages:
>
> - آپلود تصویر را به base64 در localStorage تبدیل کنید.
> - خروجی PPTX را به سمت کلاینت با `pptxgenjs` منتقل کنید.

برای build استاتیک:

```bash
NEXT_PUBLIC_STATIC_MODE=true bun run build
```

## ساختار پروژه

```
src/
├── app/
│   ├── api/
│   │   ├── upload/route.ts        # آپلود تصویر
│   │   └── export/pptx/route.ts   # ساخت PPTX
│   ├── layout.tsx
│   ├── page.tsx                    # صفحه اصلی
│   └── globals.css
├── components/
│   └── editor/
│       ├── Toolbar.tsx             # نوار ابزار بالا
│       ├── SlideCanvas.tsx         # صفحه ویرایش اسلاید
│       ├── SlideList.tsx           # لیست اسلایدها
│       └── PropertiesPanel.tsx     # پنل تنظیمات عنصر
├── store/
│   └── editorStore.ts              # Zustand store
└── lib/utils.ts
```

## مجوز

MIT
