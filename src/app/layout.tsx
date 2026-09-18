import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "momcard — family billing",
  description: "Private local family billing dashboard · Citi ****0183",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="grain" aria-hidden />
        {children}
      </body>
    </html>
  );
}
