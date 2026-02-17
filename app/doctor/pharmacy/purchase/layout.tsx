"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAbility } from "@/components/providers/AbilityProvider";

export default function StockManagerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const ability = useAbility();

     if (pathname.startsWith("/doctor/pharmacy/purchase/medicine")) {
        return (
            <div className="bg-background text-foreground rounded-md shadow-sm">
                {children}
            </div>
        );
    }
    
    const tabs = [
        {
            name: "Current Stock",
            href: "/doctor/pharmacy/purchase",
            action: "read",
            subject: "pharmacyMedicine",
        },
        {
            name: "Expired Stock",
            href: "/doctor/pharmacy/purchase/expiredStocks",
            action: "read",
            subject: "pharmacyMedicine",
        },
        // {
        //   name: "Return Expired Stock",
        //   href: "/doctor/settings/stockManager/return-expired",
        //   action: "read",
        //   subject: "pharmacyMedicine",
        // },
    ];

    const visibleTabs = tabs.filter((tab) =>
        ability.can(tab.action, tab.subject)
    );

    if (!visibleTabs.length) return null;

    const activeTab =
        visibleTabs.find((tab) => tab.href === pathname)?.href ??
        visibleTabs[0].href;

    return (
        <div className="space-y-4">
            {/* Tabs */}
            <div className="px-6">
                <Tabs value={activeTab} className="w-full">
                    <TabsList className="flex flex-wrap w-full">
                        {visibleTabs.map((tab) => (
                            <TabsTrigger key={tab.href} value={tab.href} asChild>
                                <Link href={tab.href}>{tab.name}</Link>
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            {/* Content */}
            <div className="bg-background text-foreground rounded-md shadow-sm">
                {children}
            </div>
        </div>
    );
}
