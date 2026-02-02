import { AppSidebar } from "@/Components/AppSidebar";
import Navbar from "@/Components/docNavbar";
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { cookies } from "next/headers";
import type { Metadata } from 'next';
import { AuthProvider } from "@/context/AuthContext";

import { getCurrentHospital } from "@/lib/tenant";
import { AbilityProvider } from "@/components/providers/AbilityProvider"

export const metadata: Metadata = {
  title: 'medisparsh',
  description: 'Basic dashboard for EMR'
};

//Force dynamic rendering to get fresh middleware cookies
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // SECURITY: Read full session from HTTP-only cookie (server-side only)
  const cookieStore = cookies();
  const sessionStr = (await cookieStore).get("session")?.value || "{}";
  const session = JSON.parse(sessionStr);
  const permissionsStr = (await cookieStore).get("permissions")?.value || "{}";
  
  const permissions = JSON.parse(permissionsStr);
  const hospital = await getCurrentHospital();
  const userData = {
    userData: session?.user || {},
    hospital,
    memberRole: session?.role || [],
  };
  
  return (
    <AbilityProvider permissions={permissions}>
      <AuthProvider initialUser={userData}>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <Navbar />
            {/* page main content */}
            {children}
            {/* page main content ends */}
          </SidebarInset>
        </SidebarProvider>
      </AuthProvider>
     </AbilityProvider>
  );
}
