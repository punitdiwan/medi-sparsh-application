"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// We'll use the same mock data here (simulate shared state)
let mockServices = [
   { id: "1", name: "General Consultation", category: "Consultation", amount: "500", duration: "15", description: "Basic consultation" },
  { id: "2", name: "X-Ray", category: "Imaging", amount: "1000", duration: "10", description: "Chest X-Ray" },
];

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams();
  const serviceId = params.id as string;

  const [formData, setFormData] = useState<any>(null);

  // Load existing service
  useEffect(() => {
    const service = mockServices.find((s) => s.id === serviceId);
    if (service) setFormData(service);
  }, [serviceId]);

  if (!formData) return <p className="p-6 text-center">Loading...</p>;

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Update mock service
    const index = mockServices.findIndex((s) => s.id === serviceId);
    if (index !== -1) mockServices[index] = formData;

    alert(`Service "${formData.name}" updated successfully!`);
    router.push("/doctor/services");
  };

  return (
    <div className="flex justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <h2 className="text-2xl font-semibold">Edit Service</h2>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Service Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Service Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Consultation">Consultation</SelectItem>
                  <SelectItem value="Lab Test">Lab Test</SelectItem>
                  <SelectItem value="Imaging">Imaging</SelectItem>
                  <SelectItem value="Procedure">Procedure</SelectItem>
                  <SelectItem value="Package">Package</SelectItem>
                  <SelectItem value="followsUp">Follows up</SelectItem>

                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3 p-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/doctor/services")}
            >
              Cancel
            </Button>
            
            <Button type="submit">
             Save Changes</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
