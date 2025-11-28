"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { toast } from "sonner";

import { CompanyModal, Company } from "./medicineCompanyModal";
import { getMedicineCompanies, createMedicineCompany, updateMedicineCompany, deleteMedicineCompany } from "@/lib/actions/medicineCompanies";

export default function CompanyManager() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const result = await getMedicineCompanies();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setCompanies(result.data || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast.error("Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return companies;
    const q = search.toLowerCase();
    return companies.filter((c) => c.name.toLowerCase().includes(q));
  }, [search, companies]);

  const handleSave = async (item: Company) => {
    try {
      const exists = companies.some((c) => c.id === item.id);

      let result;
      if (exists) {
        // Update existing company
        result = await updateMedicineCompany(item.id, {
          name: item.name,
        });
      } else {
        // Create new company
        result = await createMedicineCompany({
          name: item.name,
        });
      }

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(exists ? "Company updated" : "Company added");
      fetchCompanies();
      setEditing(null);
    } catch (error) {
      console.error("Error saving company:", error);
      toast.error("Failed to save company");
    }
  };

  const handleDeleteClick = (id: string) => {
    setCompanyToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!companyToDelete) return;

    try {
      const result = await deleteMedicineCompany(companyToDelete);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      setCompanies((prev) => prev.filter((c) => c.id !== companyToDelete));
      toast.success("Company deleted");
    } catch (error) {
      console.error("Error deleting company:", error);
      toast.error("Failed to delete company");
    } finally {
      setDeleteDialogOpen(false);
      setCompanyToDelete(null);
    }
  };

  return (
    <Card className="p-4 shadow-sm">
      <CardHeader>
        <CardTitle>Companies</CardTitle>
        <CardDescription>Manage all medicine companies.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">

        {/* Search + Add */}
        <div className="flex justify-between items-center flex-wrap gap-3">
          <Input
            placeholder="Search company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />

          <Button onClick={() => setOpen(true)}>Add Company</Button>
        </div>

        {/* Table */}
        <div className="border rounded-xl overflow-hidden bg-card">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead className="w-[60px] text-center">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="text-center py-6 text-muted-foreground"
                  >
                    Loading companies...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="text-center py-6 text-muted-foreground"
                  >
                    No companies found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>{company.name}</TableCell>

                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditing(company);
                              setOpen(true);
                            }}
                          >
                            Edit
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteClick(company.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Modal */}
      <CompanyModal
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setEditing(null);
        }}
        company={editing ?? undefined}
        onSave={handleSave}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the medicine company.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
