"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AddServicePageProps {
  initialData?: {
    isDeleted: boolean;
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
  isDeleted: boolean;
}
export default function AddServicePage({
  initialData,
  onSuccess,
}: AddServicePageProps) {
  const [service, setService] = useState<ServiceForm>({
    id: undefined,
    name: "",
    amount: "",
    description: "",
    isDeleted: false,
  });

  useEffect(() => {
    if (initialData) {
      setService({
        ...initialData,
        isDeleted: initialData.isDeleted ?? false,
      });
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
    <form onSubmit={handleSubmit} className="space-y-4 mt-4 px-6 pb-6">
      <div className="flex flex-col gap-1">
        <Label>Service Name</Label>
        <Input
          value={service.name}
          onChange={(e) => handleChange("name", e.target.value)}
          required
          placeholder="e.g., General Consultation"
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label>Amount (₹)</Label>
        <Input
          type="number"
          value={service.amount}
          onChange={(e) => handleChange("amount", e.target.value)}
          required
          placeholder="e.g., 500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label>Description</Label>
        <Textarea
          value={service.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Short description about this service..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="submit"
          className="bg-dialog-primary text-dialog-btn hover:bg-btn-hover flex items-center gap-2">
          {service.id ? "Update" : "Save"}
        </Button>
      </div>
    </form>
  );
}
