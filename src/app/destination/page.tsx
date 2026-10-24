import { redirect } from "next/navigation";

// The listing now lives at /destinations (also the URL the navbar uses).
export default function AllDestinationsPage() {
  redirect("/destinations");
}
