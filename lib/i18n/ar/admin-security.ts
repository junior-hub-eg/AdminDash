/** Arabic for the admin Security page, Activity Log and the Roles audit card (security and audit log, 26 Oct 2026). */
export const adminSecurity: Record<string, string> = {
  // KPI cards
  "Admin sessions that stay signed in": "جلسات المشرفين التي تبقى مسجّلة الدخول",
  "In the last 24 hours": "خلال آخر 24 ساعة",
  "Critical events in the last 7 days": "أحداث حرجة خلال آخر 7 أيام",

  // Audit trail
  "Admin actions matching these filters will appear here.": "ستظهر هنا إجراءات المشرفين المطابقة لهذه الفلاتر.",
  "Showing {count} of {total} events": "عرض {count} من {total} حدثًا",
  "Timestamp": "الوقت",
  "Severity": "الخطورة",
  "Time range": "الفترة الزمنية",
  "All time": "كل الأوقات",
  "Info": "معلومة",
  "Critical": "حرج",
  "Anonymous": "مجهول",
  "Created": "إنشاء",
  "Deleted": "حذف",
  "{verb} in {module}": "{verb} في {module}",
  "Failed: {text} ({status})": "فشل: {text} ({status})",
  "Admin signed in": "سجّل المشرف الدخول",
  "Admin sign-in failed ({status})": "فشل تسجيل دخول المشرف ({status})",
  "Sign-in": "تسجيل الدخول",
  "{browser} on {system}": "{browser} على {system}",
  "Unknown device": "جهاز غير معروف",
  "We couldn't load the audit log. Please try again.": "تعذّر تحميل سجل التدقيق. حاول مرة أخرى.",
  "We couldn't export the audit log. Please try again.": "تعذّر تصدير سجل التدقيق. حاول مرة أخرى.",
  "We couldn't load the security overview. Please try again.": "تعذّر تحميل ملخص الأمان. حاول مرة أخرى.",

  // Sessions
  "Admin sessions that stay signed in on a device. Revoke one to sign it out.":
    "جلسات المشرفين التي تبقى مسجّلة الدخول على جهاز. ألغِ أي جلسة لتسجيل خروجها.",
  "Admin sessions that stay signed in on a device.": "جلسات المشرفين التي تبقى مسجّلة الدخول على جهاز.",
  "No active admin sessions": "لا توجد جلسات مشرفين نشطة",
  "Sessions appear here when an admin signs in with \"Remember me\".": "تظهر الجلسات هنا عندما يسجّل المشرف الدخول مع خيار \"تذكرني\".",
  "This device": "هذا الجهاز",
  "Signed in {when}": "سجّل الدخول {when}",
  "Ends {date}": "تنتهي {date}",
  "Revoke": "إلغاء الجلسة",
  "We couldn't end this session. Please try again.": "تعذّر إنهاء هذه الجلسة. حاول مرة أخرى.",
  "We couldn't load the admin sessions. Please try again.": "تعذّر تحميل جلسات المشرفين. حاول مرة أخرى.",

  // Login history
  "Every sign-in attempt on the main and admin login pages.": "كل محاولات تسجيل الدخول في صفحة الدخول الرئيسية وصفحة دخول المشرفين.",
  "Filter by result": "تصفية حسب النتيجة",
  "All attempts": "كل المحاولات",
  "Successful": "ناجحة",
  "{count} attempts": "{count} محاولة",
  "No sign-in attempts yet": "لا توجد محاولات تسجيل دخول بعد",
  "Result": "النتيجة",
  "Unknown account": "حساب غير معروف",
  "Admin login": "دخول المشرفين",
  "Main login": "الدخول الرئيسي",
  "Wrong email or password": "البريد الإلكتروني أو كلمة المرور غير صحيحة",
  "Account locked": "الحساب مقفل",
  "Not an admin account": "ليس حساب مشرف",
  "Email not confirmed": "البريد الإلكتروني غير مؤكَّد",
  "Waiting for approval": "بانتظار الموافقة",
  "Sign-up rejected": "تم رفض التسجيل",
  "Missing email or password": "البريد الإلكتروني أو كلمة المرور ناقصة",
  "No profile for this account": "لا يوجد ملف لهذا الحساب",
  "We couldn't load the sign-in history. Please try again.": "تعذّر تحميل سجل تسجيل الدخول. حاول مرة أخرى.",

  // Policies and hardening
  "Account Lockout": "قفل الحساب",
  "Locks an account after repeated failed sign-ins.": "يقفل الحساب بعد تكرار محاولات الدخول الفاشلة.",
  "{count} days (Remember me)": "{count} أيام (تذكرني)",
  "{count}+ chars, letters, numbers, symbol": "{count}+ أحرف، حروف وأرقام ورمز",
  "{count} attempts → {minutes} min": "{count} محاولات ← {minutes} دقائق",

  // Change password
  "Last changed {when}": "آخر تغيير {when}",
  "Last changed: {when}": "آخر تغيير: {when}",
  "Password changed.": "تم تغيير كلمة المرور.",
  "At least {count} characters, with letters, numbers and a special character. Your other sessions will be signed out.":
    "{count} أحرف على الأقل، تتضمن حروفًا وأرقامًا ورمزًا خاصًا. سيتم تسجيل الخروج من جلساتك الأخرى.",
  "We couldn't change the password. Please try again.": "تعذّر تغيير كلمة المرور. حاول مرة أخرى.",

  // Roles audit card
  "Changes to roles and their privileges will be listed here.": "ستظهر هنا التغييرات على الأدوار وصلاحياتها.",
  "{count} role changes recorded": "{count} تغيير مسجَّل على الأدوار",
};
