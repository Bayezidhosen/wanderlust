export type Destination = {
  id: string;
  name: string;
  country: string;
  category: string;
  price: number;
  duration: string;
  rating: number;
  reviews?: number;
  imageUrl: string;
  description: string;
  highlights?: string[];
  perks?: string[];
};

export type StoredPackage = {
  id: string;
  createdAt: string;
  name: string;
  country: string;
  category: string;
  price: number | string;
  duration: string;
  departureDate: string;
  imageUrl: string;
  description: string;
  rating?: number;
};

/** Must match the storage key written by /add-destination. */
export const PACKAGES_STORAGE_KEY = "wanderlast-packages";

/** localStorage key for bookings created from the destination detail page. */
export const BOOKINGS_STORAGE_KEY = "wanderlast-bookings";

const BACKEND_URL = "http://localhost:8000";

const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

export const SAMPLE_DESTINATIONS: Destination[] = [
  {
    id: "bali-paradise",
    name: "Bali Paradise",
    country: "Indonesia",
    category: "beach",
    price: 1299,
    duration: "7 Days / 6 Nights",
    rating: 4.9,
    reviews: 234,
    imageUrl: unsplash("photo-1537996194471-e657df975ab4"),
    description:
      "Discover the magic of Bali with pristine beaches, ancient temples, and vibrant culture. Experience luxury resorts, tropical landscapes, and unforgettable sunsets.",
    highlights: [
      "Luxury beachfront accommodation",
      "Traditional Balinese spa treatment",
      "Sunrise trek to Mount Batur",
      "Visit Uluwatu Temple at sunset",
      "Private beach dinner experience",
    ],
    perks: [
      "Free cancellation up to 7 days",
      "Travel insurance included",
      "24/7 customer support",
    ],
  },
  {
    id: "santorini-escape",
    name: "Santorini Escape",
    country: "Greece",
    category: "beach",
    price: 1899,
    duration: "5 Days / 4 Nights",
    rating: 4.8,
    reviews: 187,
    imageUrl: unsplash("photo-1570077188670-e3a8d69ac5ff"),
    description:
      "Whitewashed villages, caldera views, and legendary sunsets over the Aegean. Sailing, wine tasting, and cliffside luxury included.",
    highlights: [
      "Cliffside boutique hotel in Oia",
      "Private caldera sunset cruise",
      "Wine tasting at local vineyards",
      "Guided tour of Akrotiri ruins",
    ],
    perks: [
      "Free cancellation up to 7 days",
      "Airport transfers included",
      "24/7 customer support",
    ],
  },
  {
    id: "swiss-alps-explorer",
    name: "Swiss Alps Explorer",
    country: "Switzerland",
    category: "mountains",
    price: 2150,
    duration: "6 Days / 5 Nights",
    rating: 4.7,
    reviews: 156,
    imageUrl: unsplash("photo-1531366936167-7002245095bf"),
    description:
      "Breathtaking alpine adventures through the Swiss mountains. Panoramic trains, alpine villages, and guided hikes for unforgettable mountain memories.",
    highlights: [
      "Glacier Express panoramic train ride",
      "Guided alpine hiking with mountain guide",
      "Stay in charming alpine lodges",
      "Visit Jungfraujoch — Top of Europe",
    ],
    perks: [
      "Free cancellation up to 7 days",
      "Swiss travel pass included",
      "24/7 customer support",
    ],
  },
  {
    id: "tokyo-culture-tour",
    name: "Tokyo Culture Tour",
    country: "Japan",
    category: "city",
    price: 1750,
    duration: "8 Days / 7 Nights",
    rating: 4.9,
    reviews: 221,
    imageUrl: unsplash("photo-1540959733332-eab4deabeeaf"),
    description:
      "From neon-lit Shibuya to serene temples, experience the perfect blend of tradition and modernity in Japan's vibrant capital.",
    highlights: [
      "Guided tours of Asakusa and Meiji Shrine",
      "Day trip to Mount Fuji and Hakone",
      "Traditional tea ceremony experience",
      "Food tour through hidden izakayas",
    ],
    perks: [
      "Free cancellation up to 7 days",
      "Japan rail pass included",
      "24/7 customer support",
    ],
  },
  {
    id: "caribbean-cruise",
    name: "Caribbean Cruise",
    country: "Bahamas",
    category: "cruise",
    price: 2490,
    duration: "9 Days / 8 Nights",
    rating: 4.8,
    reviews: 98,
    imageUrl: unsplash("photo-1514282401047-d79a71a590e8"),
    description:
      "Island-hop the turquoise Caribbean aboard a luxury liner, with snorkeling stops, private beach days, and all-inclusive dining.",
    highlights: [
      "Private island beach day",
      "Snorkeling in coral reefs",
      "All-inclusive dining and entertainment",
      "Visit to colonial-era Nassau",
    ],
    perks: [
      "Free cancellation up to 14 days",
      "Drinks package included",
      "24/7 customer support",
    ],
  },
  {
    id: "dubai-lights",
    name: "Dubai Lights",
    country: "United Arab Emirates",
    category: "city",
    price: 1599,
    duration: "5 Days / 4 Nights",
    rating: 4.6,
    reviews: 143,
    imageUrl: unsplash("photo-1512453979798-5ea266f8880c"),
    description:
      "Skyscrapers, souks, and desert dunes — Dubai packs futuristic luxury and old-world charm into one dazzling skyline.",
    highlights: [
      "Burj Khalifa observation deck access",
      "Evening desert safari with BBQ",
      "Dhow cruise along Dubai Marina",
      "Old Dubai souk walking tour",
    ],
    perks: [
      "Free cancellation up to 7 days",
      "Visa assistance included",
      "24/7 customer support",
    ],
  },
];

/**
 * Packages the user added locally (localStorage) mapped onto the Destination
 * display shape used by the listings grid. TODO: rating is a placeholder
 * until the add-destination form starts collecting it.
 */
export function toStoredDestination(pkg: StoredPackage): Destination {
  return {
    id: pkg.id,
    name: pkg.name,
    country: pkg.country,
    category: pkg.category,
    price: Number(pkg.price) || 0,
    duration: pkg.duration,
    rating: pkg.rating ?? 4.5,
    imageUrl: pkg.imageUrl,
    description: pkg.description,
  };
}

/**
 * Fetches destinations from the backend API. Returns `null` when the backend
 * is unreachable or responds unexpectedly, so callers can fall back to
 * localStorage additions over SAMPLE_DESTINATIONS.
 * TODO: confirm the backend payload shape once the API is finalized.
 */
export async function fetchBackendDestinations(): Promise<Destination[] | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/destinations`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Destination[];
    if (!Array.isArray(data)) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Mock lookup for the destination-details page until a real backend/DB
 * lands — replace the body with the actual fetch.
 */
export async function getDestination(id: string): Promise<Destination | null> {
  return SAMPLE_DESTINATIONS.find((destination) => destination.id === id) ?? null;
}
