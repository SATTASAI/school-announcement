# School Announcement — Padeng PR Studio

เว็บจัดใบข่าวประชาสัมพันธ์โรงเรียนบ้านป่าเด็ง

1. กดสร้างข่าวและเลือกอัลบั้มจาก activity.banpadengschool.ac.th
2. ระบบเลือกภาพสูงสุด 4 ภาพ และแม่แบบให้ทันที
3. วางพาดหัวและเนื้อข่าวที่เตรียมจาก ChatGPT ภายนอก
4. ตรวจตัวอย่าง เปลี่ยนภาพหรือแม่แบบ แล้วดาวน์โหลด PNG / พิมพ์ PDF / ZIP ทั้งชุด

สร้างได้ครั้งละ 1–5 ข่าว ระบบไม่สร้างหรือปรับข้อความ ไม่มีการเรียก AI และไม่ต้องใช้ API Key การเลือกภาพใช้ความละเอียด แนวภาพ และการกระจายลำดับภาพ ไม่ประเมินใบหน้าหรือเนื้อหาภาพ

แม่แบบธรรมชาติใช้กับชื่ออัลบั้มด้านป่าไม้/จิตอาสา แม่แบบวารสารใช้กับภาพแนวตั้งหรือภาพจำนวนน้อย ข่าวทั่วไปใช้สีน้ำเงิน เปลี่ยนเองได้ทุกใบ

ฉบับร่างบันทึกใน localStorage บนอุปกรณ์นี้ รุ่นใหม่ย้ายเฉพาะข่าวเดิมที่มีอัลบั้มและภาพ พร้อมเก็บข้อความที่ผู้ใช้มีไว้แล้ว ข้อมูลเดิมรุ่น v1 ไม่ถูกลบทิ้ง

## Development

```sh
npm ci
npm run dev
```

```sh
node node_modules/typescript/bin/tsc --noEmit
node --experimental-strip-types scripts/test-news-layout.mjs
npm run build
```

ใช้ React 19 / Vinext / Cloudflare Workers และ canvas สำหรับจัดหน้า A4 ภาพใช้ proxy แบบอ่านอย่างเดียว จำกัดไปยังเว็บกิจกรรมโรงเรียน ข้อความที่วางถูกส่งลง canvas ตามเดิม ไม่มีการเรียบเรียงใหม่ ข้อความยาวเกินพื้นที่จะรายงานให้ย่อก่อนส่งออก

## Deploy บน Cloudflare Workers

รีโปใช้ Cloudflare Workers Builds เชื่อมกับสาขา `main`

- Worker name: `school-announcement`
- Build command: `npm run build`
- Deploy command: `npm run deploy`
- Root directory: `/`
- Node.js: 22.13 ขึ้นไป (แนะนำ 22)
- Custom domain: `school-announcement.banpadengschool.ac.th`

Cloudflare ต้องมี zone `banpadengschool.ac.th` และสิทธิ์สร้าง Worker/Custom Domain ระบบออกใบรับรอง HTTPS ให้เมื่อโดเมนพร้อมใช้งาน เมื่อเชื่อมรีโปแล้ว push เข้า main จะอัปเดตเว็บอัตโนมัติ

ทดสอบแพ็กเกจก่อน deploy ได้ด้วย `npm run build` และ `npx wrangler deploy --config dist/server/wrangler.json --dry-run` ไม่ต้องใช้ OpenAI API Key และไม่ต้องตั้งค่าฐานข้อมูลหรือ storage

`vite.config.ts` และ `worker/cloudflare.ts` เป็นเส้นทาง build/deploy แบบ standalone โดยไม่เรียก Sites authentication หรือบริการ preview ของ ChatGPT ไฟล์ `.openai/hosting.json` เป็นข้อมูลอ้างอิงโฮสต์เดิมและไม่ถูกใช้โดย Cloudflare build นี้

ไม่ควร commit ไฟล์ .env, ข้อมูล runtime, node_modules หรือไฟล์ภาพต้นฉบับจากผู้ใช้
