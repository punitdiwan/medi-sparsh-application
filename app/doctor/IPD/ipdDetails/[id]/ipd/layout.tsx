"use client";

import { ReactNode, useRef } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";

const TAB_ITEMS = [
  { label: "Overview", path: "" },
  { label: "Nurse Notes", path: "nurseNote" },
  { label: "Medication", path: "medication" },
  { label: "Prescription", path: "prescription" },
  { label: "Consultant Register", path: "consultant-register" },
  { label: "Lab Investigation", path: "lab-investigation" },
  { label: "Operations", path: "operations" },
  { label: "Charges", path: "charges" },
  { label: "Payments", path: "payments" },
  { label: "Live Consultation", path: "live-consultation" },
  { label: "Bed History", path: "bed-history" },
  { label: "Timeline", path: "timeline" },
  { label: "Treatment History", path: "treatment-history" },
  { label: "Vitals", path: "vitals" },
];

export default function IPDLayout({ children }: { children: ReactNode }) {
  const tabRef = useRef<HTMLDivElement>(null);
  const { id } = useParams();
  const pathname = usePathname();

  const scrollTabs = (dir: "left" | "right") => {
    tabRef.current?.scrollBy({
      left: dir === "left" ? -200 : 200,
      behavior: "smooth",
    });
  };

  // 🔑 Active tab detection from URL
  const activeTab =
    TAB_ITEMS.find((tab) =>
      tab.path
        ? pathname.endsWith(`/ipd/${tab.path}`)
        : pathname.endsWith("/ipd")
    )?.label || "Overview";

  return (
    <div className="p-6 space-y-4 max-w-[95%]">
      <h2 className="text-2xl font-semibold">
        IPD Patient Details – {id}
      </h2>

      <Tabs value={activeTab}>
        {/* TAB HEADER */}
        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline" onClick={() => scrollTabs("left")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex-1 overflow-hidden">
            <div ref={tabRef} className="overflow-x-auto whitespace-nowrap scrollbar-hide">
              <TabsList className="inline-flex gap-2 min-w-max bg-transparent px-1">
                {TAB_ITEMS.map((tab) => (
                  <TabsTrigger key={tab.label} value={tab.label} asChild>
                    <Link
                      href={`/doctor/IPD/ipdDetails/${id}/ipd/${tab.path}`}
                    >
                      {tab.label}
                    </Link>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>

          <Button size="icon" variant="outline" onClick={() => scrollTabs("right")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* PAGE CONTENT */}
        <div className="mt-4">{children}</div>
      </Tabs>
    </div>
  );
}
