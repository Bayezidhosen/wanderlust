import { Headphones, Map, ShieldCheck } from "lucide-react";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Safe & Secure",
    description:
      "Your safety is our priority with comprehensive travel insurance and 24/7 support.",
  },
  {
    icon: Map,
    title: "Expert Guides",
    description:
      "Local experts who bring destinations to life with authentic cultural insights.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description:
      "Round-the-clock customer service to assist you wherever your journey takes you.",
  },
] as const;

export function WhyChoose() {
  return (
    <section id="why-choose" className="bg-[#e5f6fa] py-24 lg:py-28">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-10 lg:px-16">
        <div className="text-center">
          <h2 className="font-display text-4xl text-neutral-900 md:text-[44px]">
            Why Choose Wanderlust
          </h2>
          <p className="mt-4 text-sm text-neutral-500">
            Your trusted partner for exceptional travel experiences
          </p>
        </div>

        <div className="mt-12 grid gap-7 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="bg-white px-7 py-9">
              <Icon size={30} strokeWidth={1.75} className="text-[#1ba8bc]" aria-hidden />
              <h3 className="mt-8 font-display text-2xl text-neutral-900">
                {title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-neutral-500">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
