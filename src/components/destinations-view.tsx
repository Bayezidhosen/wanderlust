"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRightIcon,
  CalendarDaysIcon,
  MapPinIcon,
  StarIcon,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  SAMPLE_DESTINATIONS,
  toStoredDestination,
  type Destination,
} from "@/lib/destinations";
import { useStoredPackages } from "@/hooks/use-stored-packages";

const FALLBACK_IMAGE = "/images/destinations/bali.jpg";

const CATEGORIES = [
  { value: "beach", label: "Beach" },
  { value: "mountains", label: "Mountains" },
  { value: "adventure", label: "Adventure" },
  { value: "city", label: "City Tours" },
  { value: "cultural", label: "Cultural" },
  { value: "wildlife", label: "Wildlife" },
  { value: "cruise", label: "Cruise" },
] as const;

export type { Destination } from "@/lib/destinations";

function isRemoteImage(src: string) {
  return /^https?:\/\//.test(src);
}

function DestinationImage({
  src,
  alt,
  sizes,
}: {
  src: string;
  alt: string;
  sizes: string;
}) {
  // Cards are keyed by destination id, so per-instance state is safe.
  const [currentSrc, setCurrentSrc] = React.useState(src);

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill
      unoptimized={isRemoteImage(currentSrc)}
      sizes={sizes}
      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
      onError={() => {
        setCurrentSrc((prev) => (prev === FALLBACK_IMAGE ? prev : FALLBACK_IMAGE));
      }}
    />
  );
}

function DestinationCard({ destination }: { destination: Destination }) {
  return (
    <article className="group flex flex-col">
      <div className="relative aspect-16/10 w-full overflow-hidden rounded-lg bg-muted">
        <DestinationImage
          src={destination.imageUrl || FALLBACK_IMAGE}
          alt={destination.name}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-md bg-white px-2 py-1 text-sm font-medium shadow-sm">
          {destination.rating.toFixed(1)}
          <StarIcon
            aria-hidden
            className="size-3.5 fill-current text-foreground"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 pt-3">
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPinIcon aria-hidden className="size-4 shrink-0" />
          {destination.country}
        </p>

        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-lg font-semibold tracking-tight">
            {destination.name}
          </h3>
          <p className="shrink-0 text-base font-semibold">
            ${destination.price.toLocaleString("en-US")}
            <span className="text-xs font-normal text-muted-foreground">
              /Person
            </span>
          </p>
        </div>

        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <CalendarDaysIcon aria-hidden className="size-4 shrink-0" />
          {destination.duration}
        </p>

        <Link
          href={`/destinations/${destination.id}`}
          className="mt-1 flex w-fit items-center gap-1 text-xs font-semibold tracking-[0.08em] text-[#1ba8bc] uppercase underline decoration-1 underline-offset-4 transition-colors hover:text-[#179cb0]"
        >
          Book Now
          <ArrowUpRightIcon aria-hidden className="size-3.5" />
        </Link>
      </div>
    </article>
  );
}

function FilterSelect({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<{ value: string; label: string }>;
}) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next ?? "all")}>
      <SelectTrigger
        id={id}
        className="h-11 w-full justify-between rounded-lg bg-white px-4"
      >
        <SelectValue
          placeholder={label}
          className="text-xs tracking-[0.08em] uppercase"
        />
      </SelectTrigger>
      <SelectContent align="start">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

const PRICE_RANGES = [
  { value: "all", label: "Any Price", min: 0, max: Number.MAX_SAFE_INTEGER },
  { value: "under-500", label: "Under $500", min: 0, max: 500 },
  { value: "500-1000", label: "$500 – $1,000", min: 500, max: 1000 },
  { value: "1000-2000", label: "$1,000 – $2,000", min: 1000, max: 2000 },
  { value: "over-2000", label: "Over $2,000", min: 2000, max: Number.MAX_SAFE_INTEGER },
];

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name: A to Z" },
] as const;

export function DestinationsView({
  serverDestinations,
}: {
  serverDestinations: Destination[] | null;
}) {
  const storedPackages = useStoredPackages();
  const [category, setCategory] = React.useState("all");
  const [priceRange, setPriceRange] = React.useState("all");
  const [sortBy, setSortBy] = React.useState("featured");

  // Backend packages win; otherwise show localStorage additions over samples.
  const destinations = React.useMemo(() => {
    if (serverDestinations && serverDestinations.length > 0) {
      return serverDestinations;
    }
    const userOwned = storedPackages.map(toStoredDestination);
    return userOwned.length > 0
      ? [...userOwned, ...SAMPLE_DESTINATIONS]
      : SAMPLE_DESTINATIONS;
  }, [serverDestinations, storedPackages]);

  const activePriceRange =
    PRICE_RANGES.find((range) => range.value === priceRange) ?? PRICE_RANGES[0];

  const results = destinations
    .filter(
      (destination) =>
        (category === "all" || destination.category === category) &&
        (activePriceRange.value === "all" ||
          (destination.price >= activePriceRange.min &&
            destination.price <= activePriceRange.max)),
    )
    .toSorted((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0; // "featured" keeps insertion order (newly added first)
    });

  return (
    <div className="mx-auto w-full max-w-6xl">
      <h1 className="font-display text-4xl tracking-tight lg:text-5xl">
        Explore All Destinations
      </h1>
      <p className="mt-2 text-sm text-muted-foreground lg:text-base">
        Find your perfect travel experience from our curated collection
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <FilterSelect
          id="filter-category"
          label="Category"
          value={category}
          onChange={setCategory}
          options={[{ value: "all", label: "All Categories" }, ...CATEGORIES]}
        />
        <FilterSelect
          id="filter-price"
          label="Price Range"
          value={priceRange}
          onChange={setPriceRange}
          options={PRICE_RANGES}
        />
        <FilterSelect
          id="filter-sort"
          label="Sort By"
          value={sortBy}
          onChange={setSortBy}
          options={SORT_OPTIONS}
        />
      </div>

      <p
        aria-live="polite"
        className={cn(
          "mt-5 text-sm text-muted-foreground",
          results.length === 0 && "text-foreground",
        )}
      >
        Showing {results.length}{" "}
        {results.length === 1 ? "destination" : "destinations"}
      </p>

      {results.length > 0 ? (
        <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((destination) => (
            <DestinationCard key={destination.id} destination={destination} />
          ))}
        </div>
      ) : (
        <div className="mt-5 flex flex-col items-center rounded-xl border border-dashed py-16 text-center">
          <p className="text-base font-medium">No destinations found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different category or price range.
          </p>
        </div>
      )}
    </div>
  );
}

/** Skeleton shell streamed while the server fetch resolves. */
export function DestinationsFallback() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <h1 className="font-display text-4xl tracking-tight lg:text-5xl">
        Explore All Destinations
      </h1>
      <p
        aria-hidden
        className="mt-2 h-4 w-64 animate-pulse rounded bg-muted lg:w-80"
      />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="h-11 animate-pulse rounded-lg bg-muted" />
        <div className="h-11 animate-pulse rounded-lg bg-muted" />
        <div className="h-11 animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index}>
            <div className="aspect-16/10 w-full animate-pulse rounded-lg bg-muted" />
            <div className="mt-3 h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-5 w-40 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
