# AGENTS.md — School Announcement — Padeng PR Studio

สตูดิโอทำภาพข่าว/ประกาศประชาสัมพันธ์จากอัลบั้มกิจกรรม พร้อมคลังแม่แบบ (ในตัวและจาก Google Drive) และตัวแก้ไขการจัดวาง · https://school-announcement.banpadengschool.ac.th

## ข้อมูลระบบ

- React 19 + TypeScript + Vite (frontend ใน `src/`) · Worker TypeScript (`worker/index.ts`) เสิร์ฟ `dist/` แบบ SPA
- ไม่มี D1 · ดึงข้อมูลอัลบั้มจาก `https://activity.banpadengschool.ac.th` (`worker/pr-api.ts`)
- แม่แบบ Drive จากโฟลเดอร์ `TEMPLATE_DRIVE_FOLDER_ID` · Node 22.13+

## วิธีทำงานในรีโปนี้ (สำหรับ agent)

1. อ่านไฟล์นี้, `README.md` และเอกสารใน `docs/` (ถ้ามี) ก่อนแก้ทุกครั้ง
2. ทำเฉพาะขอบเขตที่ได้รับมอบหมาย ไม่ refactor, ไม่เปลี่ยนชื่อไฟล์/ตาราง/endpoint และไม่อัปเกรด dependency ถ้าไม่ได้สั่ง
3. ถ้างานกระทบข้อมูลจริง สิทธิ์ผู้ใช้ เงิน หรือระบบอื่น ให้หยุดถามก่อนลงมือ
4. แก้ให้น้อยที่สุดที่ทำให้งานสำเร็จ และเขียน/ปรับ test ที่ครอบคลุมพฤติกรรมที่เปลี่ยน
5. รันคำสั่งตรวจในหัวข้อ "คำสั่ง" ให้ผ่านทั้งหมดก่อน commit
6. ตอบผู้ใช้เป็นภาษาไทย กระชับ ข้อความ UI ทั้งหมดเป็นภาษาไทย

## คำสั่ง

```sh
npm install
npm test                 # test layout/แม่แบบ/manifest (node --experimental-strip-types)
npm run typecheck        # tsc
npm run build            # vite build → dist/
npx wrangler dev         # http://localhost:8787
```

## โครงสร้างไฟล์

```
src/                → App.tsx, LayoutEditor.tsx, TemplateLibrary.tsx, styles
lib/                → logic layout/render/แม่แบบ (news-layout, news-render, template-*, school-collection-*)
worker/             → index.ts, pr-api.ts (ดึงอัลบั้ม), templates.ts (Drive)
design/templates/, public/seed-templates/ → ไฟล์แม่แบบ
scripts/            → prepare-template.mjs + test-*.mjs
```

## กติกาเฉพาะของระบบ (business rules)

- แม่แบบกำหนดตำแหน่งด้วยไฟล์กำกับ (`layout.director`, `layout.directorName`, `layout.directorCrop` ฯลฯ) — ดู README ก่อนเพิ่มแม่แบบ
- ชื่อและตำแหน่ง ผอ. มาตรฐานมาจากการตั้งค่าโรงเรียน ค่าที่ผู้ใช้ปรับเก็บกับการจัดวางข่าว/แม่แบบส่วนตัว
- ข้อความภาษาไทยต้องไม่ล้นกรอบ (มี test text-fit) และใช้ฟอนต์ที่มีในโปรเจกต์
- ถ้ายังไม่ตั้ง secret Drive ระบบต้องใช้แม่แบบในตัว 3 แบบได้ตามเดิม
- แม่แบบที่อนุมัติแล้ว (reference templates/catalogue) ห้ามเปลี่ยนดีไซน์โดยไม่ได้สั่ง

## ข้อตกลงการเขียนโค้ด

- TypeScript strict ตาม `tsconfig.json` — `npm run typecheck` ต้องผ่าน
- ไม่เพิ่ม dependency ใหม่ถ้าไม่จำเป็น
- เวลาและวันที่อิงเวลาไทย `Asia/Bangkok` (UTC+7) ทุกจุด ทั้งการคำนวณวัน ตัดรอบ และ cron; แสดงปีเป็น พ.ศ. แต่เก็บเป็น ISO/ค.ศ.
- SQL ใช้ prepared statement + `.bind()` เท่านั้น ห้ามต่อสตริงจากค่าที่ผู้ใช้ส่งมา
- ตรวจสิทธิ์ฝั่งเซิร์ฟเวอร์ทุก endpoint (role/status/session ปัจจุบันจากฐาน) อย่าเชื่อค่าจากหน้าเว็บ
- งานที่เขียนหลายแถวต้องเป็น atomic (`db.batch()`) และกันกดซ้ำ (idempotency key) เมื่อเป็นรายการเงินหรือรายการสำคัญ
- การลบข้อมูลสำคัญใช้ soft delete/ยกเลิกพร้อมเหตุผล และบันทึก audit แทนการลบแถว
- หน้าเว็บต้องใช้ได้บนมือถือ (iPhone Safari/PWA) และจอกว้าง ใช้ฟอนต์และสไตล์เดิมของรีโป
- escape ข้อความก่อนใส่ลง HTML เสมอ (กัน XSS) และอย่าเพิ่ม CDN/สคริปต์ภายนอกใหม่ถ้าไม่จำเป็น

