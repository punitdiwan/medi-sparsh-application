"use client";
import React, { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

import { KbdInputGroup } from "@/features/SearchBar";
import Image from "next/image";
import Link from "next/link";
import ProfileImg from "@/public/palceholderImg.jpg";
import { ModeToggle } from "@/Components/theme-provider/ThemeProviderIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/model/ConfirmationModel";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { FaBed, FaUserDoctor, FaUser } from "react-icons/fa6";
import { FaCrown } from "react-icons/fa6";
export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const roleLabel =
    user?.memberRole === "owner" ? "Admin" : user?.memberRole || "My Profile";

  const roleIcon =
    user?.memberRole === "owner" ? (
      <FaCrown className="inline mr-1" />
    ) : user?.memberRole === "doctor" ? (
      <FaUserDoctor className="inline mr-1" />
    ) : (
      <FaUser className="inline mr-1" />
    );

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      logout();
      router.push("/sign-in");
    } catch (err) {
      console.error("Logout failed:", err);
      toast.error("Failed to logout");
    }
  };

  return (
    <header className="sticky top-0 bg-background z-[9] flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
      </div>

      <div className="flex items-center gap-4 ">
        <div className="hidden md:flex items-center">
          {/* <KbdInputGroup /> */}
          <div className="px-4 cursor-pointer">
            {/* <FaBed /> */}
          </div>
        </div>

        <ModeToggle />
      <div className="pr-3 ">
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger>
            <Image
              src={ProfileImg}
              alt="Profile"
              width={40}
              height={40}
              className="rounded-full"
            />
          </DropdownMenuTrigger>

          <DropdownMenuContent 
            side="top" 
            align="end" 
            className="mt-2 w-40"
          >
            <DropdownMenuLabel className="capitalize flex items-center justify-center ">
              {roleIcon}
              {roleLabel}
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="w-full justify-center text-center" onClick={() => setOpen(false)}>
              <Link
                href="/doctor/settings/profile"
                className="w-full block p-2 text-gray-700 dark:text-gray-300"
              >
                Profile
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem className="w-full justify-center text-center" onClick={() => setOpen(false)}>
              <Link
                href="/doctor/todolist"
                className="w-full block p-2 text-gray-700 dark:text-gray-300"
              >
                Todo list
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild className="w-full justify-center text-center">
              <ConfirmDialog
                trigger={
                  <Button className="w-full text-center font-light p-2 mt-1 rounded-md">
                    Logout
                  </Button>
                }
                title="Are you sure you want to logout?"
                description="You’ll be signed out and redirected to login."
                actionLabel="Logout"
                cancelLabel="Cancel"
                onConfirm={handleLogout}
              />
            </DropdownMenuItem>
          </DropdownMenuContent>

        </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
