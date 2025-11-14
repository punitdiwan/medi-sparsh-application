import { AppSidebar } from "@/Components/AppSidebar";
import Navbar from "@/Components/Navbar";
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { redirect } from "next/navigation";
import { validateServerSession } from "@/lib/validateSession";
import type { Metadata } from 'next';
import { AuthProvider } from "@/context/AuthContext";
import { getCurrentUser } from "@/lib/utils/auth-helpers";
import { getCurrentHospital } from "@/lib/tenant";
import { getUserRole } from "@/lib/db/queries";
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

  const sessionData = await validateServerSession();
  console.log("Session data:", sessionData)
  if (!sessionData) redirect("/sign-in");
  const hospital = await getCurrentHospital();
  const memberRole = await getUserRole(sessionData?.user?.id, hospital.hospitalId);

  const userData = {
    userData: sessionData?.user,
    hospital,
    memberRole: memberRole,
  };
  // console.log("Server-side fetched user data:", userData);

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
