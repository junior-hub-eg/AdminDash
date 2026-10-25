import AuthLayout from "@/components/Auth/AuthLayout";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

/** The admin's own sign-in, separate from the students' and mentors' /login (23 Oct 2026). */
export default function AdminLoginPage() {
  return (
    <AuthLayout>
      <AdminLoginForm />
    </AuthLayout>
  );
}
