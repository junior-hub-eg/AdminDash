import AdminMessages from "@/components/admin/AdminMessages";

type Search = Promise<{ [key: string]: string | string[] | undefined }>;
const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

/** The one chat of every dashboard (27 Oct 2026): the admins' support inbox and broadcasts. */
export default async function Page({ searchParams }: { searchParams: Search }) {
  const { c, with: withUser } = await searchParams;
  return <AdminMessages conversationId={one(c)} withUserId={one(withUser)} />;
}
