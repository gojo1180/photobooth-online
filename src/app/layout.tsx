import type { Metadata } from "next";
import { Vollkorn, Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";

const vollkorn = Vollkorn({
  variable: "--font-vollkorn",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NevStudio • Retro Photobooth Studio",
  description:
    "Artisanal Digital Photobooth. Express yourself with vintage retro aesthetics, custom scrapbook frames, instant keepsake strips, and real-time collaborative duo rooms.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${vollkorn.variable} ${jakarta.variable} ${spaceGrotesk.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#fdf9f3] text-[#1c1c18] font-body-md antialiased selection:bg-tertiary-fixed selection:text-tertiary min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
