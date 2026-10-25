import { redirect } from "next/navigation";

/** The app is only the admin dashboard; proxy.ts sends signed-out visitors to the sign-in page first. */
export default function Home() {
  redirect("/admin/dashboard");
}
