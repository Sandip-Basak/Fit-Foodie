import type { Metadata } from 'next';
import { Geist } from 'next/font/google'; // Renamed from Geist_Sans to Geist
import './globals.css';
import { Toaster } from '@/components/ui/toaster'; // Import Toaster

// Setup Geist Sans font
const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans', // Define CSS variable
});

// Metadata for the application
export const metadata: Metadata = {
  title: 'FitFoodie Guide',
  description: 'Personalized food recommendations for your fitness journey.',
};

// Root layout component
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Apply Geist Sans font class to the body */}
      <body className={`${geistSans.variable} antialiased font-sans`}>
        {children}
        <Toaster /> {/* Add Toaster component for global notifications */}
      </body>
    </html>
  );
}
