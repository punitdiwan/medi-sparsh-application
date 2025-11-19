import { redirect } from "next/navigation";
import { validateServerSession } from "@/lib/validateSession";
import { SignInForm } from "@/Components/forms/SignInForm";
import { getCurrentHospital } from "@/lib/tenant";
export const dynamic = "force-dynamic";
export default async function SignInPage() {
  const session = await validateServerSession();
  const hospital = await getCurrentHospital();

  if (session?.session?.activeOrganizationId === hospital?.hospitalId) {
    redirect("/doctor");
  }
  return (
    <div>
      <SignInForm Hospitaldata={hospital}/>
    </div>
  );
}
