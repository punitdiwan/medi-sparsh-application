"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Command } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";



export function SignInForm({ Hospitaldata }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) throw new Error(error.message);
      const session = await authClient.getSession();
      const sess: any = session.data?.session;
      if (sess?.activeOrganizationId !== Hospitaldata?.hospitalId) {
        await authClient.signOut()
        toast.error("You are not an employee of this organization");
        return;
      }
      router.push("/doctor")
      toast.success("Welcome Doctor")
      // toast.success(`Welcome ${user.role}!`);
    } catch (err: any) {
      console.log("Login failed:", err);
      toast.error(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    localStorage.clear();
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 flex-col justify-center items-center p-10 border-r-2">
        <div className="flex items-center space-x-3 mb-6">
          <Command className="w-10 h-10" />
          <h2 className="text-3xl font-semibold tracking-wide">Medisparsh</h2>
        </div>
        <p className="text-center text-lg leading-relaxed max-w-md opacity-90">
          Streamline your medical workflow — manage patients, prescriptions, and
          reports all in one place.
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex w-full md:w-1/2 justify-center items-center p-10">
        <Card className="w-full max-w-sm rounded-none hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Login to your account</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="m@example.com"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex-col gap-2">
            <Button variant="outline" className="w-full">
              Login with Google
            </Button>

            {/* <p className="text-sm mt-2">
              Don't have an account?{" "}
              <Link href="/sign-up" className="text-blue-600 underline">
                Sign Up
              </Link>
            </p> */}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
