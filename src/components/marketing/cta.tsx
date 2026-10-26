import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Cta() {
  return (
    <section className="relative isolate flex min-h-[400px] flex-col items-center justify-center overflow-hidden px-4 py-20 text-center">
      <Image
        src="/images/CTA.png"
        alt="Aerial view of an airplane flying over a tropical island"
        fill
        sizes="100vw"
        className="-z-10 object-cover"
      />
      {/* Darkening overlay — CTA.png is the un-dimmed source image */}
      <div className="absolute inset-0 -z-10 bg-black/60" aria-hidden />

      <h2 className="font-display text-4xl text-white md:text-[44px]">
        Ready To Start Your Journey?
      </h2>
      <p className="mt-4 text-sm text-white/90">
        Join thousands of travelers who have discovered the world with us
      </p>
      <Link
        href="/bookings"
        className="mt-10 flex items-center gap-3 bg-white px-8 py-3.5 text-xs font-semibold tracking-[0.08em] text-neutral-900 uppercase transition-colors hover:bg-neutral-100"
      >
        Book Your Trip Today
        <ArrowRight size={16} aria-hidden />
      </Link>
    </section>
  );
}
