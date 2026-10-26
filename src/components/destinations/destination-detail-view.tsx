"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  CheckIcon,
  MapPinIcon,
  StarIcon,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import {
  SAMPLE_DESTINATIONS,
  toStoredDestination,
  type Destination,
} from "@/lib/destinations";
import { useDeletedSampleIds, useStoredPackages } from "@/hooks/use-stored-packages";
import { authClient } from "@/lib/auth-client";
import { createBookingAction } from "@/app/bookings/actions";
import { DeleteDestination } from "@/components/destinations/edit-destination";
import EditDestination from "@/components/destinations/edit-destination";

const FALLBACK_IMAGE = "/images/destinations/bali.jpg";
const DEFAULT_DEPARTURE_DATE = "2026-05-15";

/** Detail fallback copy/traits for packages without curated content. */
const DEFAULT_HIGHLIGHTS = [
  "Luxury hotel accommodation",
  "Guided tours to iconic landmarks",
  "Traditional local dining experience",
  "Leisure time with scenic views",
  "24/7 on-trip support",
];
const DEFAULT_PERKS = [
  "Free cancellation up to 7 days",
  "Travel insurance included",
  "24/7 customer support",
];

/** Deterministic pseudo-random reviews count derived from the id (170–389). */
function hashReviews(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return 170 + Math.abs(hash % 220);
}

type DestinationDetail = Destination & {
  overview: string;
  highlights: string[];
  perks: string[];
  reviews: number;
};

function composeDetail(destination: Destination): DestinationDetail {
  return {
    ...destination,
    overview:
      destination.description ||
      `Experience the best of ${destination.country} with ${destination.name.toLowerCase()}. Enjoy ${destination.duration.toLowerCase()} of thoughtfully curated moments and memories that last a lifetime.`,
    highlights: destination.highlights ?? DEFAULT_HIGHLIGHTS,
    perks: destination.perks ?? DEFAULT_PERKS,
    reviews: destination.reviews ?? hashReviews(destination.id),
  };
}

function isRemoteImage(src: string) {
  return /^https?:\/\//.test(src);
}

function DetailHeroImage({ src, alt }: { src: string; alt: string }) {
  const [currentSrc, setCurrentSrc] = React.useState(src);

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill
      unoptimized={isRemoteImage(currentSrc)}
      sizes="(max-width: 1024px) 100vw, 82vw"
      priority
      className="object-cover"
      onError={() => {
        setCurrentSrc((prev) => (prev === FALLBACK_IMAGE ? prev : FALLBACK_IMAGE));
      }}
    />
  );
}

function BookingSidebar({ detail }: { detail: DestinationDetail }) {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const [departureDate, setDepartureDate] = React.useState(
    DEFAULT_DEPARTURE_DATE,
  );
  const [isBooking, setIsBooking] = React.useState(false);

  const handleBook = async (): Promise<void> => {
    if (!departureDate) return;

    setIsBooking(true);
    const result = await createBookingAction({
      destinationId: detail.id,
      name: detail.name,
      country: detail.country,
      price: detail.price,
      duration: detail.duration,
      departureDate,
      imageUrl: detail.imageUrl || "",
    });

    if (!result.ok) {
      setIsBooking(false);
      toast.add({
        title: "Booking failed",
        description: result.error,
        type: "error",
      });
      return;
    }

    toast.add({
      title: "Booking confirmed",
      description: `${detail.name} on ${departureDate}.`,
      type: "success",
    });
    router.push("/bookings");
  };

  const dateInput = (
    <Input
      type="date"
      aria-label="Select departure date"
      value={departureDate}
      onChange={(event) => setDepartureDate(event.target.value)}
      className="h-11 w-full"
    />
  );

  if (isSessionPending || !session?.user) {
    return (
      <aside className="h-fit rounded-xl bg-card p-5 shadow-lg shadow-foreground/5 ring-1 ring-foreground/10 lg:sticky lg:top-6">
        <p className="text-xs text-muted-foreground">Starting from</p>
        <p className="mt-1 inline-block text-3xl font-semibold text-[#1ba8bc]">
          ${detail.price.toLocaleString("en-US")}
        </p>
        <p className="text-xs text-muted-foreground">per person</p>

        <div className="mt-4 border-t pt-4">
          {isSessionPending ? (
            <>
              {dateInput}
              <Button disabled className="mt-4 h-11 w-full">
                <Spinner />
                Loading…
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Create an account or log in to book this trip and see it in
                your bookings.
              </p>
              <div className="mt-4 flex gap-2">
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants(),
                    "h-11 flex-1 bg-[#1ba8bc] text-white hover:bg-[#179cb0]",
                  )}
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "h-11 flex-1",
                  )}
                >
                  Sign up
                </Link>
              </div>
            </>
          )}
        </div>

        <ul className="mt-5 space-y-2.5 rounded-lg bg-emerald-50/60 p-4">
          {detail.perks.map((perk) => (
            <li key={perk} className="flex items-center gap-2.5 text-sm">
              <CheckIcon
                aria-hidden
                className="size-4 shrink-0 text-emerald-700"
                strokeWidth={2.5}
              />
              {perk}
            </li>
          ))}
        </ul>
      </aside>
    );
  }

  return (
    <aside className="h-fit rounded-xl bg-card p-5 shadow-lg shadow-foreground/5 ring-1 ring-foreground/10 lg:sticky lg:top-6">
      <p className="text-xs text-muted-foreground">Starting from</p>
      <p className="mt-1 inline-block text-3xl font-semibold text-[#1ba8bc]">
        ${detail.price.toLocaleString("en-US")}
      </p>
      <p className="text-xs text-muted-foreground">per person</p>

      <div className="mt-4 border-t pt-4">
        {dateInput}

        <Button
          onClick={handleBook}
          disabled={isBooking || !departureDate}
          className="mt-4 h-11 w-full bg-[#1ba8bc] text-white hover:bg-[#179cb0] has-data-[icon=inline-end]:pr-2"
        >
          {isBooking ? <Spinner /> : <ArrowRightIcon data-icon="inline-end" />}
          {isBooking ? "Booking…" : "Book Now"}
        </Button>
      </div>

      <ul className="mt-5 space-y-2.5 rounded-lg bg-emerald-50/60 p-4">
        {detail.perks.map((perk) => (
          <li key={perk} className="flex items-center gap-2.5 text-sm">
            <CheckIcon
              aria-hidden
              className="size-4 shrink-0 text-emerald-700"
              strokeWidth={2.5}
            />
            {perk}
          </li>
        ))}
      </ul>
    </aside>
  );
}

