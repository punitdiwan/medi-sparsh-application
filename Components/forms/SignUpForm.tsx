"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Command } from "lucide-react";

function SignUpForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      alert("Please fill in all fields.");
      return;
    }

    try {

      setFormData({ name: "", email: "", password: "" });
    } catch (error) {
      console.error("Signup error:", error);
      alert("Something went wrong. Try again.");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side: Branding */}
      <div className="hidden md:flex w-1/2 flex-col justify-center items-center p-10 border-r-2 ">
        <div className="flex items-center space-x-3 mb-6">
          <Command className="w-10 h-10" />
          <h2 className="text-3xl font-semibold tracking-wide">Medisparsh</h2>
        </div>
        <p className="text-center text-lg leading-relaxed max-w-md opacity-90">
          Streamline your medical workflow with ease — manage patients,
          prescriptions, and reports all in one place.
        </p>
      </div>

      {/* Right Side: Sign Up Form */}
      <div className="flex w-full md:w-1/2 justify-center items-center p-10 ">
        <Card className="w-full max-w-sm rounded-none hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                {/* Name */}
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Email */}
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Password */}
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Submit Button inside form to trigger onSubmit */}
                <Button type="submit" className="w-full mt-2">
                  Create Account
                </Button>
              </div>
            </form>
          </CardContent>

          <CardFooter className="flex-col gap-2">
            {/* Optional: Sign Up with Google */}
            <Button variant="outline" className="w-full">
              Sign Up with Google
            </Button>

            {/* Already have an account? */}
            <CardAction className="flex items-center gap-2">
              <p className="p-1 text-sm">Already have an account?</p>
              <Button variant="link" asChild>
                <Link href="/sign-in">Login</Link>
              </Button>
            </CardAction>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
export default SignUpForm;