## ความปลอดภัยและ secrets

- secret `GOOGLE_DRIVE_CLIENT_ID/SECRET/REFRESH_TOKEN` (ค่าเดียวกับ banpadeng-school-db/bpdactivity)
- รูปภาพนักเรียนในข่าวมาจากอัลบั้มที่เผยแพร่ได้เท่านั้น
- ห้าม commit secret, token, รหัสผ่าน, `.env`, `.dev.vars`, ไฟล์สำรองฐานข้อมูล หรือข้อมูลนักเรียน/บุคลากรจริงลง Git
- secret ตั้งผ่าน Cloudflare dashboard หรือ `wrangler secret put` เท่านั้น (`keep_vars: true` ทำให้ค่าที่ตั้งใน dashboard ไม่ถูกทับ)
- ข้อมูลนักเรียนเป็นข้อมูลส่วนบุคคลของผู้เยาว์: ห้าม log ชื่อ เลขประจำตัว ที่อยู่ หรือข้อมูลผู้ปกครองลง console/observability
- ห้ามปิดหรือผ่อนการตรวจสิทธิ์ การจำกัดความถี่ล็อกอิน Turnstile หรือ passkey เพื่อให้ทดสอบง่าย

## ห้ามแตะ / ต้องระวังเป็นพิเศษ

- `worker/pr-api.ts` (ขึ้นกับรูปแบบ API ของ bpdactivity)
- ไฟล์แม่แบบใน `design/templates/` และ `public/seed-templates/`

## ระบบที่เชื่อมกัน

- bpdactivity: แหล่งอัลบั้มภาพกิจกรรม

## Deploy

- Cloudflare Workers Builds เชื่อม `main`: build `npm run build`, deploy `npx wrangler deploy` — merge = ขึ้นจริง

## เลขเวอร์ชันกลาง (แพทช์ข้ามรีโป)

รีโปนี้เชื่อมกับระบบบริหารโรงเรียน (ดึงข้อมูลจาก bpdactivity และใช้ Drive credential ชุดเดียวกับ system) จึงอยู่ในขอบเขตแพทช์กลาง:

- ทุกชุดการแก้ไขที่ merge/push เข้า `main` ต้องออกเลขแพทช์ใหม่ใน
  [`SATTASAI/banpadeng-school-db/CHANGELOG.md`](https://github.com/SATTASAI/banpadeng-school-db/blob/main/CHANGELOG.md) รวมงานเอกสาร
- อ่านเลขล่าสุดจาก CHANGELOG นั้นก่อนเสมอ ห้ามนับเลขแยกในรีโปนี้
- งานเล็ก/กลางเพิ่มเลขส่วนที่สาม งานใหญ่เพิ่มเลขส่วนที่สอง งานหลายรีโปในชุดเดียวใช้เลขเดียวและลิงก์ PR ทุกรีโป
- รายละเอียดกติกาอยู่ใน `README.md` ของ banpadeng-school-db หัวข้อ "เวอร์ชันและบันทึก Patch Update"

## Checklist ก่อนเปิด PR / merge

- [ ] `npm run typecheck` และ `npm run build` ผ่าน
- [ ] test และ syntax check ทั้งหมดผ่าน
- [ ] ไม่มี secret/ข้อมูลจริงใน diff (`git diff --cached` ตรวจก่อน commit)
- [ ] ไม่แก้ `database_id`, `routes`, `services` และชื่อ Worker ใน wrangler config โดยไม่ได้สั่ง
- [ ] schema เปลี่ยนแบบเพิ่มเท่านั้น (add table/column) และรันซ้ำได้ ไม่ทำให้ข้อมูลเดิมหรือระบบอื่นพัง
- [ ] อัปเดต `README.md`/`docs/` เมื่อพฤติกรรมหรือขั้นตอนติดตั้งเปลี่ยน และบันทึกการตัดสินใจถาวรของผู้ใช้ลงไฟล์นี้
- [ ] commit/PR อธิบายเป็นภาษาไทยว่าเปลี่ยนอะไร เพราะอะไร และทดสอบอย่างไร
