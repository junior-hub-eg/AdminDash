import AdminTrackDetail from "@/components/admin/AdminTrackDetail";

export default async function TrackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminTrackDetail id={id} />;
}