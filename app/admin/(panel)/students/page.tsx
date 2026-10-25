import { Suspense } from "react";
import AdminStudents from "@/components/admin/AdminStudents";

export default function StudentsPage() {
  // The table reads ?track= from the URL.
  return (
    <Suspense fallback={null}>
      <AdminStudents />
    </Suspense>
  );
}
