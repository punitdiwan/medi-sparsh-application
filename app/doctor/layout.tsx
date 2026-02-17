import { AppSidebar } from "@/Components/AppSidebar";
import Navbar from "@/Components/docNavbar";
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { redirect } from "next/navigation";
import { validateServerSession } from "@/lib/validateSession";
import type { Metadata } from 'next';
import { AuthProvider } from "@/context/AuthContext";

import { getCurrentHospital } from "@/lib/tenant";
import { getModulesByHospital, getUserRole } from "@/db/queries";
import { AbilityProvider } from "@/components/providers/AbilityProvider"
import TrialNav from "@/Components/trialNav";
import TrialExpiredScreen from "@/Components/TrialExpiredScreen";
import { getMasterModules, getModules } from "@/lib/actions/getMasterModule";
import { getMasterPermissions } from "@/lib/actions/masterPermission";

export const metadata: Metadata = {
  title: 'medisparsh',
  description: 'Basic dashboard for EMR'
};

type AppSession = {
  permissionsData?: Record<string, string[]>;
  role?: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  session: {
    id: string;
    userId: string;
    expiresAt: Date | string;
    activeOrganizationId: string;
  };
};
export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {

  const sessionData = await validateServerSession() as AppSession;
  if (!sessionData) redirect("/sign-in");
  const hospital = await getCurrentHospital();
  if (sessionData?.session?.activeOrganizationId !== hospital?.hospitalId) {
    redirect("/sign-in")
  }

  const RData = {
    "role": "receptionist",
    "permission": {
      "appointment": ["read"],
      "patient": ["read"],
      "payment": ["read"],
      "bed": ["read"],
      "services": ["read"],
      "members": ["read"],
      "reports": ["read"]
    }
  }
  const rawPermissions = sessionData.permissionsData;

  const permissions =
    typeof rawPermissions === "string"
      ? JSON.parse(rawPermissions)
      : rawPermissions;

  const RolePermission = permissions || RData.permission;

  console.log("RolePermission", RolePermission)

  const masterModules = await getModules();
  console.log('masterModules', masterModules)

  const MasterPermissions = await getMasterPermissions();
  console.log('MasterPermissions', MasterPermissions)

  const userData = {
    userData: sessionData?.user,
    hospital,
    memberRole: sessionData?.role,
  };
  // const userData = null;
  const trialExpired = isTrialExpired(hospital);
  return (
    <AbilityProvider permissions={RolePermission}>
      <AuthProvider initialUser={userData}>

        {trialExpired ? (
          <TrialExpiredScreen />
        ) : (<SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            {hospital?.metadata?.is_trial && <TrialNav endDate={hospital?.metadata?.trial_ends_at}/>}
            <Navbar />
            {children}
          </SidebarInset>
        </SidebarProvider>)}
      </AuthProvider>
    </AbilityProvider>
  );
}
export function isTrialExpired(hospital: any) {
  if (!hospital?.metadata?.is_trial || !hospital?.metadata?.trial_ends_at) {
    return false;
  }

  const trialEnd = new Date(hospital.metadata.trial_ends_at);
  trialEnd.setHours(23, 59, 59, 999);

  const now = new Date();

  return now > trialEnd;
}
