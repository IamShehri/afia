# AFIA — خطة التنفيذ الشاملة (كل الميزات المطلوبة)
**التاريخ:** 2026-07-05 · **تُنفذ عبر:** Cursor · **المرجع الاستراتيجي:** AFIA_MASTERPLAN.md

القائمة الكاملة المطلوبة: FHIR Gate، Teams + Chat، RStudio/R Shiny، Analytics Lab،
Talk to PDF، Diagram/Kumu، Visuals، Email share، Notion-like tracking، تعليقات Canva-style،
Web search، مشاركة LinkedIn/X — **+ من الذاكرة:** Vivaldi widgets/workspaces،
BioMistral/MedGemma/DoctoBERT.

**مبدأ الترتيب:** الاعتماديات التقنية تحكم، مو الحماس. كل موجة تُبنى على اللي قبلها،
وكل ميزة لها "v1 ضيق" يشتغل قبل التوسع.

---

## 🔴 Wave 0 — ديون أمس (قبل أي سطر كود جديد — ساعة واحدة)
| # | المهمة | لماذا لا تُتجاوز |
|---|---|---|
| 0.1 | حذف المفتاح المحروق `sb_secret_9v...` + إنشاء بديل | مفتاح بصلاحيات كاملة منشور بنص محادثة |
| 0.2 | `git add -A && git commit && git push` | يوم كامل من الشغل غير محفوظ عن بُعد |
| 0.3 | توثيق دومين بـ Resend | بدونه لا يمكن دعوة أي مستخدم — يقفل Teams والpilot معاً |
| 0.4 | اختبار العزل (Sign up بإيميل ثاني بعد 0.3) | آخر بوابة بـ Phase 1 |
| 0.5 | Default model → `DiseaseDetect-SuperClinical-184M` | إصلاح الـ 0 entities، سطر واحد |

---

## 🟢 Wave 1 — مكاسب سريعة + أساس التوليد (أسبوع 1-2)

### 1A. مشاركة LinkedIn / X (يوم واحد) — «هذا مهم للتسويق»
- **v1:** زر Share بكل صفحة تقرير/تحليل → share intent URLs
  (`linkedin.com/sharing/share-offsite/?url=` و `x.com/intent/post?text=&url=`)
- Open Graph meta tags للصفحة العامة (عنوان AFIA + وصف + صورة brand)
- ⚠️ قرار خصوصية إلزامي: **لا يُشارك محتوى سريري أبداً** — المشاركة تكون
  لصفحة landing أو لملخص إحصائي منزوع الهوية يولده المستخدم بوعي
  (زر "Generate shareable summary" يمر على De-identify أولاً)

### 1B. Web search icon (نصف يوم)
- أيقونة بشريط البحث العلوي: تفتح بحثاً خارجياً بالنص المحدد
  (PubMed + Google Scholar كخيارين — أنسب لجمهور بحثي من بحث ويب عام)

### 1C. Talk to PDF v1 (3-4 أيام) — الصندوق موجود بالواجهة أصلاً!
- **الموجود:** خانة "Talk to Document" بـ Document Studio + qaHistory بالـ metadata
- **v1 (extractive، بدون نموذج توليدي):** سؤال → embedding search على chunks
  المستند (نموذج sentence-transformers صغير بالـ bridge) → إرجاع المقاطع الأنسب
  مع highlight — سريع، محلي، صادق (لا يهلوس)
- **يمهد مباشرة لـ:** Wave 4 (BioMistral يحوّلها لإجابات توليدية)
- Cursor tasks: endpoint `/ask-document` بالـ bridge (chunking موجود — "Chunks: 1"
  ظهرت أمس)، ربط الواجهة، حفظ الـ Q&A بالـ metadata المشفر (المسار موجود)

### 1D. Visuals v1 (يومان)
- recharts موجودة بالمشروع: توزيع الكيانات (pie/bar)، confidence histogram،
  timeline للكيانات عبر صفحات المستند
- تدخل بصفحة Document Studio تحت Entity Distribution الحالية

---

## 🔵 Wave 2 — النواة السريرية المميزة (أسبوع 3-6)

