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
import { Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { CompanyModal, Company } from "./medicineCompanyModal";
import { getMedicineCompanies, createMedicineCompany, updateMedicineCompany, deleteMedicineCompany } from "@/lib/actions/medicineCompanies";
import { useAbility } from "@/components/providers/AbilityProvider";
import { Can } from "@casl/react";
import { ConfirmDialog } from "@/components/model/ConfirmationModel";

export default function CompanyManager() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const ability = useAbility();

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

  const handleDeleteConfirm = async (id: string) => {
    try {
      const result = await deleteMedicineCompany(id);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      setCompanies((prev) => prev.filter((c) => c.id !== id));
      toast.success("Company deleted");
    } catch (error) {
      console.error("Error deleting company:", error);
      toast.error("Failed to delete company");
    }
  };

  return (
    <Card className="shadow-md border border-dialog bg-card/50 backdrop-blur-sm p-0">
      <CardHeader className="px-6 py-4 text-white bg-Module-header rounded-t-xl">
        <div>
          <CardTitle className="text-2xl font-bold">Medicine Company Management</CardTitle>
          <CardDescription className="mt-1 text-indigo-100">
            Manage medicine manufacturing companies.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-5">
        {/* Search + Add */}
        <div className="flex justify-between items-center flex-wrap gap-3">
          <Input
            placeholder="Search company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Can I="create" a="medicineCompany" ability={ability}>
            <Button onClick={() => setOpen(true)}>Add Company</Button>
          </Can>
        </div>

        {/* Table */}
        <div className="border rounded-xl overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead className="w-[100px] text-right">Action</TableHead>
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
                    <TableCell className="text-right space-x-2">
                      <Can I="update" a="medicineCompany" ability={ability}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditing(company);
                            setOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Can>
                      <Can I="delete" a="medicineCompany" ability={ability}>
                        <ConfirmDialog
                          title="Delete Company"
                          description="Are you sure you want to permanently delete this medicine company? This action cannot be undone."
                          onConfirm={() => handleDeleteConfirm(company.id)}
                          trigger={
                            <Button variant="ghost" size="icon">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          }
                        />
                      </Can>
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
    </Card>
  );
}
