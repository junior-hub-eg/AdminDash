import AdminMentorDetail from "@/components/admin/AdminMentorDetail";

export default async function MentorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminMentorDetail id={id} />;
}
