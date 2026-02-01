import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Kwidao — Subscribe",
  description: "Subscribe to our mailing list",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
