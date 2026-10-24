"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
} from "@/components/ui/carousel";

const TESTIMONIALS = [
  {
    quote:
      '"The Bali Trip Was Absolutely Magical! Every Detail Was Perfectly Planned. The Resorts Were Luxurious And The Cultural Experiences Were Unforgettable."',
    name: "Michael Chen",
    location: "Singapore",
    image: "/images/person2.png",
  },
  {
    quote:
      '"Swiss Alps Adventure Exceeded All Expectations. The Mountain Views Were Breathtaking And Our Guide Was Incredibly Knowledgeable. Highly Recommend!!"',
    name: "Sarah Johnson",
    location: "New York, USA",
    image: "/images/person1.png",
  },
  {
    quote:
      '"Lisbon Was The Perfect Family Getaway. Smooth Transfers, Great Food Tours And A Team That Genuinely Cares About Every Traveler."',
    name: "Elena Rodriguez",
    location: "Barcelona, Spain",
    image: "/images/person1.png",
  },
  {
    quote:
      '"From Booking To Boarding Everything Was Seamless. Our Guide Knew All The Hidden Gems. Worth Every Penny!"',
    name: "David Kim",
    location: "Seoul, South Korea",
    image: "/images/person2.png",
  },
] as const;

const ARROW_BUTTON_CLASS =
  "flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 text-neutral-400 transition-colors hover:border-neutral-300 hover:text-neutral-600 disabled:pointer-events-none disabled:opacity-40";

function TestimonialControls() {
  const { scrollPrev, scrollNext, canScrollPrev, canScrollNext } = useCarousel();

  return (
    <div className="flex shrink-0 gap-4 self-center">
      <button
        type="button"
        aria-label="Previous testimonials"
        className={ARROW_BUTTON_CLASS}
        onClick={scrollPrev}
        disabled={!canScrollPrev}
      >
        <ArrowLeft size={18} strokeWidth={1.5} aria-hidden />
      </button>
      <button
        type="button"
        aria-label="Next testimonials"
        className={ARROW_BUTTON_CLASS}
        onClick={scrollNext}
        disabled={!canScrollNext}
      >
        <ArrowRight size={18} strokeWidth={1.5} aria-hidden />
      </button>
    </div>
  );
}

export function Testimonials() {
  return (
    <section id="testimonials" className="bg-white py-20 lg:py-24">
      <Carousel
        opts={{ align: "start" }}
        className="mx-auto w-full max-w-7xl px-6 md:px-10 lg:px-16"
      >
        <div className="flex items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-4xl text-neutral-900 md:text-[44px]">
              What Travelers Say
            </h2>
            <p className="mt-2.5 text-sm text-neutral-500">
              Real experiences from our happy travelers
            </p>
          </div>
          <TestimonialControls />
        </div>

        <CarouselContent className="-ml-6 mt-10">
          {TESTIMONIALS.map((testimonial) => (
            <CarouselItem
              key={testimonial.name}
              className="basis-full pl-6 sm:basis-1/2"
            >
              <figure className="flex h-full gap-5 border border-neutral-200 bg-white p-6">
                <div className="flex flex-1 flex-col">
                  <blockquote className="text-lg leading-[1.4] text-neutral-900">
                    {testimonial.quote}
                  </blockquote>
                  <figcaption className="mt-auto pt-10">
                    <p className="text-[15px] text-[#1ba8bc]">
                      — {testimonial.name}
                    </p>
                    <p className="mt-1 ml-4 text-xs text-neutral-400">
                      {testimonial.location}
                    </p>
                  </figcaption>
                </div>
                <div className="relative w-[38%] max-w-[190px] shrink-0 self-stretch">
                  <Image
                    src={testimonial.image}
                    alt={`Portrait of ${testimonial.name}`}
                    fill
                    sizes="(max-width: 640px) 38vw, 190px"
                    className="object-cover"
                  />
                </div>
              </figure>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
