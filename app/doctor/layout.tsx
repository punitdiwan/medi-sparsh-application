import { AppSidebar } from "@/Components/AppSidebar";
import Navbar from "@/Components/Navbar";
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { redirect } from "next/navigation";
import { validateServerSession } from "@/lib/validateSession";
import type { Metadata } from 'next';
import { AuthProvider } from "@/context/AuthContext";

import { getCurrentHospital } from "@/lib/tenant";
import { getUserRole } from "@/lib/db/queries";


export const metadata: Metadata = {
  title: 'medisparsh',
  description: 'Basic dashboard for EMR'
};

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {

  const sessionData = await validateServerSession();
  if (!sessionData) redirect("/sign-in");
  const hospital = await getCurrentHospital();
  if(sessionData?.session?.activeOrganizationId !== hospital?.hospitalId){
    redirect("/sign-in")
  }
  const memberRole = await getUserRole(sessionData?.user?.id, hospital.hospitalId);

  const userData = {
    userData: sessionData?.user,
    hospital,
    memberRole: memberRole,
  };

  return (
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
  );
}
