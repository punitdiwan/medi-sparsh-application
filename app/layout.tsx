import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/Components/theme-provider/theme-provider"
import { Toaster } from "@/components/ui/sonner";
import { GoogleOAuthProvider } from '@react-oauth/google';
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
        <GoogleOAuthProvider clientId={"970782109131-f5hvt6uh5eusjo5omlj6g83gf1jrv9ve.apps.googleusercontent.com"}>
          <Toaster />
          <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
            
              {children}
            </ThemeProvider>
        </GoogleOAuthProvider>
        
      </body>
    </html>
  );
}
