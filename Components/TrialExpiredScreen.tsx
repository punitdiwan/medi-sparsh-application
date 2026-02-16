"use client";

import { ConfirmDialog } from "@/components/model/ConfirmationModel";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { authClient } from "@/lib/auth-client";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function TrialExpiredScreen() {
    const router = useRouter();
    const { user, logout } = useAuth();
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
        <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-background text-center px-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Trial Expired
            </h1>

            <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
                Your trial period has ended. Please contact the <Link href="https://www.medisparsh.com/" className="text-yellow-400 hover:text-yellow-300">Medisparsh</Link> or upgrade
                your plan to continue using the system.
            </p>

            <div className="text-sm text-gray-500">
                You can’t navigate or perform any actions until the plan is activated.
            </div>
            <div className="flex justify-center items-center mt-4 w-25">
                <ConfirmDialog
                    trigger={
                        <Button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-red-600 hover:text-white/80 dark:hover:text-black hover:bg-black dark:hover:bg-white cursor-pointer">
                            <LogOut className="h-4 w-4" />
                            <span>Logout</span>
                        </Button>
                    }
                    title="Are you sure you want to logout?"
                    description="You’ll be signed out and redirected to login."
                    actionLabel="Logout"
                    cancelLabel="Cancel"
                    onConfirm={handleLogout}
                />
            </div>
        </div>
    );
}
