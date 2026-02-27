"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "@/Components/theme-provider/ThemeProviderIcon";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

import { ConfirmDialog } from "@/components/model/ConfirmationModel";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import {
  User,
  ListTodo,
  KeyRound,
  LogOut,
} from "lucide-react";

import { FaUserDoctor, FaUser } from "react-icons/fa6";
import { FaCrown } from "react-icons/fa6";

import { authClient } from "@/lib/auth-client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

import ProfileImg from "@/public/palceholderImg.jpg";
import ChangePasswordForm from "./forms/ChangePasswordForm";
import { FaBed } from "react-icons/fa";
import { Floor } from "./bedNavbar/bedNavType";
import { BedManagementOverlay } from "./bedNavbar/bedNav";
export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const roleLabel =
    user?.memberRole === "owner"
      ? "Admin"
      : user?.memberRole || "My Profile";

  const roleIcon =
    user?.memberRole === "owner" ? (
      <FaCrown className="w-4 h-4" />
    ) : user?.memberRole === "doctor" ? (
      <FaUserDoctor className="w-4 h-4" />
    ) : (
      <FaUser className="w-4 h-4" />
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
    <header className="sticky top-0 z-[9] flex h-16 items-center justify-between bg-background px-2">

      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4" />
      </div>

      <div className="flex items-center gap-4 pr-3">
        {user?.hospital?.metadata?.orgMode === "hospital" && <div className="p-1.5 bg-secondary rounded-sm hover:bg-secondary/80 cursor-pointer" onClick={() => setOpen(true)}>
          <FaBed size={19} />

        </div>}
        {user?.hospital?.metadata?.orgMode === "hospital" && <BedManagementOverlay
          open={open}
          onClose={() => setOpen(false)}
        />}

        <ModeToggle />

        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full focus:outline-none">
              <Image
                src={ProfileImg}
                alt="Profile"
                width={40}
                height={40}
                className="rounded-full border"
              />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="bottom"
            align="end"
            className="w-56 rounded-xl p-2"
          >

            <DropdownMenuLabel className="flex items-center justify-center gap-2 text-sm font-medium capitalize">
              {roleIcon}
              {roleLabel}
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link
                href="/doctor/settings/profile"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted cursor-pointer"
                onClick={() => setMenuOpen(false)}
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href="/doctor/todolist"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted cursor-pointer"
                onClick={() => setMenuOpen(false)}
              >
                <ListTodo className="h-4 w-4" />
                <span>Todo List</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => {
                setMenuOpen(false);
                setShowPasswordModal(true);
              }}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted cursor-pointer"
            >
              <KeyRound className="h-4 w-4" />
              <span>Change Password</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* LOGOUT */}
            <DropdownMenuItem asChild>
              <ConfirmDialog
                trigger={
                  <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-red-600 hover:text-white/80 dark:hover:text-black hover:bg-black dark:hover:bg-white cursor-pointer">
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
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

      {/* CHANGE PASSWORD MODAL */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent
          className="max-w-md p-0"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <VisuallyHidden>
            <DialogTitle>Change Password</DialogTitle>
          </VisuallyHidden>

          <ChangePasswordForm
            open={showPasswordModal}
            onClose={() => setShowPasswordModal(false)}
            onSubmit={async (values) => {
              try {
                const res = await authClient.changePassword({
                  currentPassword: values.currentPassword,
                  newPassword: values.newPassword,
                });

                if (res?.data) {
                  toast.success("Password changed successfully!");
                  setShowPasswordModal(false);
                  return true;
                } else {
                  toast.error(
                    res?.error?.message || "Failed to change password"
                  );
                  return false;
                }
              } catch (err: any) {
                toast.error(err.message || "Something went wrong");
                console.error(err);
                return false;
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </header>
  );
}
