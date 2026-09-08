# Farmart — Online Grocery Store

## Business Goals
- Increase online sales
- Drive repeat purchases via membership
- Reduce in-store workload

---

## Phase 0: Research & Context Gathering

### Requirement Research
- [ ] Review business requirement doc และสรุป scope ที่ต้องส่งมอบ (web self-service grocery shopping)
- [ ] Identify user personas: Guest shopper, Registered member, (Admin สำหรับจัดการสินค้า/โปรโมชัน)
- [ ] List product categories ที่ต้องรองรับ: ผัก, ผลไม้, เนื้อสัตว์, นมและผลิตภัณฑ์, เครื่องดื่ม, ของใช้
- [ ] Define success metrics: conversion rate, repeat purchase rate (member), avg order value, cart abandonment rate

### Technical Context Research
- [ ] Scan existing codebase/repo structure (ถ้ามีของเดิม) หา convention, stack, folder layout
- [ ] ตรวจสอบว่ามี design system / component library อยู่แล้วหรือไม่
- [ ] ตัดสินใจ scope: responsive web only vs. รวม native mobile app
- [ ] กำหนด data source: mock data ก่อน หรือเชื่อม backend/API จริงตั้งแต่ต้น

---

## Phase 1: Product Discovery & Browsing

### Category Navigation
- [ ] Define product categories: ผัก, ผลไม้, เนื้อสัตว์, นมและผลิตภัณฑ์, เครื่องดื่ม, ของใช้
- [ ] Build category sidebar/bar on homepage
- [ ] Category filter + breadcrumb on listing page
- [ ] Implement search with keyword + category filter

### Homepage Layout (ดึงดูดลูกค้า)
- [ ] Hero/banner section แสดงโปรโมชันเด่น (flash sale / ลดราคาแรง)
- [ ] Category quick-access grid
- [ ] "Best Seller" section
- [ ] "Top Saver" section (สินค้าที่ลดราคาสูงสุด/คุ้มสุด)
- [ ] Membership signup banner ("สมัครสมาชิกวันนี้ รับส่วนลด 15%")
- [ ] Responsive layout (mobile-first)

### Product Listing Page
- [ ] Product grid/list พร้อม filter (category, price range, มีส่วนลด, rating)
- [ ] Sort options (ราคา, ความนิยม, ส่วนลดมากสุด)
- [ ] Pagination หรือ infinite scroll
- [ ] Empty state (ไม่พบสินค้าที่ค้นหา)

---

## Phase 2: Product Information & Purchase Decision

### Product Card
- [ ] แสดงรูปสินค้า, ชื่อ, ราคาเดิม/ราคาลด, % ส่วนลด
- [ ] แสดง rating (ดาว) + จำนวนรีวิว
- [ ] ปุ่ม "หยิบใส่ตะกร้า" พร้อม instant feedback (toast/animation)
- [ ] Disable/แสดงสถานะสินค้าหมดสต็อก

### Product Detail Page
- [ ] รูปภาพขนาดใหญ่ + gallery (ถ้ามีหลายรูป)
- [ ] รายละเอียดสินค้า (คำอธิบาย, หน่วยนับ, ปริมาณ)
- [ ] ราคา, ส่วนลด, rating, รีวิวลูกค้า
- [ ] Quantity selector + ปุ่ม "หยิบใส่ตะกร้า"
- [ ] สินค้าที่เกี่ยวข้อง/แนะนำ (optional upsell)

---

## Phase 3: Sales-Boosting Zones

### Best Seller / Top Saver Logic
- [ ] Backend logic/flag สำหรับจัดอันดับ best seller (จากยอดขาย)
- [ ] Backend logic/flag สำหรับ top saver (จาก % ส่วนลด)
- [ ] Section แสดงผลบนหน้าแรกและ/หรือหน้า listing

### Membership & New-Member Discount
- [ ] ฟอร์มสมัครสมาชิก (signup)
- [ ] Login/logout สำหรับสมาชิก
- [ ] Auto-apply ส่วนลด 15% ให้สมาชิกใหม่ครั้งแรก
- [ ] หน้า/section แสดงสิทธิประโยชน์สมาชิก เพื่อกระตุ้นการสมัคร

---

## Phase 4: Cart Management

### Cart Functionality
- [ ] เพิ่มสินค้าเข้าตะกร้าจาก product card / product detail
- [ ] แก้ไขจำนวนสินค้าในตะกร้า (increment/decrement)
- [ ] ลบสินค้าออกจากตะกร้า
- [ ] คำนวณยอดรวมอัตโนมัติ (subtotal, ส่วนลด, total)
- [ ] แสดงส่วนลดที่ใช้ (เช่น ส่วนลดสมาชิกใหม่)

### Cart Persistence & UI
- [ ] Mini-cart dropdown (quick view)
- [ ] หน้า cart แบบเต็ม
- [ ] Persist cart: guest ใช้ session/local storage, member ผูกกับ account
- [ ] ปุ่ม/ทางไปหน้า checkout (stub ไว้ถ้ายังไม่ทำ checkout เต็มรูปแบบ)

---

## Phase 5: QA & Testing

- [ ] Test flow: ค้นหา → เลือกหมวดหมู่ → ดูสินค้า → หยิบใส่ตะกร้า
- [ ] Test flow: จัดการตะกร้า (เพิ่ม/ลบ/แก้จำนวน/ดูยอดรวม)
- [ ] Test flow: สมัครสมาชิกใหม่ → ได้รับส่วนลด 15% อัตโนมัติในตะกร้า
- [ ] Test responsive (mobile/tablet/desktop)
- [ ] Test edge cases: สินค้าหมดสต็อก, ตะกร้าว่าง, ส่วนลดซ้อนกัน

---

## Phase 6: Launch Readiness

- [ ] ตรวจสอบ performance หน้าแรก (โหลดเร็ว มีผลต่อ conversion)
- [ ] SEO basics (title/meta สำหรับหน้าสินค้า/หมวดหมู่)
- [ ] Analytics tracking (page view, add-to-cart, signup conversion) เพื่อวัด KPI ตาม Phase 0
- [ ] Soft launch / UAT กับกลุ่มลูกค้าเล็กๆ ก่อนเปิดเต็มรูปแบบ
