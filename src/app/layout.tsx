import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cartContext";
import CartDrawer from "@/components/storefront/CartDrawer";

// Editorial Serif — for headings & brand name
const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

// Geometric Sans — for body text & UI
const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ZURIQ FASHION — Elegant & Modern Fusion Apparel",
  description:
    "Discover ZURIQ FASHION's curated collection of elegant and modern fusion apparel. Where timeless Indian royal craftsmanship meets contemporary silhouettes.",
  keywords: [
    "fashion",
    "luxury",
    "fusion apparel",
    "kurtis",
    "anarkali",
    "lehenga",
    "ZURIQ",
    "Indian couture",
  ],
  openGraph: {
    title: "ZURIQ FASHION — Elegant & Modern Fusion Apparel",
    description:
      "Discover ZURIQ FASHION's curated collection of elegant and modern fusion apparel.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorantGaramond.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-jakarta bg-ivory text-charcoal">
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
