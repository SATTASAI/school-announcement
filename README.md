# School Announcement — Padeng PR Studio

เว็บจัดใบข่าวประชาสัมพันธ์โรงเรียนบ้านป่าเด็ง

1. กดสร้างข่าวและเลือกอัลบั้มจาก activity.banpadengschool.ac.th
2. ระบบเลือกภาพสูงสุด 4 ภาพ และแม่แบบให้ทันที
3. วางพาดหัวและเนื้อข่าวที่เตรียมจาก ChatGPT ภายนอก
4. ตรวจตัวอย่าง เปลี่ยนภาพหรือแม่แบบ แล้วดาวน์โหลด PNG / พิมพ์ PDF / ZIP ทั้งชุด

สร้างได้ครั้งละ 1–5 ข่าว ระบบไม่สร้างหรือปรับข้อความ ไม่มีการเรียก AI และไม่ต้องใช้ API Key การเลือกภาพใช้ความละเอียด แนวภาพ และการกระจายลำดับภาพ ไม่ประเมินใบหน้าหรือเนื้อหาภาพ

แม่แบบธรรมชาติใช้กับชื่ออัลบั้มด้านป่าไม้/จิตอาสา แม่แบบวารสารใช้กับภาพแนวตั้งหรือภาพจำนวนน้อย ข่าวทั่วไปใช้สีน้ำเงิน เปลี่ยนเองได้ทุกใบ ปุ่ม “สุ่มแม่แบบถัดไป” สุ่มวนแม่แบบในตัวและแม่แบบจาก Drive ทั้งหมดโดยไม่ซ้ำจนครบแต่ละรอบ คงภาพและข้อความเดิมไว้ และจำรอบแยกแต่ละข่าวในฉบับร่าง เมื่อคลังแม่แบบเปลี่ยนจะเริ่มรอบใหม่

ฉบับร่างบันทึกใน localStorage บนอุปกรณ์นี้ รุ่นใหม่ย้ายเฉพาะข่าวเดิมที่มีอัลบั้มและภาพ พร้อมเก็บข้อความที่ผู้ใช้มีไว้แล้ว ข้อมูลเดิมรุ่น v1 ไม่ถูกลบทิ้ง

## โครงสร้าง

- `src/` หน้าเว็บ React (Vite) → build เป็นไฟล์ static ใน `dist/`
- `lib/` จัดภาพ/แม่แบบ และวาดใบข่าวด้วย canvas (ทำงานในเบราว์เซอร์)
- `worker/` Cloudflare Worker: ตอบ `/api/pr/*` (proxy อ่านอย่างเดียวไปเว็บกิจกรรม) ที่เหลือส่งไฟล์จาก `dist/`

ไม่มีฐานข้อมูล · แม่แบบเพิ่มเติมอ่านจาก Google Drive

## แม่แบบจาก Google Drive

แม่แบบชุดแรก 5 แบบ (ต้นฉบับ `design/templates/build.py`) อยู่ในโฟลเดอร์แล้ว · ภาพแม่แบบเก็บในโฟลเดอร์ Drive "แม่แบบข่าว (PR Studio)" (`TEMPLATE_DRIVE_FOLDER_ID` ใน `wrangler.jsonc`) บัญชีเดียวกับระบบโรงเรียน
Worker อ่านผ่าน `/api/pr/templates` (จำไว้ 10 นาที, กด "โหลดแม่แบบใหม่" ในหน้าแม่แบบเพื่อดึงทันที) และส่งภาพผ่าน `/api/pr/template/:fileId` เฉพาะไฟล์ในโฟลเดอร์นี้

- ภาพพื้นหลัง PNG/JPG/WebP ขนาด A4 แนวตั้ง (แนะนำ 1240×1754)
- `templates.json` ในโฟลเดอร์เดียวกัน (ไม่บังคับ) กำหนดชื่อและตำแหน่ง หน่วยพิกเซลบนหน้า 1240×1754:

```json
{"templates":[{"file":"blue-header.png","name":"น้ำเงินหัวโรงเรียน",
  "headline":{"x":65,"y":300,"w":1110,"size":42,"color":"#143d73"},
  "photos":{"x":65,"y":400,"w":1110,"h":700,"layout":"hero"},
  "body":{"x":65,"y":1140,"w":1110,"h":500,"size":28,"color":"#27364a"}}]}
```

ภาพที่ไม่มีใน `templates.json` ใช้ตำแหน่งตามตัวอย่างด้านบน · `layout`: `hero` (ภาพใหญ่ 1 + เล็ก) หรือ `grid` (2 คอลัมน์)

Secrets ของ Worker (ค่าเดียวกับ Worker `banpadeng-school-db` / `bpdactivity`): `GOOGLE_DRIVE_CLIENT_ID`, `GOOGLE_DRIVE_CLIENT_SECRET`, `GOOGLE_DRIVE_REFRESH_TOKEN` — ถ้ายังไม่ตั้ง ระบบใช้แม่แบบในตัว 3 แบบตามเดิม

## Development

```sh
npm install
npm test
npm run typecheck
npm run build      # vite build → dist/
npx wrangler dev   # เปิดเว็บพร้อม Worker ที่ http://localhost:8787
```

## Deploy บน Cloudflare Workers

ตั้ง Cloudflare Workers Builds เชื่อมกับสาขา `main` (push/merge เข้า main แล้ว deploy อัตโนมัติ)

- Worker name: `school-announcement`
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Root directory: `/`
- Node.js: 22.13 ขึ้นไป
- Custom domain: `school-announcement.banpadengschool.ac.th` (ตั้งใน `wrangler.jsonc`, Cloudflare สร้าง DNS และ HTTPS ให้เอง)

