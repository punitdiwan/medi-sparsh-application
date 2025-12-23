"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import OperationCategoryManager from "@/Components/doctor/ipd/operations/operationCategory";
import OperationManager from "@/Components/doctor/ipd/operations/operationManager";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function OperationTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>("operation");

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "category" || tabParam === "operation") {
      setActiveTab(tabParam);
    }
    else {
      setActiveTab("operation");
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push(`/doctor/settings/operations?tab=${value}`, { scroll: false });
  };

  return (
    <div className="w-full p-6">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="operation">
            Operation 
          </TabsTrigger>
          <TabsTrigger value="category">
            Operation Category
          </TabsTrigger>
        </TabsList>

        <TabsContent value="operation" className="mt-4">
          <OperationManager/>
        </TabsContent>

        <TabsContent value="category" className="mt-4">
          <OperationCategoryManager/>
        </TabsContent>
      </Tabs>
    </div>
  );
}
