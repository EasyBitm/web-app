import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "easyBITM | Bachelor in Information Technology and Management",
    template: "%s | easyBITM",
  },
  description:
    "easyBITM is a resource hub for BITM students, offering semester resources, CMAT preparation materials, notices, and helpful academic information.",

  keywords: [
    "easyBITM",
    "BITM",
    "Bachelor in Information Technology and Management",
    "Tribhuvan University BITM",
    "BITM Nepal",
    "BITM notes",
    "BITM resources",
    "CMAT preparation",
  ],

  verification: {
    google: "59RFzlcrOVtSGe2gMoP7DuElt7iAECAR00951ECan0s",
  },

  openGraph: {
    title: "easyBITM | BITM Resources & Study Hub",
    description:
      "Resources, semester materials, CMAT preparation, and notices for BITM students.",
    type: "website",
    siteName: "easyBITM",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
