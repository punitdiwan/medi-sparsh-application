"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Plus, Pencil, Trash2 } from "lucide-react";
import AddServicePage from "./AddServicePage";
import { toast } from "sonner";

const initialServices = [
  {
    id: "1",
    name: "General Consultation",
    category: "Consultation",
    amount: "500",
    description: "Basic consultation",
  },
  {
    id: "2",
    name: "X-Ray",
    category: "Imaging",
    amount: "1000",
    description: "Chest X-Ray",
  },
  {
    id: "3",
    name: "Follow Up",
    category: "FollowUp",
    amount: "300",
    description: "Follow-up session",
  },
];

// 📌 Type for service
type ServiceForm = {
  id?: string;  
  name: string;
  // category: string;
  amount: string;
  description: string;
};

type Service = {
  id: string;   
  name: string;
  // category: string;
  amount: string;
  description: string;
};


export default function Services() {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [openModal, setOpenModal] = useState(false);
  const [editService, setEditService] = useState<ServiceForm | undefined>(undefined);

  const handleSave = async (data: ServiceForm) => {
    try {
      let response;

      if (data.id) {
        // ---- Update API ----
        response = await fetch("/api/services/" + data.id, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

      } else {
        // ---- Create API ----
        response = await fetch("/api/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }

      if (!response.ok) throw new Error("Failed to save service");

      const savedService: Service = await response.json();

      // ---- Update local state ----
      if (data.id) {
        setServices(prev =>
          prev.map(s => (s.id === savedService.id ? savedService : s))
        );
      } else {
        setServices(prev => [...prev, savedService]);
      }

      setOpenModal(false);
      setEditService(undefined);
      toast.success("Service saved successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    }
  };



  return (
    <div className="p-5">
      <Card className="p-4">
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Our Services</h2>

          <Button
            variant="outline"
            onClick={() => {
              setEditService(undefined); // <-- FIXED
              setOpenModal(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Service
          </Button>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service Name</TableHead>
                {/* <TableHead>Category</TableHead> */}
                <TableHead>Amount (₹)</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>{service.name}</TableCell>
                  {/* <TableCell>{service.category}</TableCell> */}
                  <TableCell>{service.amount}</TableCell>

                  <TableCell className="flex gap-3">
                    <Pencil
                      className="h-4 w-4 cursor-pointer"
                      onClick={() => {
                        setEditService(service);
                        setOpenModal(true);
                      }}
                    />

                    <Trash2 className="h-4 w-4 cursor-pointer text-red-500" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editService ? "Edit Service" : "Add New Service"}
            </DialogTitle>
          </DialogHeader>

          <AddServicePage
            initialData={editService} // now valid: undefined | service
            onSuccess={handleSave}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
