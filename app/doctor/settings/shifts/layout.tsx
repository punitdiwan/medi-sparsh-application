"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAbility } from "@/components/providers/AbilityProvider";

export default function AppointmentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ability = useAbility();

  const tabs = [
    { name: "Doctor Shift", href: "/doctor/settings/shifts",action: "read",
    subject: "shifts" },
    { name: "Slots", href: "/doctor/settings/shifts/doctorSlots",action: "read",
    subject: "doctorSlots" },
    { name: "Shift", href: "/doctor/settings/shifts/hospitalShift",action: "read",
    subject: "hospitalShift" },
    { name: "Appointment Priority", href: "/doctor/settings/shifts/appointmentPriority" ,action: "read",
    subject: "appointmentPriority"},
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
        <TabsList className=" w-full flex flex-wrap ">
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
