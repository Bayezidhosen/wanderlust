import { Suspense } from "react";

import {
  DestinationDetailFallback,
  DestinationDetailView,
} from "@/components/destination-detail-view";
import {
  fetchBackendDestinations,
  getDestination,
} from "@/lib/destinations";

async function DetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Backend packages are the source of truth when reachable; otherwise the
  // mock lookup (currently curated samples) fills in as the placeholder.
  const backendDestinations = await fetchBackendDestinations();
  const serverDestination =
    backendDestinations?.find((destination) => destination.id === id) ??
    (await getDestination(id));

  return (
    <DestinationDetailView destinationId={id} serverDestination={serverDestination} />
  );
}

export default function DestinationDetailPage(
  props: PageProps<"/destinations/[id]">,
) {
  return (
    <main className="px-6 py-8 lg:px-10 lg:py-10">
      <Suspense fallback={<DestinationDetailFallback />}>
        <DetailContent params={props.params} />
      </Suspense>
    </main>
  );
}
