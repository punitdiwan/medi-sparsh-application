"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAbility } from "@/components/providers/AbilityProvider";

export default function HospitalChargesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ability = useAbility();
  const tabs = [
    {
      name: "Charges", href: "/doctor/settings/hospitalCharge", action: "read",
      subject: "hospitalCharge"
    },
    {
      name: "Charges Category", href: "/doctor/settings/hospitalCharge/chargeCategory", action: "read",
      subject: "chargeCategory"
    },
    {
      name: "Charge Type", href: "/doctor/settings/hospitalCharge/chargeType", action: "read",
      subject: "chargeType"
    },
    {
      name: "Tax Category", href: "/doctor/settings/hospitalCharge/taxCategory", action: "read",
      subject: "TaxCategory"
    },
    {
      name: "Unit Type", href: "/doctor/settings/hospitalCharge/ChargesUnit", action: "read",
      subject: "ChargesUnit"
    },
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
        <TabsList className="flex flex-wrap w-full ">
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
