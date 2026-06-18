# Usage Guide

เอกสารนี้อธิบาย flow การใช้งาน ROV Draft Web สำหรับทดลอง ban/pick และดูคำแนะนำจากระบบ

## วิธีใช้งาน

1. เลือกฝั่งของเราในส่วน `My Side` เป็น `Blue` หรือ `Red`
2. ดูช่อง `Next Turn` เพื่อรู้ว่า turn ต่อไปเป็น ban หรือ pick ของทีมไหน
3. เลือกฮีโร่จาก `Hero Pool` หรือเลือกจากคำแนะนำใน `Pick Guide` / `Ban Guide`
4. ถ้าเป็น turn ของฝั่งตรงข้าม ให้เลือกฮีโร่จาก pool เพื่อบันทึก ban/pick ของ enemy
5. กด slot ที่เลือกไปแล้วเพื่อลบและย้อนกลับไปแก้ draft จากจุดนั้น
6. กด `Reset` เมื่อต้องการเริ่ม draft ใหม่

## ระบบแนะนำ

ระบบจะให้คะแนนฮีโร่จากหลายปัจจัยรวมกัน:

- Role และ lane ที่ทีมยังขาด
- Magic/Physical damage balance
- CC, mobility, wave clear และ objective damage
- Tier ของฮีโร่
- Synergy กับฮีโร่ฝั่งเรา
- Counter ต่อฮีโร่ฝั่งตรงข้าม
- Threat สำหรับ ban phase

## การเพิ่มฮีโร่

เพิ่มข้อมูลฮีโร่ใน `src/data/heroes.js` และเพิ่มรูปไว้ที่ `public/heroes` จากนั้นตั้งค่า `image` ให้เป็น path เช่น:

```js
{
  id: 'example',
  name: 'Example',
  image: '/heroes/example.webp',
  role: 'Mage',
  lane: 'Mid',
  lanes: ['Mid'],
  damage: 'Magic',
  tier: 'A',
  tags: ['burst', 'poke'],
  difficulty: 3,
  powerSpike: 'Mid',
  cc: 3,
  mobility: 2,
  waveClear: 4,
  objectiveDamage: 2,
  strengths: ['Burst damage'],
  counters: ['enemy-id'],
  synergy: ['ally-id'],
}
```

ถ้าเพิ่ม role หรือ lane ใหม่ ให้ปรับ `roles`, `lanes` ใน `src/data/heroes.js` และ ideal list ใน `src/utils/draftAnalyzer.js` ให้สอดคล้องกัน
