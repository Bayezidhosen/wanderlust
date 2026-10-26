"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { DEPARTURE_DATE_PATTERN } from "@/lib/destinations";
import {
  createBooking,
  deleteBooking,
  type BookingInput,
  updateBookingDeparture,
} from "@/lib/bookings";

export type BookingActionResult =
  | { ok: true }
  | { ok: false; error: string };

async function requireSessionUserId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.id ?? null;
}

/**
 * Books the signed-in user a spot on a destination package. Rejects
 * unauthenticated callers and clearly malformed input; the DB stores
 * numbers, so price is coerced at the boundary.
 */
export async function createBookingAction(
  input: BookingInput,
): Promise<BookingActionResult> {
  const userId = await requireSessionUserId();
  if (!userId) {
    return { ok: false, error: "Please log in to book a trip." };
  }

  if (
    !input.destinationId ||
    !input.name.trim() ||
    !input.country.trim() ||
    !input.duration.trim() ||
    !DEPARTURE_DATE_PATTERN.test(input.departureDate) ||
    Number.isNaN(Number(input.price))
  ) {
    return { ok: false, error: "The booking details look invalid." };
  }

  try {
    await createBooking(userId, {
      destinationId: input.destinationId,
      name: input.name.trim(),
      country: input.country.trim(),
      price: Number(input.price),
      duration: input.duration.trim(),
      departureDate: input.departureDate,
      imageUrl: input.imageUrl.trim(),
    });
  } catch {
    return { ok: false, error: "Something went wrong. Please try again." };
  }

  // My Bookings reads fresh from the DB on every visit.
  revalidatePath("/bookings");
  return { ok: true };
}

/** Cancels one of the signed-in user's own bookings. */
export async function cancelBookingAction(id: string): Promise<BookingActionResult> {
  const userId = await requireSessionUserId();
  if (!userId) {
    return { ok: false, error: "Please log in first." };
  }

  try {
    const deleted = await deleteBooking(userId, id);
    if (!deleted) {
      return { ok: false, error: "That booking could not be found." };
    }
  } catch {
    return { ok: false, error: "Something went wrong. Please try again." };
  }

  revalidatePath("/bookings");
  return { ok: true };
}

/** Moves one of the signed-in user's own bookings to a new departure date. */
export async function changeBookingDateAction(
  id: string,
  departureDate: string,
): Promise<BookingActionResult> {
  const userId = await requireSessionUserId();
  if (!userId) {
    return { ok: false, error: "Please log in first." };
  }

  if (!DEPARTURE_DATE_PATTERN.test(departureDate)) {
    return { ok: false, error: "Please pick a valid departure date." };
  }

  try {
    const updated = await updateBookingDeparture(userId, id, departureDate);
    if (!updated) {
      return { ok: false, error: "That booking could not be found." };
    }
  } catch {
    return { ok: false, error: "Something went wrong. Please try again." };
  }

  revalidatePath("/bookings");
  return { ok: true };
}
