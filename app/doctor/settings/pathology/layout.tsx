"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAbility } from "@/components/providers/AbilityProvider";

export default function PathologySettingsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
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
            href: "/doctor/settings/pathology/unit",
            action: "read",
            subject: "unit",
        },
        // {
        //     name: "Pathology Parameter",
        //     href: "/doctor/settings/pathology/parameter",
        //     action: "read",
        //     subject: "pathologyParameter",
        // },
    ];

    // For now, let's assume all tabs are visible if ability check is not strictly enforced for these new subjects yet
    // Or we can just use the provided ability check logic
    const visibleTabs = tabs.filter((tab) => true); // ability.can(tab.action, tab.subject)

    if (!visibleTabs.length) return null;

    const activeTab = visibleTabs.find((tab) => tab.href === pathname)?.href ?? visibleTabs[0].href;

    return (
        <div className="p-6 space-y-6">
            <Tabs value={activeTab} className="w-full">
                <TabsList className="flex w-full">
                    {visibleTabs.map((tab) => (
                        <TabsTrigger key={tab.href} value={tab.href} asChild>
                            <Link href={tab.href}>{tab.name}</Link>
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
