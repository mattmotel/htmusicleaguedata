import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SidebarNavigation from '../components/ui/SidebarNavigation';

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hard Times Music League Data",
  description: "A comprehensive data visualization tool for the Hard Times Music League submissions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <SidebarNavigation />
          <div className="transition-all duration-300" id="main-content">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
