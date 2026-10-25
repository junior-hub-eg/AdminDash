// Arabic texts of the Students Directory (app/teacher/students/page.tsx).
// Same format as mentors.ts: the key is the English text used in the code, the value is the Arabic.
// Names, e-mails and student ids come from the API and are not translated here.
// Shared words (All, Student, Class, Status, Previous, Next, All Classes, On Track, ...) live in other files.
export const students: Record<string, string> = {
  // Header
  "Cohort Analytics & Oversight": "تحليلات المجموعات والإشراف",
  "Students Directory": "دليل الطلاب",
  "Manage student roster, track mastery velocity, and review individualized learning interventions.": "أدر قائمة الطلاب، وتابع سرعة إتقانهم، وراجع تدخلات التعلّم الفردية.",
  "Export Roster CSV": "تصدير القائمة (CSV)",
  "Enroll Student": "تسجيل طالب",
  "Could not load the students.": "تعذّر تحميل الطلاب.",
  "Could not load your classes.": "تعذّر تحميل فصولك.",

  // Stat cards
  "In 1 class": "في فصل واحد",
  "Across {n} classes": "موزعون على {n} فصول",
  "Class Mastery": "إتقان الفصل",
  "Average mastery": "متوسط الإتقان",
  "Struggling Alerts": "تنبيهات التعثر",
  "Immediate review": "تحتاج مراجعة فورية",
  "No one needs help now": "لا أحد يحتاج مساعدة الآن",
  "Avg Practice Time": "متوسط وقت التدريب",
  "Practice time per student": "وقت التدريب لكل طالب",

  // Toolbar
  "Struggling": "متعثر",
  "Search student by name or ID...": "ابحث عن طالب بالاسم أو الرقم...",
  "Default order": "الترتيب الافتراضي",
  "Mastery (highest first)": "الإتقان (الأعلى أولًا)",
  "Last active (most recent)": "آخر نشاط (الأحدث أولًا)",
  "Name (A-Z)": "الاسم (أ-ي)",

  // Table
  "Problems Solved": "المسائل المحلولة",
  "Time Spent": "الوقت المستغرق",
  "Last Active": "آخر نشاط",
  "Mastery %": "الإتقان %",
  "Grade {grade}{name}": "الصف {grade}{name}",
  "{h}h {m}m": "{h}س {m}د",
  "{m}m": "{m}د",
  "Never": "أبدًا",
  "Today, {time}": "اليوم، {time}",
  "{n} days ago": "منذ {n} أيام",
  "No students match your filters.": "لا يوجد طلاب يطابقون الفلاتر.",
  "No students in your classes yet.": "لا يوجد طلاب في فصولك بعد.",

  // Footer
  "of": "من",
  "Pagination": "التنقل بين الصفحات",

  // Enroll dialog
  "Students join a class with its join code from their account. Share the code of the class below.": "ينضم الطلاب إلى الفصل بكود الانضمام من حساباتهم. شارك كود الفصل أدناه.",
  "You have no classes yet.": "ليس لديك فصول بعد.",
  "Students join instantly": "ينضم الطلاب فورًا",
  "Requests need your approval": "الطلبات تحتاج موافقتك",
  "{n} pending": "{n} بانتظار الموافقة",
  "Copy": "نسخ",
  "Review pending join requests in My Classes": "راجع طلبات الانضمام المعلّقة في فصولي",
};
