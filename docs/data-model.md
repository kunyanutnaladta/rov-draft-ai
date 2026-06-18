# Data Model

ข้อมูลฮีโร่หลักอยู่ที่ `src/data/heroes.js` และถูกใช้โดย `src/utils/draftAnalyzer.js` เพื่อคำนวณคำแนะนำในการ pick/ban

## Hero Fields

| Field | Type | Description |
| --- | --- | --- |
| `id` | string | unique id ใช้เชื่อม counter/synergy และเช็กว่าถูกเลือกแล้วหรือยัง |
| `name` | string | ชื่อฮีโร่ที่แสดงใน UI |
| `image` | string | path รูปฮีโร่จาก `public` เช่น `/heroes/violet.webp` |
| `role` | string | role หลัก เช่น `Tank`, `Mage`, `Carry` |
| `lane` | string | lane หลักสำหรับแสดงผล |
| `lanes` | string[] | lane ที่ฮีโร่เล่นได้ ใช้คำนวณ composition |
| `damage` | string | `Physical` หรือ `Magic` |
| `tier` | string | tier สำหรับคะแนน meta เช่น `S`, `A`, `B`, `C` |
| `tags` | string[] | keyword ด้าน playstyle เช่น `engage`, `poke`, `dive` |
| `difficulty` | number | ระดับความยาก |
| `powerSpike` | string | ช่วงเวลาที่เด่น เช่น `Early`, `Mid`, `Late` |
| `cc` | number | คะแนน crowd control |
| `mobility` | number | คะแนน mobility |
| `waveClear` | number | คะแนน clear wave |
| `objectiveDamage` | number | คะแนนตี objective |
| `strengths` | string[] | จุดเด่นสำหรับอ่านและขยาย UI ในอนาคต |
| `counters` | string[] | id ฮีโร่ที่ตัวนี้แก้ทางได้ |
| `synergy` | string[] | id ฮีโร่ที่เล่นเข้าคู่กัน |

## Draft Flow

ลำดับ draft อยู่ใน `src/utils/draftFlow.js` ภายใต้ `draftSteps` แต่ละ step มีข้อมูล:

```js
{ type: 'ban', team: 'blue', index: 0, label: 'Blue Ban 1' }
```

- `type`: `ban` หรือ `pick`
- `team`: `blue` หรือ `red`
- `index`: ตำแหน่ง slot ในทีม
- `label`: ข้อความที่แสดงใน `Next Turn`

## Recommendation Logic

`analyzeDraft()` คืนค่า object ที่ UI ใช้แสดงคำแนะนำ ประกอบด้วย:

- `suggestions`: ฮีโร่ที่ถูกจัดอันดับคะแนนสูงสุด
- `categories.best`: ตัวเลือกแนะนำหลัก
- `categories.combo`: ตัวเลือกที่มี synergy กับทีม
- `categories.counter`: ตัวเลือกที่แก้ทางฝั่งตรงข้าม
- `balance`: สถานะจำนวน pick และ damage balance
- `warnings`: จุดที่ composition ยังขาด

คะแนน pick จะเน้นการเติม role/lane, balance damage, team stats, counter, synergy และ tier ส่วนคะแนน ban จะเน้น meta threat, ตัวที่ counter ทีมเรา, combo กับ enemy และ threat จาก dive/objective/control
