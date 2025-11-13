import { redirect } from "next/navigation";
import { validateServerSession } from "@/lib/validateSession";
import { SignInForm } from "@/Components/forms/SignInForm";

export default async function SignInPage() {
  const session = await validateServerSession();

  if (session) {
    redirect("/doctor");
  }

  return (
    <div>
      <SignInForm />
    </div>
  );
}
