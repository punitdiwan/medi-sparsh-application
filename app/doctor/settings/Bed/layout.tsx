"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAbility } from "@/components/providers/AbilityProvider";

export default function BedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ability = useAbility();

  const tabs = [
    { name: "Bed", href: "/doctor/settings/Bed",action: "read",
    subject: "bed", },
    { name: "Bed Status", href: "/doctor/settings/Bed/BedStatus",action: "read",
    subject: "bedStatus", },
    { name: "Bed Group", href: "/doctor/settings/Bed/BedGroup",action: "read",
    subject: "BedGroup", },
    { name: "Bed Type", href: "/doctor/settings/Bed/BedType",action: "read",
    subject: "bedType", },
    { name: "Floor", href: "/doctor/settings/Bed/Floor",action: "read",
    subject: "floor", },

  ];

   const visibleTabs = tabs.filter((tab) =>
    ability.can(tab.action, tab.subject)
  );

  if (!visibleTabs.length) return null;

  const activeTab = visibleTabs.find((tab) => tab.href === pathname)?.href ??
    visibleTabs[0].href;

  return (
    <div className="p-6 space-y-6">
      {/* Tabs */}
      <Tabs value={activeTab} className="w-full">
        <TabsList className="flex w-full">
          {visibleTabs.map((tab) => (
              <TabsTrigger key={tab.href} value={tab.href} asChild>
                <Link href={tab.href}>{tab.name}</Link>
              </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Content */}
      <div className="bg-background text-foreground rounded-md shadow-sm">
        {children}
      </div>
    </div>
  );
}
