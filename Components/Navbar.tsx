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

export default function Header() {
  const router = useRouter();
  const {logout}= useAuth();
  const [open, setOpen] = useState(false);
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
    <header className="sticky top-0 bg-background z-[999] flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
      </div>

      <div className="flex items-center gap-2 px-4">
        <div className="hidden md:flex">
          <KbdInputGroup />
        </div>

        <ModeToggle />

        <div>
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
            <DropdownMenuContent>
              <DropdownMenuLabel>My profile</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Normal items close dropdown on click */}
              <DropdownMenuItem>
                <div onClick={() => setOpen(false)}>
                  <Link
                    href="/doctor/settings/profile"
                    className="block p-2 items-center text-gray-700 dark:text-gray-300"
                  >
                    Profile
                  </Link>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem >
                <div onClick={() => setOpen(false)}>
                  <Link
                    href="/doctor/billing"
                    className="block p-2 items-center text-gray-700 dark:text-gray-300"
                  >
                    Payment History
                  </Link>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem>
                <div onClick={() => setOpen(false)}>
                  <Link
                    href="/doctor/todolist"
                    className="block p-2 items-center text-gray-700 dark:text-gray-300"
                  >
                    Todo list
                  </Link>
                </div>
              </DropdownMenuItem>

              {/* asChild item stays open because we do NOT call setOpen(false) */}
              <DropdownMenuItem asChild>
                <ConfirmDialog
                  trigger={
                    <Button className="w-full text-left font-light p-2 items-center rounded-md text-white dark:text-black hover:bg-white/80 hover:text-white transition-colors cursor-pointer">
                      Logout
                    </Button>
                  }
                  title="Are you sure you want to logout?"
                  description="You’ll be signed out of your account and redirected to the login page."
                  actionLabel="Logout"
                  cancelLabel="Cancel"
                  onConfirm={handleLogout}
                  onCancel={() => console.log("Logout cancelled")}
                />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
