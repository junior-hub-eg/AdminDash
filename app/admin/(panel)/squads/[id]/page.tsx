import AdminSquadDetail from "@/components/admin/AdminSquadDetail";

export default async function SquadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminSquadDetail id={id} />;
}
