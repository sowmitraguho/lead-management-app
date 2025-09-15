import Navbar from "./components/shared/Navbar/page";
import "./globals.css";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Buyer Lead Intake App",
  description: "Manage and track buyer leads easily",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <Navbar />
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
