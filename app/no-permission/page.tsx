"use client";

import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";

const NoPermissionPage = () => {
    const router = useRouter();
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="flex flex-col items-center space-y-4 text-center">
                <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
                    <ShieldAlert className="h-10 w-10 text-red-600 dark:text-red-500" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    Access Denied
                </h1>
                <p className="max-w-[400px] text-gray-500 dark:text-gray-400">
                    You do not have permission to access this page. Please contact your
                    administrator if you believe this is a mistake.
                </p>
                <div className="pt-4">
                        <Button onClick={() => router.back()}>Return to Home</Button>
                </div>
            </div>
        </div>
    );
};

export default NoPermissionPage;
