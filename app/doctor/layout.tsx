import { AppSidebar } from "@/Components/AppSidebar";
import Navbar from "@/Components/docNavbar";
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { redirect } from "next/navigation";
import { validateServerSession } from "@/lib/validateSession";
import type { Metadata } from 'next';
import { AuthProvider } from "@/context/AuthContext";

import { getCurrentHospital } from "@/lib/tenant";
import { getUserRole } from "@/db/queries";
import { AbilityProvider } from "@/components/providers/AbilityProvider"
import { defineAbilityFromJSON } from "@/lib/casl/defineAbilityFromDB";

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
  if (sessionData?.session?.activeOrganizationId !== hospital?.hospitalId) {
    redirect("/sign-in")
  }
  const memberRole = await getUserRole(sessionData?.user?.id, hospital.hospitalId);

  const userData = {
    userData: sessionData?.user,
    hospital,
    memberRole: memberRole,
  };
  // const userData = null;

  const AData ={
  "role": "admin",
  "permission": {
    "project": ["create", "read", "update", "delete"],
    "appointment": ["create", "read", "update", "delete"],
    "role": ["create", "read", "update", "delete"],
    "patient": ["create", "read", "update", "delete"],
    "prescription": ["create", "read", "update", "delete"],
    "pharmacy": ["create", "read", "update", "delete"],
    "reports": ["create", "read", "update", "delete"],
    "services": ["create", "read", "update", "delete"],
    "members": ["create", "read", "update", "delete"],
    "bed": ["create", "read", "update", "delete"],
    "hospitalCharger": ["create", "read", "update", "delete"],
    "payment": ["create", "read", "update", "delete"],
    "shifts": ["create", "read", "update", "delete"],
    "vitals": ["create", "read", "update", "delete"],
    "medicineRedord": ["create", "read", "update", "delete"]
  }
}

    const data = {
    "role": "doctor",
    "permission": {
      "appointment": ["create", "read", "update"],
      "patient": ["create", "read", "update"],
      "prescription": ["create", "read", "update"],
      "reports": ["read"],
      "services": ["read"],
      "vitals": ["create", "read", "update"],
      "medicineRedord": ["create", "read", "update"],
      "payment": ["read"],
      "members": ["read"],
      "bed": ["read"]
    }
  }
  const RData={
  "role": "receptionist",
  "permission": {
    "appointment": ["create", "read", "update"],
    "patient": ["create", "read", "update"],
    "payment": ["create", "read"],
    "bed": ["read"],
    "services": ["read"],
    "members": ["read"],
    "reports": ["read"]
  }
}

  return (
    <AbilityProvider permissions={data.permission}>
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
