/**
 * Arabic texts for the teacher Curriculum page (app/teacher/curriculum/page.tsx)
 * and its dialogs (components/teacher/curriculum/curriculum-dialogs.tsx).
 * The key is the English wording used in the page, the value is the Arabic.
 * {n}, {title}, {pct}, {units}, {lessons}, {problems} are filled in by t(...).
 */
export const curriculum: Record<string, string> = {
  // Header and workspace bar
  "My Lessons & Teaching Plan": "دروسي وخطة التدريس",
  "Prepare your units and lessons, add practice activities, and review what your students hand in.":
    "جهّز وحداتك ودروسك، وأضف أنشطة التدريب، وراجع ما يسلّمه طلابك.",
  "Total Students": "إجمالي الطلاب",
  "Active Enrolled": "المسجّلون حالياً",
  "To Grade": "بانتظار التصحيح",
  "My Teaching Workspace": "مساحة التدريس الخاصة بي",
  "Switch subject": "تبديل المادة",
  "Create Lesson": "إنشاء درس",
  "Review Submissions": "مراجعة التسليمات",
  "Arabic grammar coach — review AI parsing": "مدرّب النحو العربي — راجع إعراب الذكاء الاصطناعي",
  "Review how the AI parses your students' sentences (i'rab).": "راجع كيف يُعرب الذكاء الاصطناعي جمل طلابك.",
  "Could not load the curriculum.": "تعذّر تحميل المنهج.",
  "Could not load the assignments.": "تعذّر تحميل الواجبات.",

  // Units and lessons
  "{units} units • {lessons} lessons • {problems} activities": "{units} وحدات • {lessons} دروس • {problems} أنشطة",
  "Add unit": "إضافة وحدة",
  "Edit unit": "تعديل الوحدة",
  "No units yet for this subject and grade. Add your first unit to start the plan.":
    "لا توجد وحدات لهذه المادة والصف بعد. أضف وحدتك الأولى لتبدأ الخطة.",
  "Unit {n}: {title}": "الوحدة {n}: {title}",
  "{lessons} lessons • {problems} activities": "{lessons} دروس • {problems} أنشطة",
  "Lesson {n}: {title}": "الدرس {n}: {title}",
  "Lesson {n}": "الدرس {n}",
  "Challenge {n}: {title}": "التحدي {n}: {title}",
  "Add a lesson to this unit": "إضافة درس لهذه الوحدة",
  "Published": "منشور",
  "Draft": "مسودة",

  // Submissions
  "Recent Assignment Submissions": "أحدث تسليمات الواجبات",
  "All assignments": "كل الواجبات",
  "{pct}% submitted": "سلّم {pct}%",

  // Lesson details
  "Create a lesson to see its details, video and activities here.": "أنشئ درساً لترى تفاصيله والفيديو والأنشطة هنا.",
  "Edit Lesson": "تعديل الدرس",
  "Share with Students": "مشاركة مع الطلاب",
  "Publish to Students": "نشر للطلاب",
  "Lesson published: your students can see it now.": "تم نشر الدرس: يمكن لطلابك رؤيته الآن.",
  "Link to the students' lesson page copied.": "تم نسخ رابط صفحة الدرس للطلاب.",
  "Targeted Competencies:": "الكفاءات المستهدفة:",
  "{n} activities": "{n} أنشطة",
  "Lesson Video": "فيديو الدرس",
  "No video for this lesson yet": "لا يوجد فيديو لهذا الدرس بعد",
  "Lesson Activities & Resources": "أنشطة الدرس وموارده",
  "Add activity": "إضافة نشاط",
  "Edit activity": "تعديل النشاط",
  "No activities yet. Add a practice problem for this lesson.": "لا توجد أنشطة بعد. أضف مسألة تدريبية لهذا الدرس.",
  "{n} steps": "{n} خطوات",
  "{n} hints": "{n} تلميحات",

  // Dialogs
  "Write the title in Arabic, English or both.": "اكتب العنوان بالعربية أو الإنجليزية أو كليهما.",
  "Title (Arabic)": "العنوان (بالعربية)",
  "Title (English)": "العنوان (بالإنجليزية)",
  "Description (Arabic)": "الوصف (بالعربية)",
  "Description (English)": "الوصف (بالإنجليزية)",
  "Summary (Arabic)": "الملخص (بالعربية)",
  "Summary (English)": "الملخص (بالإنجليزية)",
  "Add a unit first, then create its lessons.": "أضف وحدة أولاً، ثم أنشئ دروسها.",
  "Unit": "الوحدة",
  "A practice problem the students solve in this lesson.": "مسألة تدريبية يحلّها الطلاب في هذا الدرس.",
  "Question (Arabic)": "السؤال (بالعربية)",
  "Question (English)": "السؤال (بالإنجليزية)",
  "Topic": "الموضوع",
  "Other accepted answers (one per line)": "إجابات أخرى مقبولة (واحدة في كل سطر)",
  "Hints (one per line)": "التلميحات (واحد في كل سطر)",
};

export default curriculum;
