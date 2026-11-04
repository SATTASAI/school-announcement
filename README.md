# School Announcement — Padeng PR Studio

เว็บจัดใบข่าวประชาสัมพันธ์โรงเรียนบ้านป่าเด็ง

1. กดสร้างข่าวและเลือกอัลบั้มจาก activity.banpadengschool.ac.th
2. ระบบเลือกภาพสูงสุด 4 ภาพ และแม่แบบให้ทันที
3. วางพาดหัวและเนื้อข่าวที่เตรียมจาก ChatGPT ภายนอก
4. ตรวจตัวอย่าง เปลี่ยนภาพหรือแม่แบบ แล้วดาวน์โหลด PNG / พิมพ์ PDF / ZIP ทั้งชุด

สร้างได้ครั้งละ 1–5 ข่าว ระบบไม่สร้างหรือปรับข้อความ ไม่มีการเรียก AI และไม่ต้องใช้ API Key การเลือกภาพใช้ความละเอียด แนวภาพ และการกระจายลำดับภาพ ไม่ประเมินใบหน้าหรือเนื้อหาภาพ

แม่แบบธรรมชาติใช้กับชื่ออัลบั้มด้านป่าไม้/จิตอาสา แม่แบบวารสารใช้กับภาพแนวตั้งหรือภาพจำนวนน้อย ข่าวทั่วไปใช้สีน้ำเงิน เปลี่ยนเองได้ทุกใบ

ฉบับร่างบันทึกใน localStorage บนอุปกรณ์นี้ รุ่นใหม่ย้ายเฉพาะข่าวเดิมที่มีอัลบั้มและภาพ พร้อมเก็บข้อความที่ผู้ใช้มีไว้แล้ว ข้อมูลเดิมรุ่น v1 ไม่ถูกลบทิ้ง

## โครงสร้าง

- `src/` หน้าเว็บ React (Vite) → build เป็นไฟล์ static ใน `dist/`
- `lib/` จัดภาพ/แม่แบบ และวาดใบข่าวด้วย canvas (ทำงานในเบราว์เซอร์)
- `worker/` Cloudflare Worker: ตอบ `/api/pr/*` (proxy อ่านอย่างเดียวไปเว็บกิจกรรม) ที่เหลือส่งไฟล์จาก `dist/`

ไม่มีฐานข้อมูล storage หรือ API Key

## Development

```sh
npm install
npm test
npm run build      # tsc + vite build → dist/
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
