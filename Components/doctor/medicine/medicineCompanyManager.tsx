"use client";

import React, { useMemo, useState } from "react";
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

import { CompanyModal, Company } from "./medicineCompanyModal";

export default function CompanyManager() {
  const [companies, setCompanies] = useState<Company[]>([
    { id: "cmp1", name: "Cipla" },
    { id: "cmp2", name: "Sun Pharma" },
    { id: "cmp3", name: "Dr. Reddy's" },
  ]);

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return companies;
    const q = search.toLowerCase();
    return companies.filter((c) => c.name.toLowerCase().includes(q));
  }, [search, companies]);

  const handleSave = (item: Company) => {
    setCompanies((prev) => {
      const exists = prev.some((c) => c.id === item.id);
      return exists
        ? prev.map((c) => (c.id === item.id ? item : c))
        : [...prev, item];
    });
    setEditing(null);
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
              {filtered.length === 0 ? (
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
                            onClick={() =>
                              setCompanies((prev) =>
                                prev.filter((c) => c.id !== company.id)
                              )
                            }
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
    </Card>
  );
}
