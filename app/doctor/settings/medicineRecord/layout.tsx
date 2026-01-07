"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAbility } from "@/components/providers/AbilityProvider";

export default function AppointmentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ability = useAbility();
  const tabs = [
    {
      name: "Medicine", href: "/doctor/settings/medicineRecord", action: "read",
      subject: "medicineRedord"
    },
    {
      name: "Medicine Category", href: "/doctor/settings/medicineRecord/medicinCategory", action: "read",
      subject: "medicineCategory"
    },
    {
      name: "Supplier", href: "/doctor/settings/medicineRecord/supplierManager", action: "read",
      subject: "medicineSupplier"
    },
    {
      name: "Company", href: "/doctor/settings/medicineRecord/medicineCompany", action: "read",
      subject: "medicineCompany"
    },
    {
      name: "Unit", href: "/doctor/settings/medicineRecord/medicineUnit", action: "read",
      subject: "medicineUnit"
    },
    {
      name: "Medicine Group", href: "/doctor/settings/medicineRecord/medicineGroup", action: "read",
      subject: "medicineGroup"
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
      <Tabs value={activeTab} className="w-full">
        <TabsList className="w-full flex flex-wrap mb-4">
          {visibleTabs.map((tab) => (
            <TabsTrigger key={tab.href} value={tab.href} asChild>
              <Link href={tab.href}>{tab.name}</Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="bg-background text-foreground">
        {children}
      </div>
    </div>
  );
}
