"use client";

import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAbility } from "@/components/providers/AbilityProvider";

export default function PathologySettingsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const ability = useAbility();

    const tabs = [
        {
            name: "Pathology Category",
            href: "/doctor/settings/pathology",
            action: "read",
            subject: "pathologyCategory",
        },
        {
            name: "Unit",
            href: "/doctor/settings/pathology/pathologyunit",
            action: "read",
            subject: "pathologyunit",
        },
    ];

    const visibleTabs = tabs.filter((tab) =>
        ability?.can(tab.action, tab.subject)
    );

    if (!visibleTabs.length) return null;

    const activeTab =
        visibleTabs.sort((a, b) => b.href.length - a.href.length).find((tab) => pathname.startsWith(tab.href))?.href ??
        visibleTabs[0].href;

    return (
        <div className="p-6 space-y-6">
            <Tabs value={activeTab} onValueChange={(value) => router.push(value)} className="w-full">
                <TabsList className="flex w-full">
                    {visibleTabs.map((tab) => (
                        <TabsTrigger key={tab.href} value={tab.href}>
                            {tab.name}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            <div className="bg-background text-foreground rounded-md shadow-sm ">
                {children}
            </div>
        </div>
    );
}
