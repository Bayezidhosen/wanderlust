"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

const SEARCH_FIELDS = [
  { name: "location", label: "Location", placeholder: "Address, City Or Zip" },
  { name: "dates", label: "Date/Duration", placeholder: "Anytime/3 Days" },
  { name: "budget", label: "Budget", placeholder: "$0-$3000" },
  { name: "people", label: "People", placeholder: "5-10" },
] as const;

type SearchQuery = Record<(typeof SEARCH_FIELDS)[number]["name"], string>;

export function Banner() {
  const [query, setQuery] = useState<SearchQuery>({
    location: "",
    dates: "",
    budget: "",
    people: "",
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // TODO: wire up to destinations search
    console.log(query);
  }

  return (
    <section className="relative isolate flex min-h-[640px] flex-col">
      <Image
        src="/images/Banner.png"
        alt="Aerial view of a turquoise bay surrounded by green hills"
        fill
        priority
        className="-z-10 object-cover"
      />

      <div className="flex flex-1 flex-col items-center justify-center px-4 pt-24 pb-20 text-center text-white">
        <h1 className="font-display text-5xl leading-[1.05] text-white sm:text-6xl xl:text-[68px]">
          Discover Your
          <br />
          Next Adventure
        </h1>
        <p className="mt-6 max-w-md text-sm leading-relaxed text-white/90 sm:text-base">
          Explore breathtaking destinations and create unforgettable memories
          with our curated travel experiences.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            className="flex items-center gap-3 bg-[#1ba8bc] px-8 py-3.5 text-xs font-semibold tracking-[0.08em] text-white uppercase transition-colors hover:bg-[#179cb0]"
          >
            Explore Now
            <ArrowRight size={16} aria-hidden />
          </button>
          <button
            type="button"
            className="bg-white/25 px-8 py-3.5 text-xs font-semibold tracking-[0.08em] text-white uppercase transition-colors hover:bg-white/35"
          >
            View Destination
          </button>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        aria-label="Trip search"
        className="grid grid-cols-1 border-t border-white/50 sm:grid-cols-2 lg:grid-cols-5"
      >
        {SEARCH_FIELDS.map((field) => (
          <label
            key={field.name}
            className="flex flex-col gap-1.5 border-b border-white/50 bg-neutral-700/60 px-6 py-3.5 lg:border-r lg:border-b-0"
          >
            <span className="text-[15px] font-semibold text-white">
              {field.label}
            </span>
            <input
              value={query[field.name]}
              onChange={(event) =>
                setQuery({ ...query, [field.name]: event.target.value })
              }
              placeholder={field.placeholder}
              className="w-full bg-transparent text-xs text-white outline-none placeholder:text-white/70"
            />
          </label>
        ))}
        <button
          type="submit"
          className="bg-[#1ba8bc] py-5 text-[15px] font-semibold text-white transition-colors hover:bg-[#179cb0] sm:col-span-2 lg:col-span-1 lg:py-3.5"
        >
          Search
        </button>
      </form>
    </section>
  );
}
