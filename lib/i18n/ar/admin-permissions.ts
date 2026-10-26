/** Arabic for the Roles & Permissions matrix that controls the admin pages (26 Oct 2026). */
export const adminPermissions: Record<string, string> = {
  // Modules of the matrix
  "Platform overview and recent activity": "نظرة عامة على المنصة وآخر النشاطات",
  "Sign-ups, mentor and track change requests": "طلبات التسجيل وتغيير الموجّه والمسار",
  "Your own account and password": "حسابك وكلمة المرور الخاصة بك",
  "XP rules, badges, leaderboards": "قواعد نقاط الخبرة، الشارات، لوحات الصدارة",
  "Grammar topics and corrections": "موضوعات القواعد والتصحيحات",
  "System Admin always keeps full access, so no admin can be locked out.":
    "يحتفظ مدير النظام دائمًا بصلاحيات كاملة، حتى لا يُمنع أي مسؤول من الدخول.",
  "Recorded in the audit log": "مسجّلة في سجل التدقيق",

  // Reassign Role
  "Could not change the role.": "تعذّر تغيير الدور.",
  "{name} will only be able to do what this role allows.": "لن يتمكن {name} إلا من تنفيذ ما يسمح به هذا الدور.",

  // API errors
  "Your role does not allow this. Ask the main admin for access.": "دورك لا يسمح بهذا الإجراء. اطلب الصلاحية من المسؤول الرئيسي.",
  "The System Admin role always keeps full access.": "يحتفظ دور مدير النظام دائمًا بصلاحيات كاملة.",
  "You cannot change the permissions of your own role.": "لا يمكنك تغيير صلاحيات دورك أنت.",
  "You cannot change your own role.": "لا يمكنك تغيير دورك أنت.",
  "The main admin always keeps full access.": "يحتفظ المسؤول الرئيسي دائمًا بصلاحيات كاملة.",
  "Only the main admin can change an admin's role.": "المسؤول الرئيسي وحده يستطيع تغيير دور أي مسؤول.",
  "Move the users of this role to another role first.": "انقل مستخدمي هذا الدور إلى دور آخر أولًا.",
  "The System Admin role cannot be renamed.": "لا يمكن إعادة تسمية دور مدير النظام.",
};
