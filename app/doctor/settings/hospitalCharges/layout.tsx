"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function HospitalChargesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { name: "Charges", href: "/doctor/settings/hospitalCharges" },
    { name: "Charges Category", href: "/doctor/settings/hospitalCharges/chargeCategory" },
    { name: "Charge Type", href: "/doctor/settings/hospitalCharges/chargeType" },
    { name: "Tax Category", href: "/doctor/settings/hospitalCharges/taxCategory" },
    { name: "Unit Type", href: "/doctor/settings/hospitalCharges/unitType" },
  ];

  // Determine active tab
  const activeTab = tabs.find((tab) => tab.href === pathname)?.href || tabs[0].href;

  return (
    <div className="p-6 space-y-6">
      {/* Tabs */}
      <Tabs value={activeTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.href} value={tab.href} asChild>
              <Link href={tab.href}>{tab.name}</Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Content */}
      <div className="bg-background text-foreground p-4 rounded-md shadow-sm">
        {children}
      </div>
    </div>
  );
}
