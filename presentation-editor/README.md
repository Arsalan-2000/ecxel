# ویرایشگر ارائه (Presentation Editor)

ویرایشگر آنلاین و راست‌چین برای طراحی صفحات ارائه با قابلیت خروجی PDF و PowerPoint.

ساخته‌شده با Next.js 16، React 19، TypeScript، Tailwind CSS و shadcn/ui.

## قابلیت‌ها

- **مدیریت چند اسلاید:** افزودن، کپی، حذف و انتخاب اسلاید از طریق نوار کناری
- **متن قابل ویرایش:** افزودن جعبه متن، ویرایش با دابل‌کلیک، تنظیم فونت، اندازه، رنگ، bold/italic/underline، ترازبندی و ارتفاع خط
- **تصویر قابل جابجایی:** آپلود تصویر، تعیین موقعیت با درگ، تعیین اندازه با handles گوشه، چرخش و شفافیت
- **پس‌زمینه:** رنگ ثابت یا گرادیان، قالب‌های آماده
- **خروجی PDF:** از طریق html2canvas-pro و jsPDF، تمام اسلایدها در یک فایل
- **خروجی PowerPoint (.pptx):** از طریق pptxgenjs، اسلایدها به‌صورت ویرایش‌پذیر
- **ذخیره خودکار:** کل پروژه در localStorage ذخیره می‌شود
- **راست‌چین (RTL):** رابط کاربری فارسی، فونت Vazirmatn
- **کیبورد:** Delete برای حذف المان انتخاب‌شده، Escape برای لغو انتخاب

## تکنولوژی‌های استفاده‌شده

| بخش | کتابخانه |
| --- | --- |
| فریم‌ورک | Next.js 16 (App Router) |
| زبان | TypeScript 5 |
| استایل | Tailwind CSS 4 + shadcn/ui |
| مدیریت state | Zustand + persist |
| درگ و تغییر اندازه | react-rnd |
| خروجی PDF | jsPDF + html2canvas-pro |
| خروجی PPTX | pptxgenjs |
| آیکون‌ها | lucide-react |
| فونت فارسی | Vazirmatn (next/font) |

## اجرای محلی

```bash
# نصب وابستگی‌ها (یکی از گزینه‌ها)
npm install
# یا
yarn install
# یا
bun install

# اجرای سرور توسعه
npm run dev
# یا
yarn dev
# یا
bun run dev
```

سپس مرورگر را باز کنید: http://localhost:3000

## راهنمای آپلود روی GitHub

### مرحله ۱: ایجاد repository روی GitHub

