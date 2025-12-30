"use client";

import { ReactNode, useRef } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import BackButton from "@/Components/BackButton";

const TAB_ITEMS = [
  { label: "Overview", path: "" },
  { label: "Nurse Notes", path: "nurseNote" },
  { label: "Medication", path: "medication" },
  { label: "Prescription", path: "prescription" },
  { label: "Consultant Register", path: "consultantRegister" },
  // { label: "Lab Investigation", path: "labInvestigation" },
  { label: "Operations", path: "operation" },
  { label: "Charges", path: "charges" },
  { label: "Payments", path: "payments" },
  // { label: "Live Consultation", path: "liveConsultation" },
  { label: "Bed History", path: "bedHistory" },
  { label: "Timeline", path: "timeline" },
  { label: "Treatment History", path: "treatmentHistory" },
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

  const activeTab =
    TAB_ITEMS.find((tab) =>
      tab.path
        ? pathname.endsWith(`/ipd/${tab.path}`)
        : pathname.endsWith("/ipd")
    )?.label || "Overview";
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  return (
    <div 
    className={`transition-all duration-200 overflow-x-auto mx-auto mt-8 ${
       isCollapsed  ? "w-[calc(100vw-100px)]" : "w-[calc(100vw-60px)] md:w-[calc(100vw-310px)]"
      } scrollbar-show`}>
        <BackButton/>
      <h2 className="text-2xl font-semibold mb-2">
        IPD Patient Details
      </h2>

      <Tabs value={activeTab}>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline" onClick={() => scrollTabs("left")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex-1 overflow-hidden">
            <div ref={tabRef} className="overflow-x-auto whitespace-nowrap scrollbar-hide">
              <TabsList className="inline-flex gap-2 min-w-max bg-overview-base px-1 ">
                {TAB_ITEMS.map((tab) => (
                  <TabsTrigger key={tab.label} value={tab.label} asChild className="
                      relative rounded-lg px-4 py-2 text-sm font-medium
                      text-text-muted
                      bg-transparent
                      transition-all duration-200

                      hover:text-over-primary
                      hover:bg-over-primary/10

                      dark:hover:bg-over-primary/20
                      data-[state=active]:text-primary
                      data-[state=active]:border
                      data-[state=active]:border-primary
                      data-[state=active]:bg-transparent

                      dark:data-[state=active]:bg-overview-backgroud
                      dark:data-[state=active]:border
                      dark:data-[state=active]:border-primary
                      dark:data-[state=active]:text-primary

                      data-[state=active]:shadow-sm
                    "
                    >
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
        <Separator/>
        <div className="mt-4">{children}</div>
      </Tabs>
    </div>
  );
}
