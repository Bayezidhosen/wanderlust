import { db } from "@/lib/auth";
import type { Booking } from "@/lib/destinations";

/**
 * User-scoped travel bookings in the shared auth database. Documents are
 * keyed by the better-auth user id, so "My Bookings" only ever shows data
 * belonging to the signed-in user.
 *
 * Field notes: `id` is an app-level id (stable, embeddable in URLs, and
 * reusable across cancels); `createdAt` is stored as a Date but always
 * serialized to an ISO string when handed back to the client.
 */
type BookingDoc = Omit<Booking, "createdAt"> & {
  userId: string;
  createdAt: Date;
};

const bookings = () => db.collection("bookings");

let indexed = false;

async function ensureIndex(): Promise<void> {
  if (indexed) return;
  indexed = true;
  // Non-critical: duplicate userId index attempts are self-healing, ignore.
  await bookings().createIndex({ userId: 1 }).catch(() => undefined);
}

function docToBooking(doc: BookingDoc): Booking {
  return {
    id: doc.id,
    destinationId: doc.destinationId,
    name: doc.name,
    country: doc.country,
    price: doc.price,
    duration: doc.duration,
    departureDate: doc.departureDate,
    imageUrl: doc.imageUrl,
    createdAt:
      doc.createdAt instanceof Date
        ? doc.createdAt.toISOString()
        : String(doc.createdAt),
  };
}

export type BookingInput = Omit<Booking, "id" | "createdAt">;

/** All bookings for a user, newest first. */
export async function listBookings(userId: string): Promise<Booking[]> {
  await ensureIndex();
  const docs = await bookings()
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map((doc) =>
    docToBooking(doc as unknown as BookingDoc),
  );
}

export async function createBooking(
  userId: string,
  input: BookingInput,
): Promise<Booking> {
  await ensureIndex();
  const doc: BookingDoc = {
    userId,
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    destinationId: input.destinationId,
    name: input.name,
    country: input.country,
    price: input.price,
    duration: input.duration,
    departureDate: input.departureDate,
    imageUrl: input.imageUrl,
    createdAt: new Date(),
  };

  await bookings().insertOne(doc);
  return docToBooking(doc);
}

/** Cancels a booking — only when it belongs to the requesting user. */
export async function deleteBooking(
  userId: string,
  id: string,
): Promise<boolean> {
  await ensureIndex();
  const result = await bookings().deleteOne({ id, userId });
  return result.deletedCount > 0;
}

/** Changes a booking's departure date — only when it belongs to the user. */
export async function updateBookingDeparture(
  userId: string,
  id: string,
  departureDate: string,
): Promise<boolean> {
  await ensureIndex();
  const result = await bookings().updateOne(
    { id, userId },
    { $set: { departureDate } },
  );
  return result.matchedCount > 0;
}