export function DestinationDetailView({
  destinationId,
  serverDestination,
}: {
  destinationId: string;
  serverDestination: Destination | null;
}) {
  const storedPackages = useStoredPackages();
  const deletedSampleIds = useDeletedSampleIds();

  const storedPackage = storedPackages.find((pkg) => pkg.id === destinationId);
  const deletedSample = deletedSampleIds.includes(destinationId);

  // Locally saved packages (added or edited) win so saved changes show up
  // immediately; after that the backend result, then curated samples.
  // Tombstoned samples are deleted locally and resolve to "not found".
  const detail = React.useMemo(() => {
    const base =
      (storedPackage ? toStoredDestination(storedPackage) : null) ??
      (deletedSample
        ? null
        : (serverDestination ??
          SAMPLE_DESTINATIONS.find(
            (destination) => destination.id === destinationId,
          )));
    return base ? composeDetail(base) : null;
  }, [storedPackage, deletedSample, serverDestination, destinationId]);

  if (!detail) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col items-center py-24 text-center">
        <h1 className="font-display text-3xl tracking-tight lg:text-4xl">
          Destination not found
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          The package you are looking for is no longer available. Browse our
          other destinations instead.
        </p>
        <Link
          href="/destinations"
          className={cn(
            buttonVariants(),
            "mt-6 bg-[#1ba8bc] text-white hover:bg-[#179cb0]",
          )}
        >
          Back to Destinations
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* Top bar: back link + page actions */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/destinations"
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon aria-hidden className="size-4" />
          Back to Destinations
        </Link>

        <div className="flex items-center gap-3">
          <EditDestination
            destination={detail}
            departureDate={storedPackage?.departureDate ?? ""}
          />
          <DeleteDestination destination={detail} />
        </div>
      </div>

      {/* Hero image */}
      <div className="relative mt-4 aspect-8/3 w-full overflow-hidden rounded-lg bg-muted">
        <DetailHeroImage
          src={detail.imageUrl || FALLBACK_IMAGE}
          alt={detail.name}
        />
      </div>

      <div className="mt-8 border-t" />

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12">
        <article>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPinIcon aria-hidden className="size-4 shrink-0" />
            {detail.country}
          </p>

          <h1 className="font-display mt-1 text-4xl tracking-tight lg:text-5xl">
            {detail.name}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
            <span className="flex items-center gap-1.5 font-semibold">
              <StarIcon
                aria-hidden
                className="size-4 fill-emerald-600 text-emerald-600"
              />
              {detail.rating.toFixed(1)}
            </span>
            <span className="text-muted-foreground">
              ({detail.reviews} reviews)
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <CalendarDaysIcon aria-hidden className="size-4 shrink-0" />
              {detail.duration}
            </span>
          </div>

          <section aria-labelledby="overview-heading" className="mt-7">
            <h2
              id="overview-heading"
              className="font-display text-xl tracking-tight"
            >
              Overview
            </h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              {detail.overview}
            </p>
          </section>

          <section aria-labelledby="highlights-heading" className="mt-7">
            <h2
              id="highlights-heading"
              className="font-display text-xl tracking-tight"
            >
              Highlights
            </h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              {detail.overview}
            </p>
            <ul className="mt-4 grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
              {detail.highlights.map((highlight) => (
                <li key={highlight} className="flex items-center gap-2.5 text-sm">
                  <CheckIcon
                    aria-hidden
                    className="size-4 shrink-0 text-emerald-700"
                    strokeWidth={2.5}
                  />
                  {highlight}
                </li>
              ))}
            </ul>
          </section>
        </article>

        <BookingSidebar detail={detail} />
      </div>
    </div>
  );
}

/** Skeleton shell streamed while the server fetch resolves. */
export function DestinationDetailFallback() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="flex items-center justify-between">
        <div className="h-4 w-40 animate-pulse rounded bg-muted" />
        <div className="flex gap-3">
          <div className="h-9 w-20 animate-pulse rounded-lg bg-muted" />
          <div className="h-9 w-24 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
      <div className="aspect-8/3 mt-4 w-full animate-pulse rounded-lg bg-muted" />
      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12">
        <div>
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="mt-3 h-10 w-64 animate-pulse rounded bg-muted" />
          <div className="mt-4 h-4 w-52 animate-pulse rounded bg-muted" />
          <div className="mt-8 h-5 w-32 animate-pulse rounded bg-muted" />
          <div className="mt-3 space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="h-72 animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  );
}
