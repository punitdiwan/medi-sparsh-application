"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AppointmentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { name: "Medicine", href: "/doctor/settings/medicineRecord" },
    { name: "Medicine Category", href: "/doctor/settings/medicineRecord/medicinCategory" },
    { name: "Company", href: "/doctor/settings/medicineRecord/medicineCompany" },
    { name: "Unit", href: "/doctor/settings/medicineRecord/medicineUnit" },
  ];

  // Determine the active tab based on the current pathname
  const activeTab = tabs.find((tab) => tab.href === pathname)?.href || tabs[0].href;

  return (
    <div className="p-6 space-y-6">
      <Tabs value={activeTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {tabs.map((tab) => (
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
