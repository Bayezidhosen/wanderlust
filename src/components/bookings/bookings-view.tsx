"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  SaveIcon,
  Trash2Icon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import {
  DEPARTURE_DATE_PATTERN,
  formatDepartureDate,
  getBookingStatus,
  type Booking,
} from "@/lib/destinations";
import { cancelBookingAction, changeBookingDateAction } from "@/app/bookings/actions";

const FALLBACK_IMAGE = "/images/destinations/bali.jpg";

const STATUS_LABELS: Record<ReturnType<typeof getBookingStatus>, string> = {
  upcoming: "Upcoming",
  completed: "Completed",
};

function BookingImage({ src, alt }: { src: string; alt: string }) {
  const [currentSrc, setCurrentSrc] = React.useState(src);

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill
      unoptimized={/^https?:\/\//.test(currentSrc)}
      sizes="(max-width: 768px) 100vw, 136px"
      className="object-cover"
      onError={() => {
        setCurrentSrc((prev) => (prev === FALLBACK_IMAGE ? prev : FALLBACK_IMAGE));
      }}
    />
  );
}

function BookingCard({
  booking,
  isCancelling,
  onCancel,
}: {
  booking: Booking;
  isCancelling: boolean;
  onCancel: (booking: Booking) => void;
}) {
  const status = getBookingStatus(booking);
  const [isEditingDate, setIsEditingDate] = React.useState(false);
  const [dateValue, setDateValue] = React.useState(booking.departureDate);
  const [isSavingDate, setIsSavingDate] = React.useState(false);

  const isBookingPast = status === "completed";

  const handleChangeDate = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    if (!DEPARTURE_DATE_PATTERN.test(dateValue)) return;

    setIsSavingDate(true);
    const result = await changeBookingDateAction(booking.id, dateValue);
    setIsSavingDate(false);

    if (!result.ok) {
      toast.add({
        title: "Couldn't change the date",
        description: result.error,
        type: "error",
      });
      return;
    }

    toast.add({
      title: "Departure date updated",
      description: `${booking.name} now departs on ${formatDepartureDate(dateValue)}.`,
      type: "success",
    });
    setIsEditingDate(false);
  };

  return (
    <article className="group flex gap-4 rounded-xl bg-card p-4 shadow-sm ring-1 ring-foreground/10 flex-col sm:flex-row">
      <div className="relative aspect-16/10 w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:aspect-square sm:w-34">
        <BookingImage
          src={booking.imageUrl || FALLBACK_IMAGE}
          alt={booking.name}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPinIcon aria-hidden className="size-4 shrink-0" />
              {booking.country}
            </p>
            <h3 className="mt-0.5 truncate text-lg font-semibold tracking-tight">
              {booking.name}
            </h3>
          </div>
          <Badge
            variant={status === "upcoming" ? "default" : "secondary"}
            className="shrink-0"
          >
            {STATUS_LABELS[status]}
          </Badge>
        </div>

        <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-1.5">
            <CalendarDaysIcon
              aria-hidden
              className="size-4 shrink-0 text-muted-foreground"
            />
            <dt className="sr-only">Departure</dt>
            <dd>
              {formatDepartureDate(booking.departureDate)}
              <button
                type="button"
                aria-label={`Change departure date for ${booking.name}`}
                onClick={() => {
                  // Re-seed from the current booking so a previous edit is
                  // never carried over.
                  setDateValue(booking.departureDate);
                  setIsEditingDate(true);
                }}
                className="ml-1.5 align-baseline text-xs font-medium text-[#1ba8bc] underline-offset-4 hover:underline"
              >
                Change
              </button>
            </dd>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <ClockIcon aria-hidden className="size-4 shrink-0" />
            <dt className="sr-only">Duration</dt>
            <dd>{booking.duration}</dd>
          </div>
        </dl>

        <div className="mt-4 flex items-center justify-between gap-3 border-t pt-3">
          <p className="font-semibold">
            ${Number(booking.price).toLocaleString("en-US")}
            <span className="text-xs font-normal text-muted-foreground">
              {" "}
              /person
            </span>
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isCancelling || isSavingDate}
            onClick={() => onCancel(booking)}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2Icon data-icon="inline-start" aria-hidden />
            {isCancelling ? "Cancelling…" : "Cancel booking"}
          </Button>
        </div>
      </div>

      <Dialog open={isEditingDate} onOpenChange={setIsEditingDate}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg">Change departure date</DialogTitle>
            <DialogDescription>
              {isBookingPast
                ? `"${booking.name}" has already departed, but you can reschedule it to a future date.`
                : `Pick a new departure date for "${booking.name}".`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleChangeDate} noValidate>
            <Input
              type="date"
              aria-label={`New departure date for ${booking.name}`}
              value={dateValue}
              onChange={(event) => setDateValue(event.target.value)}
              className="h-11 w-full"
              required
            />

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditingDate(false)}
                disabled={isSavingDate}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isSavingDate ||
                  !DEPARTURE_DATE_PATTERN.test(dateValue) ||
                  dateValue === booking.departureDate
                }
                className="bg-[#1ba8bc] text-white hover:bg-[#179cb0]"
              >
                {isSavingDate ? <Spinner /> : <SaveIcon aria-hidden />}
                {isSavingDate ? "Saving…" : "Save date"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </article>
  );
}

