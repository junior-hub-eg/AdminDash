import Image from "next/image";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { landingFont } from "@/components/Landing/font";

/** The admin's own sign-in, separate from the students' and mentors' /login (Admin Login design). */
export default function AdminLoginPage() {
  return (
    <main
      className={`${landingFont.variable} relative isolate grid min-h-svh place-items-center overflow-hidden px-4 py-10 font-[family-name:var(--font-poppins)]`}
    >
      <Image src="/images/Intern/bg-park.png" alt="" fill priority sizes="100vw" className="-z-20 object-cover" />
      {/* Soft white wash, stronger towards the bottom like the design */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-white/10 via-white/30 to-white/70" />
      <AdminLoginForm />
    </main>
  );
}
