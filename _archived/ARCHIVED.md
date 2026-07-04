# لماذا هذا الأرشيف؟

تاريخ القرار: 2026-07-04

هذي الأجزاء انبنت كـ monorepo skeleton طموح بتاريخ 2026-06-29
(Rust crates, Tauri desktop, Go operations service, عقود بـ4 لغات)
لكن ما تطورت أبداً بعدها - صفر commits فعلية، ولا حتى Rust toolchain
مثبت على جهاز التطوير.

المسار النشط الفعلي والوحيد حالياً:
- afia-ui/  (React + Vite + Tailwind)
- lib/      (TypeScript clinical kernel)
- services/openmed_bridge.py (FastAPI bridge)

هذا الأرشيف يبقى كمرجع معماري مستقبلي إذا احتجنا نرجع
لبنية Rust/Tauri لاحقاً (مثلاً بعد PMF)، بس ما نبني عليه الحين.
