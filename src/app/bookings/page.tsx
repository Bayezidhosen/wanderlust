import Link from "next/link";
import { headers } from "next/headers";
import { Suspense } from "react";

import { BookingsFallback, BookingsView } from "@/components/bookings/bookings-view";
import { auth } from "@/lib/auth";
import { listBookings } from "@/lib/bookings";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

async function BookingsContent() {
  // Booking data is per-user (MongoDB, keyed by better-auth user id), so the
  // page is gated on the session and always fetched fresh.
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center py-16 text-center">
        <h2 className="font-display text-2xl tracking-tight">
          Log in to see your bookings
        </h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Bookings are tied to your account, so sign in to review and manage
          the trips you have booked.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <Link
            href="/login"
            className={cn(
              buttonVariants(),
              "bg-[#1ba8bc] text-white hover:bg-[#179cb0]",
            )}
          >
            Log in
          </Link>
          <Link href="/signup" className={cn(buttonVariants({ variant: "outline" }))}>
            Sign up
          </Link>
        </div>
      </div>
    );
  }

  const bookings = await listBookings(session.user.id);
  return <BookingsView bookings={bookings} />;
}

export const metadata = { title: "My Bookings — Wanderlast" };

export default function BookingsPage() {
  return (
    <main className="px-6 py-12 lg:px-10">
      <Suspense fallback={<BookingsFallback />}>
        <BookingsContent />
      </Suspense>
    </main>
  );
}
