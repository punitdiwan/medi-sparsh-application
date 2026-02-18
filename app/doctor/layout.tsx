import { AppSidebar } from "@/Components/AppSidebar";
import Navbar from "@/Components/docNavbar";
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { redirect } from "next/navigation";
import { validateServerSession } from "@/lib/validateSession";
import type { Metadata } from 'next';
import { AuthProvider } from "@/context/AuthContext";
import { getCurrentHospital } from "@/lib/tenant";
import { AbilityProvider } from "@/components/providers/AbilityProvider"
import TrialNav from "@/Components/trialNav";
import TrialExpiredScreen from "@/Components/TrialExpiredScreen";
import { getModulesWithPermissions } from "@/lib/actions/getMasterModule";

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

  let RolePermission;
  if (sessionData.role === "owner") {
    const permissionsArray = sessionData?.permissionsData?.data || [];
    RolePermission = permissionsArray.reduce(
      (acc: Record<string, string[]>, item: any) => {
        if (
          item?.permissionSubject &&
          Array.isArray(item?.permissionActions)
        ) {
          acc[item.permissionSubject] = item.permissionActions;
        }
        return acc;
      },
      {}
    );
  } else {
    // Normal roles use stored permissions
    const rawPermissions = sessionData.permissionsData;
    const permissions =
      typeof rawPermissions === "string" ? JSON.parse(rawPermissions) : rawPermissions;
    RolePermission = permissions || RData.permission;
  }
  const modulesDataWithPermissions = await getModulesWithPermissions(hospital?.hospitalId, hospital?.metadata?.orgMode);
  // console.log('Modules with permissions in layout', modulesDataWithPermissions)

  const userData = {
    userData: sessionData?.user,
    hospital,
    memberRole: sessionData?.role,
    permissions: RolePermission
  };
  // const userData = null;
  const trialExpired = isTrialExpired(hospital);
  return (
    <AbilityProvider permissions={RolePermission || RData.permission}>
      <AuthProvider initialUser={userData}>

        {trialExpired ? (
          <TrialExpiredScreen />
        ) : (<SidebarProvider>
          <AppSidebar mode={hospital?.metadata?.orgMode} moduleData={modulesDataWithPermissions} />
          <SidebarInset>
            {hospital?.metadata?.is_trial && <TrialNav endDate={hospital?.metadata?.trial_ends_at} />}
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
