"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAbility } from "@/components/providers/AbilityProvider";

export default function SymptomLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ability = useAbility();

  const tabs = [
    { name: "Symptoms", href: "/doctor/settings/symptom",action: "read",
    subject: "symptoms", },
    { name: "Symptoms Type", href: "/doctor/settings/symptom/SymptomType",action: "read",
    subject: "symptomsType", },

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
