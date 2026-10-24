import { Suspense } from "react";

import {
  DestinationsFallback,
  DestinationsView,
} from "@/components/destinations-view";
import { fetchBackendDestinations } from "@/lib/destinations";

async function DestinationsContent() {
  const backendDestinations = await fetchBackendDestinations();
  return <DestinationsView serverDestinations={backendDestinations} />;
}

export default function DestinationsPage() {
  return (
    <Suspense fallback={<DestinationsFallback />}>
      <main className="px-6 py-12 lg:px-10">
        <DestinationsContent />
      </main>
    </Suspense>
  );
}
