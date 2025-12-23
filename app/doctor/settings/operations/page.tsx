"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import OperationCategoryManager from "@/Components/doctor/ipd/operations/operationCategory";
import OperationManager from "@/Components/doctor/ipd/operations/operationManager";


export default function OperationTabs() {
  return (
    <div className="w-full p-6">
      <Tabs defaultValue="category" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="category">
            Operation 
          </TabsTrigger>
          <TabsTrigger value="operation">
            Operation Category
          </TabsTrigger>
        </TabsList>

        <TabsContent value="category" className="mt-4">
          <OperationManager/>
        </TabsContent>

        <TabsContent value="operation" className="mt-4">
          <OperationCategoryManager/>
        </TabsContent>
      </Tabs>
    </div>
  );
}
