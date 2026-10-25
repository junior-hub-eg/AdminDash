import AdminStudentDetail from "@/components/admin/AdminStudentDetail";

export default async function StudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminStudentDetail id={id} />;
}
