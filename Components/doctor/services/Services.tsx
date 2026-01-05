"use client";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Plus, Pencil, Stethoscope } from "lucide-react";
import AddServicePage from "./AddServicePage";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { PaginationControl } from "@/components/pagination";
import { Can } from "@casl/react";
import { useAbility } from "@/components/providers/AbilityProvider";

type ServiceForm = {
  id?: string;
  name: string;
  amount: string;
  description: string;
  isDeleted: boolean;
};

type Service = {
  id: string;
  name: string;
  amount: string;
  description: string;
  isDeleted: boolean;
};

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editService, setEditService] = useState<ServiceForm>();

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const ability = useAbility();
  const fetchServices = async () => {
    try {
      const res = await fetch("/api/services");
      if (!res.ok) throw new Error();

      const data = await res.json();
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

  const handleDelete = async (data: ServiceForm) => {
    const updatedData = { ...data, isDeleted: !data.isDeleted };
    try {
      const response = await fetch(`/api/services/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error();

      await fetchServices();
      toast.success("Service updated successfully!");
    } catch (err) {
      toast.error("Failed to update service!");
    }
  };

  const totalPages = Math.ceil(services.length / rowsPerPage);

  const paginatedServices = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return services.slice(start, end);
  }, [services, currentPage, rowsPerPage]);

  if (loading) return <p className="p-5">Loading...</p>;

  return (
    <div className="p-5">
      <Card className="bg-Module-header text-white shadow-lg mb-4">
        <CardHeader className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Stethoscope className="h-7 w-7" />
              Our Services
            </CardTitle>
            <p className="text-sm text-indigo-100 mt-1">
              Manage and maintain your services list
            </p>
          </div>

          <Can I="create" a="services" ability={ability}>
            <Button
              variant="default"
              className="bg-white text-indigo-700 hover:bg-indigo-50"
              onClick={() => {
                setEditService(undefined);
                setOpenModal(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Service
            </Button>
          </Can>
        </CardHeader>

        <CardContent>
          
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service Name</TableHead>
                <TableHead>Amount (₹)</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedServices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-6">
                    No Service Added
                  </TableCell>
                </TableRow>
              ) : (
                paginatedServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>{service.name}</TableCell>
                    <TableCell>{service.amount}₹</TableCell>
                    <TableCell>{service.description}</TableCell>
                    <TableCell>
                      {service.isDeleted ? <span className="text-red-500">Inactive</span> : <span className="text-green-600">Active</span>}
                    </TableCell>
                    
                    <TableCell className="flex gap-3 items-center">
                      <Can I="update" a="services" ability={ability}>
                      <Pencil
                        className="h-4 w-4 cursor-pointer"
                        onClick={() => { setEditService(service); setOpenModal(true); }}
                      />
                      <Switch
                        checked={!service.isDeleted}
                        onCheckedChange={() => handleDelete(service)}
                      />
                      </Can>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {(
        <div className="flex justify-center">
          <PaginationControl
            currentPage={currentPage}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={(val) => {
              setRowsPerPage(val);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-lg"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{editService ? "Edit Service" : "Add New Service"}</DialogTitle>
          </DialogHeader>
          <AddServicePage initialData={editService} onSuccess={handleSave} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