### 2A. FHIR Gate v1 (أسبوعان) — أقوى ميزة استراتيجية بالقائمة كلها
"حوّل أي توثيق إلى FHIR" = جسر بين عالم المستندات الحرة وعالم الأنظمة الصحية.
لا أحد يقدمها لـ Allied Health اليوم.
- **v1 ضيق وصادق:** entities المستخرجة → FHIR R4 Bundle (JSON):
  - DISEASE/CONDITION → `Condition`
  - MEDICATION → `MedicationStatement`
  - أعمار/قياسات → `Observation`
  - المستند نفسه → `DocumentReference` (بالنص المشفر مرجعاً، لا يُضمّن)
- طبقة mapping بالـ bridge (Python): `entities_to_fhir(entities, doc_meta) -> Bundle`
- validation عبر مكتبة `fhir.resources` (pydantic، موجودة بـ PyPI)
- الواجهة: زر "Export FHIR" جنب Export CSV/JSON + معاينة شجرية للـ Bundle
- **صياغة صادقة بالواجهة:** "FHIR draft — يتطلب مراجعة سريرية قبل أي استخدام تشغيلي"
  (نحن أداة مساعدة، لسنا محرك ترميز معتمداً — خط المسؤولية من الـ Masterplan)
- v2 لاحقاً: LOINC/SNOMED coding hints، استيراد FHIR وعرضه

### 2B. Analytics Lab v1 (أسبوع)
- صفحة جديدة: تحليلات **عبر** المستندات (الموجود اليوم كله per-document)
- v1: أكثر الكيانات تكراراً عبر مكتبتك، مقارنة مستندين جنباً لجنب (تقاطع/فروق
  الكيانات)، اتجاهات زمنية بحسب تاريخ الرفع
- يعيد استخدام: listDocuments + فك تشفير metadata عبر get (موجود) + recharts
- ملاحظة أداء: الحسابات على العميل بعد فك التشفير — مقبول حتى ~مئات المستندات

### 2C. Diagram / Kumu-style v1 (أسبوع) — يكمل 2B طبيعياً
- d3 موجودة بالمشروع: **force-directed graph** للكيانات — العقد = كيانات،
  الحواف = تواجد مشترك بنفس المستند/الجملة، الحجم = التكرار
- لكل مستند + عرض تجميعي بـ Analytics Lab (هذا هو نمط Kumu عملياً)
- v2 لاحقاً: تحرير يدوي للخريطة، حفظها كـ artifact مستقل

---

## 🟣 Wave 3 — طبقة التعاون (أسبوع 7-12) — كتلة واحدة مترابطة

**قرار معماري حاكم:** التشفير الحالي server-side بمفتاح واحد — يعني المشاركة
مسألة **صلاحيات (RLS + Edge Function)** لا مسألة تبادل مفاتيح. هذا يبسط Teams
جذرياً: نضيف `workspaces` + `workspace_members` + عمود `workspace_id` بالـ documents،
والـ Edge Function تفحص العضوية بدل `user_id` فقط.

### 3A. Teams Workspaces (أسبوعان)
- جداول: `workspaces`, `workspace_members(role: owner/editor/viewer)`,
  `workspace_invites` — RLS بحسب العضوية
- دعوات عبر الإيميل (Resend — لهذا 0.3 حاكمة)
- مستند = شخصي أو تابع لworkspace؛ نقل المستندات بينهما
- **Vivaldi workspaces من الذاكرة تتحقق هنا** — سياقات عمل حقيقية

### 3B. Chat داخل الـ workspace (أسبوع)
- Supabase Realtime (مدمج): جدول `messages` بـ RLS على العضوية
- v1: قناة واحدة لكل workspace + إشارة لمستند (`#doc` mention يفتح رابطه)

### 3C. تعليقات Canva-style (أسبوع)
- جدول `comments(document_id, anchor, body, resolved)` — الـ anchor = مقطع نص
  محدد (offset بالنص المستخرج) أو كيان
- pins بجانب النص + خيط ردود + resolve — يعتمد على 3A (من يرى التعليق)

### 3D. Notion-like tracking (أسبوع)
- الموجود أصلاً: statuses (new/in_progress/reviewed) بـ My Research
- v1: عرض **Kanban board** بالسحب والإفلات (dnd-kit) + assignees من أعضاء
  الـ workspace + due dates — يتغذى من نفس بيانات المستندات، بدون نظام مهام منفصل

### 3E. Email share (3 أيام)
- Edge Function جديدة `share-email`: ترسل عبر Resend ملخصاً منزوع الهوية أو
  دعوة workspace — **لا ترسل محتوى سريرياً خاماً أبداً** (نفس قاعدة 1A)

