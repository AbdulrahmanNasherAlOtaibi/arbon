# تقرير الأخطاء — مشروع arbon / Error Report

**التاريخ / Date:** 2026-06-30
**الفرع / Branch:** `claude/error-collection-reblet-v8v8yl`
**البيئة / Env:** Node v22.22.2, pnpm 10.33.0, TypeScript 5.9.3

ملخص: تم فحص المشروع بالكامل (التثبيت + فحص الأنواع + البناء + توليد كود الـ API).
وُجدت **3 أخطاء حقيقية تمنع التشغيل**، بالإضافة إلى ملاحظات. التفاصيل أدناه.

Summary: Full project check (install + typecheck + build + API codegen).
Found **3 real blocking errors**, plus some notes. Details below.

---

## الأخطاء التي تمنع التشغيل / Blocking errors

### 1. خطأ يمنع التثبيت — إدخال `pg` مفقود من الـ catalog
**Severity: 🔴 Blocker (install fails — nothing can build)**

- **الموقع / Location:** `scripts/package.json:14` ↔ `pnpm-workspace.yaml` (قسم `catalog:`)
- **رسالة الخطأ / Error:**
  ```
  ERR_PNPM_CATALOG_ENTRY_NOT_FOUND_FOR_SPEC
  No catalog entry 'pg' was found for catalog 'default'.
  ```
- **السبب / Cause:** الملف `scripts/package.json` يطلب `"pg": "catalog:"` لكن لا يوجد إدخال
  باسم `pg` داخل قسم `catalog:` في `pnpm-workspace.yaml`. هذا يوقف `pnpm install` بالكامل،
  وبالتالي لا يستطيع أي شيء آخر أن يُبنى.
  (`scripts/package.json` references `"pg": "catalog:"` but `pnpm-workspace.yaml` has no `pg`
  entry in its `catalog:` section, which aborts the whole install.)
- **الإصلاح المقترح / Suggested fix:** أضف إلى قسم `catalog:` في `pnpm-workspace.yaml`:
  ```yaml
  pg: ^8.20.0
  ```
  (حزمة `lib/db` تستخدم `pg: ^8.20.0` بالفعل، فاجعلهما متطابقتين.)
  أو بدلاً من ذلك، غيّر `scripts/package.json` ليستخدم نسخة مباشرة `"pg": "^8.20.0"`.

---

### 2. خطأ TypeScript في `scripts/src/seed.ts` — أعمدة لا تطابق جدول قاعدة البيانات
**Severity: 🔴 Blocker (`pnpm run typecheck` fails → `pnpm run build` fails)**

- **الموقع / Location:** `scripts/src/seed.ts:185`
- **رسالة الخطأ / Error:**
  ```
  src/seed.ts(185,49): error TS2769: No overload matches this call.
    Type '{ dealId: number; requesterId: number; price: number; message: string; status: string; }[]'
    is missing the following properties from type
    '{ dealId...; fromUserId...; toUserId...; price...; ... }': dealId, fromUserId, toUserId, price
  ```
- **السبب / Cause:** القيم المُدخلة في `db.insert(transferRequestsTable).values([...])`
  لا تطابق تعريف الجدول `transfer_requests` في
  `lib/db/src/schema/transfer_requests.ts`:
  | الكود في seed.ts | الصحيح في schema |
  |---|---|
  | `requesterId` | العمود اسمه `fromUserId` (لا يوجد عمود `requesterId`) |
  | (مفقود) | `toUserId` مطلوب وغير موجود في البيانات |
  | `price: 140000` (رقم) | `price` معرّف كـ `text` (نص) — يجب أن يكون `"140000"` |

  (The seeded rows use `requesterId` (column is actually `fromUserId`), omit the required
  `toUserId`, and pass `price` as a number while the schema column is `text`.)
- **الكود الحالي / Current code (`scripts/src/seed.ts:185-189`):**
  ```ts
  await db.insert(transferRequestsTable).values([
    { dealId: listedDeals[0].id, requesterId: 1, price: 140000, message: "...", status: "pending" },
    { dealId: listedDeals[1].id, requesterId: 1, price: 375000, message: "...", status: "pending" },
    { dealId: listedDeals[2].id, requesterId: 1, price: 62000,  message: "...", status: "approved" },
  ]);
  ```
- **الإصلاح المقترح / Suggested fix:** استخدم أسماء وأنواع الأعمدة الصحيحة، مثال:
  ```ts
  { dealId: listedDeals[0].id, fromUserId: 1, toUserId: <sellerId>, price: "140000", message: "...", status: "pending" }
  ```
  (price نصّي، واستبدال `requesterId` بـ `fromUserId`، وإضافة `toUserId`.)

---

### 3. خطأ إعداد TypeScript في `scripts` — استيراد خارج `rootDir`
**Severity: 🔴 Blocker (8 أخطاء TS6059 ضمن نفس فشل الـ typecheck)**

