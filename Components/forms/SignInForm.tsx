"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
import { Command, Eye, EyeOff, Mail } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";



export function SignInForm({ Hospitaldata }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle form submission for email/password login
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
      toast.error(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    localStorage.clear();

    // Handle OAuth callback errors
    const error = searchParams.get("error");
    const message = searchParams.get("message");

    if (error) {
      switch (error) {
        case "hospital_not_found":
          toast.error("Hospital not found. Please check the URL.");
          break;
        case "authentication_failed":
          toast.error("Authentication failed. Please try again.");
          break;
        case "not_member":
          toast.error(message || "You are not registered with any hospital. Please contact your administrator.");
          break;
        case "wrong_organization":
          toast.error(message || `You are not an employee of ${Hospitaldata?.name || "this organization"}.`);
          break;
        case "callback_failed":
          toast.error(message || "Authentication failed. Please try again.");
          break;
        default:
          toast.error("An error occurred during sign-in.");
      }

      // Clean up URL parameters
      router.replace("/sign-in");
    }
  }, [searchParams, router, Hospitaldata]);

  // Handle Google social login
  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      const response = await authClient.signIn.social({
        provider: "google",
        callbackURL: `/doctor`,
      });
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      toast.error(error.message || "Failed to sign in with Google");
    } finally {
      setIsLoading(false);
    }
  };


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
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="m@example.com"
                    required
                  />
                  <div className="absolute right-0 top-0 h-full px-3 py-2 flex items-center justify-center pointer-events-none">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex-col gap-2" >
            <Button type="button" variant="outline"
              className="relative w-full cursor-pointer"
              onClick={signInWithGoogle}>
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
