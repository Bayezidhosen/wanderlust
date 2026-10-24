import Link from "next/link";
import Image from "next/image";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/destinations", label: "Destinations", active : false },
  { href: "/add-destination", label: "Add Destination", active : false },
  { href: "/bookings", label: "My Bookings", active : false },
 
];

export function Navbar() {
  return (
    <header className="relative z-10 flex items-center justify-between bg-white px-6 py-3.5 text-[15px] text-neutral-800 lg:px-10">
      <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              link.href === "/" &&
                "text-[#1ba8bc] underline decoration-[1.5px] underline-offset-4"
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <Link href="/" className="absolute left-1/2 -translate-x-1/2">
        <Image
          src="/images/Wanderlast.png"
          alt="Wanderlast"
          width={162}
          height={24}
          priority
          className="h-5 w-auto"
        />
      </Link>

      <nav
        aria-label="Account"
        className="hidden items-center gap-7 md:flex"
      >
        <Link href="/profile" className="flex items-center gap-1.5">
          <User size={16} aria-hidden />
          Profile
        </Link>
        <Link href="/login">Login</Link>
        <Link href="/signup">Sign Up</Link>
      </nav>
    </header>
  );
}