export function BookingsView({ bookings }: { bookings: Booking[] }) {
  const [cancellingId, setCancellingId] = React.useState<string | null>(null);

  // Newest first: booked today at the top of "My Bookings".
  const sortedBookings = [...bookings].toSorted(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );

  const handleCancel = async (booking: Booking): Promise<void> => {
    setCancellingId(booking.id);
    const result = await cancelBookingAction(booking.id);
    setCancellingId(null);

    if (!result.ok) {
      toast.add({
        title: "Couldn't cancel the booking",
        description: result.error,
        type: "error",
      });
      return;
    }

    toast.add({
      title: "Booking cancelled",
      description: `"${booking.name}" was removed from your bookings.`,
      type: "info",
    });
  };

  const upcomingCount = bookings.filter(
    (booking) => getBookingStatus(booking) === "upcoming",
  ).length;

  return (
    <div className="mx-auto w-full max-w-4xl">
      <h1 className="font-display text-4xl tracking-tight lg:text-5xl">
        My Bookings
      </h1>
      <p
        aria-live="polite"
        className="mt-2 text-sm text-muted-foreground lg:text-base"
      >
        {sortedBookings.length === 0
          ? "Your booked trips will show up here"
          : `${upcomingCount} upcoming of ${sortedBookings.length} booked ${sortedBookings.length === 1 ? "trip" : "trips"}`}
      </p>

      {sortedBookings.length > 0 ? (
        <div className="mt-8 flex flex-col gap-5">
          {sortedBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              isCancelling={cancellingId === booking.id}
              onCancel={handleCancel}
            />
          ))}
        </div>
      ) : (
        <div className="mt-8 flex flex-col items-center rounded-xl border border-dashed py-16 text-center">
          <p className="text-base font-medium">No bookings yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Browse our destinations and book your next adventure in a few
            clicks.
          </p>
          <Link
            href="/destinations"
            className={cn(
              buttonVariants(),
              "mt-5 bg-[#1ba8bc] text-white hover:bg-[#179cb0]",
            )}
          >
            Explore destinations
          </Link>
        </div>
      )}
    </div>
  );
}

/** Skeleton shell streamed while the server fetch resolves. */
export function BookingsFallback() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="h-10 w-52 animate-pulse rounded bg-muted" />
      <div className="mt-2 h-4 w-64 animate-pulse rounded bg-muted" />
      <div className="mt-8 flex flex-col gap-5">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="flex gap-4 rounded-xl bg-card p-4">
            <div className="aspect-square w-34 animate-pulse rounded-lg bg-muted" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-5 w-48 animate-pulse rounded bg-muted" />
              <div className="mt-3 h-4 w-36 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
