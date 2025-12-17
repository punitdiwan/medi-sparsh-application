"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAbility } from "@/components/providers/AbilityProvider";
import { Can } from "@casl/react";

export default function BedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ability = useAbility();

  const tabs = [
    { name: "Bed", href: "/doctor/settings/Bed" },
    { name: "Bed Status", href: "/doctor/settings/Bed/BedStatus" },
    { name: "Bed Group", href: "/doctor/settings/Bed/BedGroup" },
    { name: "Bed Type", href: "/doctor/settings/Bed/BedType" },
    { name: "Floor", href: "/doctor/settings/Bed/Floor" },

  ];

  // Determine active tab
  const activeTab = tabs.find((tab) => tab.href === pathname)?.href || tabs[0].href;

  return (
    <div className="p-6 space-y-6">
      {/* Tabs */}
      <Tabs value={activeTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {tabs.map((tab) => (
            // <Can I ="read" a={tab.name} ability={ability}  >
              <TabsTrigger key={tab.href} value={tab.href} asChild>
                <Link href={tab.href}>{tab.name}</Link>
              </TabsTrigger>
            // </Can>
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
