"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function HospitalChargesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menu = [
    { name: "Charges", href: "/doctor/settings/hospitalCharges"},
    { name: "Charges Category", href: "/doctor/settings/hospitalCharges/chargeCategory" },
    { name: "Charge Type", href: "/doctor/settings/hospitalCharges/chargeType" },
    { name: "Tax Category", href: "/doctor/settings/hospitalCharges/taxCategory" },
    { name: "Unit Type", href: "/doctor/settings/hospitalCharges/unitType" },
  ];

  const currentChild = menu.find((item) => pathname === item.href);
  const subHeading = currentChild ? currentChild.name : "";

  return (
    <div className="flex items-start p-2">
      <Card
        className="w-62 rounded shadow"
        style={{ backgroundColor: "var(--sidebar)", color: "var(--sidebar-foreground)" }}
      >
        <CardContent className="p-0">
          <ScrollArea className="h-full p-2">
            <div className="space-y-2">
              {menu.map((item) => {
                return (
                  <Button
                    key={item.href}
                    asChild
                    variant="ghost"
                    className={cn(
                      "w-full justify-start rounded-xl text-left font-medium transition-colors duration-150",
                      "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]"
                    )}
                  >
                    <Link href={item.href}>{item.name}</Link>
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="flex-1 p-6 bg-background text-foreground">
        {subHeading && (
          <h2 className="text-2xl font-semibold mb-4 border-b border-border pb-2">
            {subHeading}
          </h2>
        )}

        {children}
      </div>
    </div>
  );
}
