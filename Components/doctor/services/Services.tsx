"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import AddServicePage from "./AddServicePage";
import { toast } from "sonner";

type ServiceForm = {
  id?: string;
  name: string;
  amount: string;
  description: string;
};

type Service = {
  id: string;
  name: string;
  amount: string;
  description: string;
};

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editService, setEditService] = useState<ServiceForm>();

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/services");
      if (!res.ok) throw new Error();

      const data = await res.json();
      console.log("service data",data);
      setServices(data);
    } catch (err) {
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSave = async (data: ServiceForm) => {
    try {
      const response = await fetch(
        data.id ? `/api/services/${data.id}` : "/api/services",
        {
          method: data.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) throw new Error();

      await fetchServices();
      setOpenModal(false);
      setEditService(undefined);
      toast.success("Service saved successfully!");
    } catch (err) {
      toast.error("Something went wrong!");
    }
  };

  if (loading) return <p className="p-5">Loading...</p>;

  return (
    <div className="p-5">
      <Card className="p-4">
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Our Services</h2>

          <Button variant="outline" onClick={() => {
            setEditService(undefined);
            setOpenModal(true);
          }}>
            <Plus className="mr-2 h-4 w-4" /> Add Service
          </Button>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service Name</TableHead>
                <TableHead>Amount (₹)</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {services.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-gray-500 py-6">
                    No Service Added
                  </TableCell>
                </TableRow>
              ) : (
                services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>{service.name}</TableCell>
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
                ))
              )}
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
          <AddServicePage initialData={editService} onSuccess={handleSave} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
