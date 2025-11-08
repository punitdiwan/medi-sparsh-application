import { AppSidebar } from "@/Components/AppSidebar";
import Navbar from "@/Components/Navbar";

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import { redirect } from "next/navigation";
import { validateServerSession } from "@/lib/validateSession";

import type { Metadata } from 'next';
// import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'medisparsh',
  description: 'Basic dashboard for EMR'
};

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Persisting the sidebar state in the cookie.
  // const cookieStore = await cookies();
  // const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"
  const sessionData = await validateServerSession();
  console.log(sessionData);
  if (!sessionData) {
    redirect("/sign-in");
  }
  
  return (
    <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <Navbar />
            
              {/* page main content */}
              {children}
              {/* page main content ends */}
            </SidebarInset>
          </SidebarProvider>
  );
}