- **الموقع / Location:** `scripts/src/seed.ts:3` + `scripts/tsconfig.json`
- **رسالة الخطأ / Error (مكررة 8 مرات لكل ملف schema):**
  ```
  src/seed.ts(3,25): error TS6059: File '.../lib/db/src/schema/index.ts' is not under
  'rootDir' '.../scripts/src'. 'rootDir' is expected to contain all source files.
  ../lib/db/src/schema/index.ts(1,15): error TS6059: File '.../users.ts' is not under 'rootDir' ...
  ... (users, deals, contracts, disputes, timeline, templates, transfer_requests, index)
  ```
- **السبب / Cause:** الملف `scripts/tsconfig.json` يضبط `"rootDir": "src"`، لكن `seed.ts`
  يستورد عبر مسار نسبي يخرج عن المجلد:
  ```ts
  import * as schema from "../../lib/db/src/schema";   // ← يصل مباشرة لداخل lib/db
  ```
  بينما الطريقة الصحيحة (المستخدمة في `api-server` والتي تنجح) هي الاستيراد عبر اسم الحزمة
  `@workspace/db` (وهي معرّفة أصلاً كـ dependency في `scripts/package.json`).
  (`scripts/tsconfig.json` sets `rootDir: src`, but `seed.ts` reaches into
  `../../lib/db/src/schema`. `api-server` instead imports `@workspace/db` and typechecks fine.
  `@workspace/db` is already a dependency of `scripts`.)
- **الإصلاح المقترح / Suggested fix:** غيّر الاستيراد في `seed.ts` إلى:
  ```ts
  import * as schema from "@workspace/db/schema";
  ```
  (الحزمة `@workspace/db` تصدّر `./schema` بالفعل عبر `lib/db/package.json` → `exports`.)
  هذا يحلّ أخطاء TS6059 الثمانية دفعة واحدة.

---

## ملاحظات (ليست أخطاء برمجية لكن مهمة) / Notes (not code bugs, but relevant)

### A. البناء يتطلب متغيرات بيئة `PORT` و `BASE_PATH`
- **الموقع / Location:** `artifacts/arboun/vite.config.ts:7-27`
- إذا لم يُضبط `PORT` أو `BASE_PATH` فإن البناء يفشل عمداً برمي خطأ:
  ```
  Error: PORT environment variable is required but was not provided.
  Error: BASE_PATH environment variable is required but was not provided.
  ```
- هذا تصميم مقصود وليس عيباً، لكن يجب التأكد أن بيئة Replit (workflow/deployment)
  تمرّر هذين المتغيرين، وإلا فشل بناء واجهة `arboun`.
  (Intentional, not a bug — but Replit's build/deploy must provide both env vars.)

### B. تحذير sourcemap بسيط أثناء بناء arboun (غير مؤثر)
- **الموقع / Location:** `artifacts/arboun/src/components/ui/label.tsx:2`
- ```
  src/components/ui/label.tsx (2:0): Error when using sourcemap for reporting an error:
  Can't resolve original location of error.
  ```
- تحذير معروف من rollup بسبب توجيه `"use client"` في أعلى الملف. البناء ينجح رغمه.
  (Harmless rollup warning from the `"use client"` directive; build still succeeds.)

---

## ما الذي نجح بدون أخطاء / What passed cleanly

- ✅ `pnpm install` (بعد إضافة إدخال `pg` للـ catalog — الخطأ رقم 1)
- ✅ typecheck لحزم: `lib/*`, `artifacts/api-server`, `artifacts/arboun`, `artifacts/mockup-sandbox`
- ✅ build لـ `api-server`, `arboun`, `mockup-sandbox` (مع ضبط `PORT`/`BASE_PATH`)
- ✅ توليد كود الـ API: `pnpm --filter @workspace/api-spec run codegen` (بدون أي drift في الملفات المولّدة)
- ❌ typecheck/build لحزمة `scripts` (بسبب الأخطاء 2 و 3)

---

## خطوات إعادة إنتاج الأخطاء / Reproduction steps

```bash
# 1) خطأ التثبيت رقم 1:
pnpm install
# → ERR_PNPM_CATALOG_ENTRY_NOT_FOUND_FOR_SPEC: No catalog entry 'pg'

# بعد إضافة "pg: ^8.20.0" إلى catalog في pnpm-workspace.yaml:
pnpm install        # ينجح

# 2 و 3) أخطاء فحص الأنواع:
pnpm run typecheck
# → scripts: TS2769 (seed.ts:185) + 8× TS6059 (rootDir)
```

---

### الخلاصة للإرسال إلى Replit / Bottom line for Replit
يكفي إصلاح ثلاثة أشياء لجعل `pnpm install` و `pnpm run typecheck` و `pnpm run build` تنجح:
1. أضف `pg: ^8.20.0` إلى `catalog:` في `pnpm-workspace.yaml`.
2. في `scripts/src/seed.ts` صحّح بيانات `transfer_requests` (`fromUserId`/`toUserId`، و`price` نصّي).
3. في `scripts/src/seed.ts` بدّل الاستيراد إلى `@workspace/db/schema` بدلاً من `../../lib/db/src/schema`.
