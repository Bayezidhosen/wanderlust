import type { Metadata } from "next";
import { Josefin_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/toast";

const Josefinsans = Josefin_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const Playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wanderlast",
  description: "Discover your next adventure.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${Josefinsans.variable} ${Playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
         <Navbar />
        
        {children}
         <Footer />
         <Toaster />

        </body>
        
    </html>
  );
}
