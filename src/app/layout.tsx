import Navbar from "./components/shared/Navbar/page";
import { ThemeProvider } from "./components/ThemeProvider/theme-provider";
import "./globals.css";
import type { Metadata } from "next";
//import { ThemeProvider } from "@/components/theme-provider"


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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="p-6">{children}
          </main>
        </ThemeProvider>

      </body>
    </html>
  );
}
