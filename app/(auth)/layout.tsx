import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export default async function AuthLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {

   return (
      <main>
         <div className="h-screen flex flex-col items-center justify-center">
            {children}
         </div>
      </main>
   );
}
