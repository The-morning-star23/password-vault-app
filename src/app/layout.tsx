import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Setup for the Inter font
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Password Vault",
  description: "A secure password generator and vault",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        // Use the Inter font class here
        className={`${inter.className} bg-gray-900 text-white antialiased`}
      >
        {children}
      </body>
    </html>
  );
}