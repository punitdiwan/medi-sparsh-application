
import { SignInForm } from "@/Components/forms/SignInForm";
import SignInSection from "@/components/sign-in-section"
import { getCurrentHospital } from "@/lib/tenant";
import { validateServerSession } from "@/lib/validateSession";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export default async function SignIn() {
   // const session = await validateServerSession();
   const hospital = await getCurrentHospital();

//   if (session?.session?.activeOrganizationId === hospital?.hospitalId) {
//     redirect("/doctor");
//   }
   return (
      <>
         {/* <SignInSection /> */}
         <SignInForm Hospitaldata={hospital}/>
      </>
   )
}