### 3F. Vivaldi dashboard widgets (أسبوع) — من الذاكرة
- Studio Home → grid قابل للتخصيص (إظهار/إخفاء/ترتيب):
  widgets: آخر المستندات، نشاط الـ workspace، "PII محذوفة هذا الشهر"،
  "مستندات محللة"، اختصارات — نمط Privacy Statistics بمعنى سريري
- تفضيلات المستخدم بجدول `profiles` (عمود jsonb)

---

## 🟠 Wave 4 — أدوات القوة (شهر 4+)

### 4A. النماذج التوليدية: BioMistral / MedGemma / DoctoBERT (من الذاكرة)
- **خطوة تحقق أولى إلزامية** (درس كتالوج أمس!): التحقق من المعرّفات الفعلية
  على HuggingFace قبل أي كود — BioMistral-7B وMedGemma معروفان؛
  "DoctoBERT" يحتاج تأكيد الاسم الدقيق (قد يكون DrBERT أو مشتقاً آخر)
- 7B models محلياً = quantization (GGUF عبر llama.cpp/Ollama بالـ bridge)
  + فحص ذاكرة الجهاز، مع fallback واضح
- **الدمج:** طبقة توليدية فوق Talk to PDF v1 — الـ extractive يجيب المقاطع،
  النموذج يصيغ الإجابة منها (RAG محلي كامل) — البانر "coming soon" يتحقق
- DoctoBERT/BERT-family → تصنيف/فهم، يدخل بـ Analytics Lab

### 4B. RStudio + R Shiny (أسبوعان)
- كان مؤجلاً بالـ backlog القديم — الآن له سياق: مخرجات Analytics Lab
- v1 عملي: **"Export R package"** — zip فيه CSV الكيانات + سكربت R جاهز
  (تحليلات جاهزة للتشغيل) — قيمة فورية بدون تشغيل سيرفر
- v2: RStudio Server بـ Docker + iframe embed لمن يشغّله محلياً
- R Shiny: قالب dashboard جاهز يقرأ الـ export

### 4C. PDF Viewer حقيقي (من backlog أمس — أسبوع)
- pdf.js: عرض الصفحات الفعلية + **highlight الكيانات فوق الـ PDF نفسه**
  — يرفع Talk to PDF والتعليقات لمستوى ثاني (تعليق على مكان بالصفحة)

---

## خريطة الاعتماديات (لماذا هذا الترتيب بالذات)
```
0.3 Resend domain ──→ 3A Teams invites ──→ 3B Chat ──→ 3C Comments
                                        └→ 3D Kanban assignees
1C Talk-to-PDF v1 ──→ 4A Generative RAG
NER الحالي ──→ 2A FHIR ──→ (v2 coding)
            └→ 2B Analytics ──→ 2C Kumu graphs ──→ 4B R export
3A Workspaces ──→ 3F Vivaldi widgets (widget نشاط الفريق)
4C PDF Viewer ──→ يقوّي 1C و3C بأثر رجعي
```

## قواعد التنفيذ (ثابتة لكل ميزة)
1. **v1 ضيق يشتغل > v3 طموح على الورق** — كل بند فوق مكتوب بنسخته الأضيق عمداً
2. أي جدول جديد = RLS من أول سطر SQL + مراجعتي قبل التنفيذ بـ Supabase
3. أي محتوى يغادر النظام (share/email/social) يمر على De-identify — بلا استثناء
4. أي معرّف نموذج جديد = تحقق HF أولاً (درس الكتالوج)
5. ميزة وحدة قيد التنفيذ بكل لحظة — الموجة تحدد "التالي" جاهزاً دائماً
6. كل ميزة تنتهي بـ: اختبار يدوي موثق + commit + push بنفس اليوم

## الإيقاع الواقعي (مؤسس منفرد + MPH)
- Waves 1-2 = ~شهر ونصف → منتج يتفوق وظيفياً على أي منافس مباشر لـ Allied Health
- Wave 3 = التعاون يفتح باب الفرق والعيادات (وأول إيراد Teams pricing)
- Wave 4 = الخندق العميق (توليد محلي + R + FHIR v2)
- مراجعة الخطة نهاية كل موجة — الترتيب داخل الموجة قابل للتبديل، الاعتماديات لا
