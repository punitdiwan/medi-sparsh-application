import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/Components/theme-provider/theme-provider"
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'medisparsh',
  description: 'Basic dashboard for EMR'
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) 

{
  
  return (
   <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider >
        <Toaster />
         <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
          
            {children}
          </ThemeProvider>
          </AuthProvider>
        
      </body>
    </html>
  );
}
