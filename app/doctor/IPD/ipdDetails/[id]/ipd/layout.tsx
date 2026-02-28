"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, PlusCircle } from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import BackButton from "@/Components/BackButton";
import { getIPDAdmissionDetails } from "@/lib/actions/ipdActions";
import { DischargeProvider } from "@/Components/doctor/ipd/DischargeContext";

const TAB_ITEMS = [
  { label: "Overview", path: "" },
  // { label: "Nurse Notes", path: "nurseNote" },
  { label: "Vitals", path: "vitals" },
  { label: "Medication", path: "medication" },
  { label: "Prescription", path: "prescription" },
  { label: "Consultant Register", path: "consultantRegister" },
  // { label: "Lab Investigation", path: "labInvestigation" },
  { label: "Operations", path: "operation" },
  { label: "Charges", path: "charges" },
  // { label: "Payments", path: "payments" },
  { label: "Timeline", path: "timeline" },
  // { label: "Live Consultation", path: "liveConsultation" },
  { label: "Bed History", path: "bedHistory" },
  { label: "Treatment History", path: "treatmentHistory" },

];

export default function IPDLayout({ children }: { children: ReactNode }) {
  const tabRef = useRef<HTMLDivElement>(null);
  const { id } = useParams();
  const pathname = usePathname();
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const result = await getIPDAdmissionDetails(id as string);
        if (result.data) {
          setData(result.data);
        }
      }
    };
    fetchData();
  }, [id]);
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
    <DischargeProvider dischargeStatus={data?.dischargeStatus || "pending"}>
      <div
        className={`transition-all duration-200 overflow-x-auto mx-auto mt-8 ${isCollapsed ? "w-[calc(100vw-100px)]" : "w-[calc(100vw-60px)] md:w-[calc(100vw-310px)]"
          } scrollbar-show`}>
        <BackButton />
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-semibold">
            IPD Patient {data ? `- ${data.patientName}` : ""}
          </h2>
          <Button variant="default" asChild className="bg-dialog-primary text-dialog-btn hover:bg-btn-hover hover:opacity-90 border-primary">
            <Link href={`/doctor/IPD/ipdDetails/${id}/ipd/payments`}>
             <PlusCircle className="h-5 w-5" /> Payments
            </Link>
          </Button>
        </div>

        <Tabs value={activeTab}>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="outline" onClick={() => scrollTabs("left")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex-1 overflow-hidden">
              <div ref={tabRef} className="overflow-x-auto whitespace-nowrap scrollbar-hide">
                <TabsList className="inline-flex gap-2  bg-overview-base px-1 ">
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
          <Separator />
          <div className="mt-4">{children}</div>
        </Tabs>
      </div>
    </DischargeProvider>
  );
}
