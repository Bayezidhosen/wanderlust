"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // TODO: wire up to newsletter signup
    console.log(email);
    setEmail("");
  }

  return (
    <form onSubmit={handleSubmit} className="relative mt-4 w-72 max-w-full">
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Enter email"
        className="w-full bg-[#2a2a2a] px-4 py-3 pr-11 text-sm text-white outline-none placeholder:text-neutral-400"
      />
      <button
        type="submit"
        aria-label="Subscribe to newsletter"
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-white transition-colors hover:text-neutral-300"
      >
        <ArrowUpRight size={18} aria-hidden />
      </button>
    </form>
  );
}