1. به [github.com](https://github.com) بروید
2. روی **New** کلیک کنید تا repository جدید بسازید
3. نامی مثل `presentation-editor` انتخاب کنید
4. گزینه **Public** (یا Private) را انتخاب کنید
5. روی **Create repository** کلیک کنید

### مرحله ۲: آپلود فایل‌ها

#### روش A: آپلود از طریق رابط GitHub (ساده‌ترین، بدون نیاز به Git)

1. فایل ZIP را که دانلود کرده‌اید extract کنید
2. در صفحه repository خود روی **uploading an existing file** کلیک کنید
3. تمام فایل‌ها و پوشه‌های داخل فولدر اصلی را drag کنید
4. در پایین صفحه یک commit message بنویسید (مثلاً `Initial commit`)
5. روی **Commit changes** کلیک کنید

#### روش B: آپلود با Git از ترمینال

```bash
# وارد پوشه extract شده شوید
cd presentation-editor

# اول git را initialize کنید
git init
git branch -M main

# همه فایل‌ها را اضافه کنید
git add .

# اولین commit
git commit -m "Initial commit: presentation editor"

# به repository خود متصل کنید (با جایگزین کردن USERNAME و REPO)
git remote add origin https://github.com/USERNAME/presentation-editor.git

# push کنید
git push -u origin main
```

## دیپلوی روی Vercel

### روش ۱: از طریق داشبورد Vercel (توصیه می‌شود)

1. به [vercel.com](https://vercel.com) بروید و با حساب GitHub خود وارد شوید
2. روی **Add New → Project** کلیک کنید
3. repository که در مرحله قبل ساختید را انتخاب کنید (اولین بار ممکن است نیاز باشد روی **Adjust GitHub App Permissions** کلیک کنید تا Vercel به repository شما دسترسی پیدا کند)
4. تنظیمات به‌صورت خودکار تشخیص داده می‌شوند:
   - Framework Preset: **Next.js**
   - Build Command: `next build` (یا `npm run build`)
   - Output Directory: `.next`
   - Install Command: `npm install` (یا خودکار)
5. روی **Deploy** کلیک کنید
6. بعد از چند دقیقه، URL سایت شما آماده خواهد بود (مثلاً `https://presentation-editor.vercel.app`)

### روش ۲: از طریق Vercel CLI

```bash
# نصب Vercel CLI
npm i -g vercel

# در پوشه پروژه
cd presentation-editor

# پیش‌نمایش (preview deployment)
vercel

# انتشار نهایی (production)
vercel --prod
```

## ساختار پروژه

```
presentation-editor/
├── public/                  # فایل‌های استاتیک (logo, robots.txt)
├── src/
│   ├── app/
│   │   ├── api/route.ts     # API endpoint نمونه
│   │   ├── globals.css      # استایل‌های سراسری
│   │   ├── layout.tsx       # layout اصلی + فونت Vazirmatn
│   │   └── page.tsx         # صفحه اصلی ویرایشگر
│   ├── components/
│   │   ├── editor/
│   │   │   ├── EditorCanvas.tsx       # ناحیه ویرایش با اندازه ۱۶:۹
│   │   │   ├── CanvasElementView.tsx  # المان قابل درگ/تغییر اندازه
│   │   │   ├── SlideSidebar.tsx       # نوار کناری اسلایدها + thumbnail
│   │   │   ├── PropertiesPanel.tsx    # پنل ویژگی‌ها (سبک متن، موقعیت، رنگ)
│   │   │   ├── Toolbar.tsx            # نوار ابزار بالا + دکمه خروجی
│   │   │   └── ImageUploadButton.tsx  # دکمه آپلود تصویر
│   │   └── ui/              # کامپوننت‌های shadcn/ui
│   ├── hooks/               # React hooks
│   ├── lib/
│   │   ├── types.ts         # تایپ‌های CanvasElement, Slide, TextStyle
│   │   ├── export.ts        # توابع exportToPdf و exportToPptx
│   │   └── utils.ts         # توابع کمکی
│   └── store/
│       └── editor-store.ts  # Zustand store با persist روی localStorage
├── .gitignore
├── components.json          # تنظیمات shadcn/ui
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts           # تنظیمات Next.js
├── package.json
├── postcss.config.mjs
├── README.md                # این فایل
├── tailwind.config.ts
├── tsconfig.json
└── vercel.json              # تنظیمات دیپلوی Vercel
```

## نکات فنی

- **موقعیت و اندازه به درصد ذخیره می‌شوند** تا خروجی PDF و PPTX با ابعاد مختلف سازگار باشند.
- **خروجی PDF** با رندر هر اسلاید در یک DOM مخفی و تبدیل به canvas با scale ۲ (وضوح بالا) انجام می‌شود.
- **خروجی PPTX** به‌صورت native (نه تصویری) ساخته می‌شود — یعنی متن‌ها قابل ویرایش در PowerPoint باقی می‌مانند.
- **ذخیره خودکار:** هر تغییری بلافاصله در `localStorage` با کلید `presentation-editor` ذخیره می‌شود.
- **حد حجم تصویر:** ۵ مگابایت (برای جلوگیری از پر شدن localStorage).

## رفع خطاهای رایج در دیپلوی

### خطای `Module not found: Can't resolve 'fs'`
این پروژه کاملاً client-side است. اگر خطایی مربوط به ماژول‌های Node.js دیدید، مطمئن شوید که `output: 'standalone'` در `next.config.ts` فعال نباشد.

### خطای build مربوط به TypeScript
فایل `next.config.ts` به‌گونه‌ای تنظیم شده که خطاهای TypeScript در build نادیده گرفته شوند. اگر می‌خواهید سخت‌گیرانه باشد، می‌توانید `typescript.ignoreBuildErrors` را `false` کنید.

### build موفق اما صفحه سفید
کنسول مرورگر را بررسی کنید. اگر خطای مربوط به hydration دیدید، احتمالاً به دلیل تفاوت state در server/client است. این پروژه با `useSyncExternalStore` این مشکل را حل کرده است.

## مجوز

MIT
