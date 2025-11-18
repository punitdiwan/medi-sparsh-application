"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AddServicePageProps {
  initialData?: {
    id?: string;
    name: string;
    // category: string;
    amount: string;
    description: string;
  };
  onSuccess: (data: any) => void;
}
interface ServiceForm {
  id?: string;
  name: string;
  // category: string;
  amount: string;
  description: string;
}
export default function AddServicePage({ initialData, onSuccess }: AddServicePageProps) {
  const [service, setService] = useState<ServiceForm>({
  id: undefined,
  name: "",
  // category: "",
  amount: "",
  description: "",
});


  useEffect(() => {
    if (initialData) {
      setService(initialData);
    }
  }, [initialData]);

  const handleChange = (field: string, value: string) => {
    setService((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess(service);
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">
          {service.id ? "Edit Service" : "Add Service"}
        </h2>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">

          <div>
            <Label>Service Name</Label>
            <Input
              value={service.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>

          {/* <div>
            <Label>Category</Label>
            <Input
              value={service.category}
              onChange={(e) => handleChange("category", e.target.value)}
              required
            />
          </div> */}

          <div>
            <Label>Amount (₹)</Label>
            <Input
              type="number"
              value={service.amount}
              onChange={(e) => handleChange("amount", e.target.value)}
              required
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={service.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-3">
          <Button type="submit">
            {service.id ? "Update" : "Save"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
