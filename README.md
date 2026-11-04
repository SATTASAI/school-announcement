# School Announcement — Padeng PR Studio

## แม่แบบใหม่: ผู้ออกแบบกำหนดตำแหน่ง

แม่แบบใหม่ใช้ภาพพื้นหลังคู่กับไฟล์กำกับ `<ชื่อภาพ>.template.json` ในโฟลเดอร์แม่แบบเดียวกัน เช่น `school-news.png` และ `school-news.png.template.json` ระบบอ่านพิกัดจากไฟล์กำกับโดยตรง ไม่ตรวจจับกรอบจากภาพและไม่จัดตำแหน่งใหม่ แม่แบบเดิมใน `templates.json` ยังคงใช้ได้ หากภาพเดียวกันมีทั้งสองรายการ ไฟล์กำกับมีลำดับความสำคัญสูงกว่า

1. ออกแบบภาพพื้นหลังแนวตั้งขนาด 1240 × 1754 พิกเซล โดยเว้นพื้นที่สำหรับข้อความ ภาพกิจกรรม และรูป ผอ.
2. คัดลอก `scripts/template-manifest.example.json` ไปอยู่ข้างไฟล์ภาพ แล้วแก้ `file`, `name` และ `layout` ให้ตรงกับงานออกแบบ กำหนดกรอบภาพ 1–6 กรอบ เรียงลำดับตามภาพที่ต้องการ
3. เรียก `node --experimental-strip-types scripts/prepare-template.mjs /path/definition.json` เพื่อสร้างไฟล์กำกับ ระบบตรวจขอบเขต ฟอนต์ สี และฟิลด์ที่จำเป็นโดยไม่เปลี่ยนพิกัด และจะไม่เขียนทับไฟล์กำกับเดิม
4. อัปโหลดภาพและไฟล์กำกับที่สร้างแล้วไปยังโฟลเดอร์แม่แบบ Google Drive จากนั้นกด **โหลดแม่แบบใหม่** ในระบบ

ไฟล์กำกับรุ่น 1 ระบุ `canvas` เท่ากับ 1240 × 1754 เสมอ `layout` มี `headline`, `body`, `director`, `photos` โดยทุกกรอบใช้ `x`, `y`, `w`, `h` เป็นพิกเซลจากมุมซ้ายบน กรอบข้อความเพิ่ม `size`, `color` แบบ `#RRGGBB`, `align` (`left`, `center`, `right`) และ `font` (`Noto Sans Thai`, `Noto Serif Thai`) ตำแหน่งและขนาดกรอบถูกล็อก แต่ข้อความและการครอปภาพยังแก้ได้

หากไฟล์กำกับผิดรูปแบบ ชื่อภาพไม่ตรง มีไฟล์ซ้ำ หรือกรอบอยู่นอกหน้า ระบบจะไม่แสดงแม่แบบนั้นและจะแจ้งข้อผิดพลาดในหน้าแม่แบบ แก้ไฟล์กำกับแล้วโหลดใหม่ได้ โดยแม่แบบอื่นยังใช้งานได้ตามปกติ

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


## รูปผู้อำนวยการ ดาว และตัวแก้ไขแม่แบบ

- ตั้งค่ารูป ผอ. (JPG/PNG/WebP ไม่เกิน 10 MB) ระบบย่อภาพก่อนเก็บบนอุปกรณ์นี้ รูป ชื่อ และตำแหน่งแสดงในกรอบด้านบนของทุกแม่แบบ
- ติดดาว กรองรายการ และเรียงตามจำนวนส่งออก PNG/ZIP หรือกดพิมพ์ได้ สถิติแยกตามแม่แบบและอุปกรณ์ ไม่นับการเปิดดูหรือสุ่ม
- ปรับแต่งแม่แบบ: ลากย้ายข้อความ/กรอบภาพ/รูป ผอ., ย่อขยาย, เปลี่ยนขนาด สี ฟอนต์ การจัดย่อหน้า, ซูมและเลื่อนครอปภาพ ใช้ลูกศรขยับทีละ 1 พิกเซล หรือ Shift+ลูกศรทีละ 10 พิกเซล
- ใช้การแก้ไขกับข่าวนั้น หรือบันทึกเป็นแม่แบบส่วนตัวใหม่โดยเก็บต้นฉบับไว้ แม่แบบส่วนตัวเข้าร่วม Shuffle ด้วย
- เลือกภาพได้สูงสุด 6 ภาพ กริด 10 รูปแบบปรับจำนวนช่องตามภาพที่เลือกโดยไม่ตัดภาพทิ้งเมื่อเปลี่ยนแม่แบบ
- `lib/design-layout.ts` เป็น geometry และ validation กลาง ใช้ร่วมกันระหว่าง editor, thumbnail และ renderer
- metadata Drive เพิ่ม `photoCount` (3–6), `photos.pattern` (hero/grid/mosaic/portrait-pair/ribbon/stair/feature-right/columns/magazine/tiles), `director` (x,y,w,h) โดย config เดิมยังใช้งานได้
- การตั้งค่า ดาว อันดับ และแม่แบบส่วนตัวใช้ localStorage บนอุปกรณ์นี้ ไม่มีการส่งรูป ผอ. ขึ้นเซิร์ฟเวอร์


## Approved reference templates and catalogue filters

The built-in catalogue includes ten additional A4 portrait templates (`reference:01`–`reference:10`) in the approved blue/cyan, green/gold, blue/gold, pink/cream floral, Thai gold, mosaic, violet/silver, forest/Karen-inspired, burgundy/gold and editorial styles. The original built-ins, Drive templates, favorites and usage counts remain available. The new templates have fixed capacities of 6, 5, 3, 5, 6, 4, 6, 4, 3 and 5 photos respectively.

`lib/reference-templates.ts` is the canonical 1240 × 1754 coordinate specification. `lib/reference-art.ts` draws the decorative artwork separately from live text and uploaded activity/director images. Draft or personal layout overrides cannot move or resize the new fixed frames. The editor permits photo cropping and zoom within those frames. Switching or shuffling templates preserves selected photos first and fills remaining frames from the album; exports require the fixed photo count. Existing adaptive templates retain their layout editing behavior.

The template library supports combined name search, tone, photo count, style, new collection, favorites and personal-template filters, with result counts, empty results and reset. Photo-count filtering includes adaptive legacy templates for every count they support. Drive metadata without a tone/style uses conservative name inference. Optional issue/date text and a real HTTP(S) QR link can be entered for fixed templates; no example date, fake code or sample portrait is published. The initials badge is a neutral school placeholder rather than an official school seal.

Validation: `npm run typecheck`, `npm run build`, `npm test`. New tests cover all ten fixed layouts, non-overlap/bounds, attempted draft/personal-copy overrides, filter intersections and empty results, old templates, photo fitting, and shuffle inclusion.


## แม่แบบสร้างสรรค์สำหรับโรงเรียน ชุดที่ 2

เพิ่มแม่แบบล็อกตำแหน่งอีก 10 แบบ (`reference:11`–`reference:20`) ครอบคลุมลายทอป่าเด็ง ห้องเรียน เกียรติยศ ธรรมชาติ วิทยาศาสตร์ ศิลปะ ภาษา กิจกรรม พิธีการ และชุมชน แต่ละแบบกำหนดกรอบหัวข่าว เนื้อหา ผู้อำนวยการ และภาพกิจกรรม 3–6 ภาพแยกกันใน `lib/school-collection.ts` พร้อมลวดลายใน `lib/reference-art.ts` ใช้งานผ่านคลังแม่แบบและการสุ่มเดิมได้ทันที
