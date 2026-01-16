"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { PlusCircle, Eye, Pencil, Trash2, Printer, Receipt, MoreVertical } from "lucide-react";
import AddIPDChargesFullScreen from "./IPDChargesModel";
import { getIPDCharges, deleteIPDCharge } from "@/lib/actions/ipdActions";
import { DeleteConfirmationDialog } from "../../medicine/deleteConfirmationDialog";
import { format } from "date-fns";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { Table } from "@/components/Table/Table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PaginationControl } from "@/components/pagination";
import { useDischarge } from "../DischargeContext";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
interface ChargeRecord {
  id: string;
  chargeName: string | null;
  chargeType: string | null;
  chargeCategory: string | null;
  qty: number;
  standardCharge: string;
  totalAmount: string;
  discountPercent: string;
  taxPercent: string;
  note: string | null;
  createdAt: Date;
}

export default function IPDChargesManagerPage() {
  const { isDischarged } = useDischarge();
  const params = useParams();
  const ipdAdmissionId = params?.id as string;
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [charges, setCharges] = useState<ChargeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedCharge, setSelectedCharge] = useState<ChargeRecord | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chargeToDelete, setChargeToDelete] = useState<string | null>(null);
  const [openDateFilter, setOpenDateFilter] = useState(false);

  useEffect(() => {
    const fetchCharges = async () => {
      if (!ipdAdmissionId) return;

      setLoading(true);
      try {
        const result = await getIPDCharges(ipdAdmissionId);
        if (result.error) {
          toast.error(result.error);
        } else if (result.data) {
          setCharges(result.data as ChargeRecord[]);
        }
      } catch (error) {
        console.error("Error fetching IPD charges:", error);
        toast.error("Failed to fetch charges");
      } finally {
        setLoading(false);
      }
    };

    fetchCharges();
  }, [ipdAdmissionId]);

  // Filter charges based on search term
  const filtered = useMemo(() => {
    return charges.filter((c) => {
      const term = search.toLowerCase();
      const matchesSearch =
        !search ||
        c.id.toLowerCase().includes(term) ||
        c.chargeName?.toLowerCase().includes(term) ||
        c.chargeType?.toLowerCase().includes(term) ||
        c.chargeCategory?.toLowerCase().includes(term);

      const createdDate = new Date(c.createdAt);
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;

      if (to) to.setHours(23, 59, 59, 999);

      const matchesDate =
        (!from || createdDate >= from) &&
        (!to || createdDate <= to);

      return matchesSearch && matchesDate;
    });
  }, [charges, search, fromDate, toDate]);

  const totalNetAmount = useMemo(() => {
    return filtered.reduce((sum, row) => {
      const total = Number(row.totalAmount || 0);
      const discount = Number(row.discountPercent || 0);
      const tax = Number(row.taxPercent || 0);

      const discountAmount = (total * discount) / 100;
      const taxAmount = ((total - discountAmount) * tax) / 100;
      const net = total - discountAmount + taxAmount;

      return sum + net;
    }, 0);
  }, [filtered]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filtered.slice(start, end);
  }, [filtered, currentPage, rowsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, fromDate, toDate, rowsPerPage]);


  const handleRefresh = async () => {
    if (!ipdAdmissionId) return;

    setLoading(true);
    try {
      const result = await getIPDCharges(ipdAdmissionId);
      if (result.error) {
        toast.error(result.error);
      } else if (result.data) {
        setCharges(result.data as ChargeRecord[]);
      }
    } catch (error) {
      console.error("Error fetching IPD charges:", error);
      toast.error("Failed to refresh charges");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (charge: ChargeRecord) => {
    setSelectedCharge(charge);
    setOpenEdit(true);
  };

  const handleDelete = (id: string) => {
    setChargeToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!chargeToDelete) return;

    setLoading(true);
    try {
      const result = await deleteIPDCharge(chargeToDelete, ipdAdmissionId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Charge deleted successfully");
        handleRefresh();
      }
    } catch (error) {
      console.error("Error deleting charge:", error);
      toast.error("Failed to delete charge");
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setChargeToDelete(null);
    }
  };

  const handlePrint = (charge: ChargeRecord) => {
    alert(`Print charge ${charge.id}`);
  };

  const ipdChargeColumns = (
    onEdit: (c: ChargeRecord) => void,
    onDelete: (id: string) => void,
    onPrint: (c: ChargeRecord) => void
  ): ColumnDef<ChargeRecord>[] => [
      {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) =>
          row.original.createdAt
            ? format(new Date(row.original.createdAt), "yyyy-MM-dd")
            : "-",
      },
      {
        accessorKey: "chargeName",
        header: "Charge Name",
        cell: ({ row }) => row.original.chargeName || "-",
      },
      {
        accessorKey: "chargeType",
        header: "Charge Type",
        cell: ({ row }) => row.original.chargeType || "-",
      },
      {
        accessorKey: "chargeCategory",
        header: "Charge Category",
        cell: ({ row }) => row.original.chargeCategory || "-",
      },
      {
        accessorKey: "qty",
        header: "Qty",
      },
      {
        accessorKey: "standardCharge",
        header: "Standard",
        cell: ({ row }) => `₹ ${Number(row.original.standardCharge || 0).toFixed(2)}`,
      },
      {
        id: "discount",
        header: "Discount",
        cell: ({ row }) => {
          const total = Number(row.original.totalAmount || 0);
          const discount = Number(row.original.discountPercent || 0);
          return `₹ ${((total * discount) / 100).toFixed(2)}`;
        },
      },
      {
        id: "tax",
        header: "Tax",
        cell: ({ row }) => {
          const total = Number(row.original.totalAmount || 0);
          const discount = Number(row.original.discountPercent || 0);
          const tax = Number(row.original.taxPercent || 0);
          const afterDiscount = total - (total * discount) / 100;
          return `₹ ${((afterDiscount * tax) / 100).toFixed(2)}`;
        },
      },
      {
        id: "netAmount",
        header: "Amount",
        cell: ({ row }) => {
          const total = Number(row.original.totalAmount || 0);
          const discount = Number(row.original.discountPercent || 0);
          const tax = Number(row.original.taxPercent || 0);

          const discountAmount = (total * discount) / 100;
          const taxAmount = ((total - discountAmount) * tax) / 100;
          const net = total - discountAmount + taxAmount;

          return <span className="font-semibold text-green-600">₹ {net.toFixed(2)}</span>;
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={() => onPrint(row.original)}
                  className="cursor-pointer"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </DropdownMenuItem>

                {!isDischarged && (
                  <>
                    <DropdownMenuItem
                      onClick={() => onEdit(row.original)}
                      className="cursor-pointer"
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => onDelete(row.original.id)}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      }
    ];




  return (
    <div className="py-2 space-y-6">

      {/* HEADER / SEARCH */}
      <Card className="border-dialog bg-dialog-header">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-2xl font-bold text-dialog flex flex-wrap items-center gap-2">
            <Receipt className="bg-dialog-header text-dialog-icon" />
            <span>Charges</span>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    ₹ {totalNetAmount.toFixed(2)}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total Charges</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            {/* <Button
              variant="outline"
              onClick={() => setOpenDateFilter(true)}
              className="flex items-center gap-2"
            >
             Filter by Date
            </Button> */}


            <Input
              placeholder="Search by bill ID / charge name / type / category"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sm:w-72"
            />

            {!isDischarged && (
              <Button
                onClick={() => setOpenAdd(true)}
                className="flex items-center gap-2 bg-dialog-primary text-dialog-btn hover:bg-btn-hover hover:opacity-90"
              >
                <PlusCircle className="h-5 w-5" /> Add Charges
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* CHARGES TABLE */}
      <Card className="shadow-lg border-dialog bg-dialog-header">
        <CardContent className="p-0 overflow-x-auto">
          <Table
            data={paginatedData}
            columns={ipdChargeColumns(handleEdit, handleDelete, handlePrint)}
            fallback={loading ? "Loading charges..." : "No charges found"}
            headerTextClassName="text-dialog-icon"
            bodyTextClassName="text-dialog-muted"
          />
        </CardContent>
      </Card>
      {/* PAGINATION */}
      <PaginationControl
        currentPage={currentPage}
        totalPages={totalPages}
        rowsPerPage={rowsPerPage}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={setRowsPerPage}
      />

      {/* ADD CHARGES FULLSCREEN */}
      <AddIPDChargesFullScreen
        open={openAdd}
        onClose={() => {
          setOpenAdd(false);
        }}
        onSuccess={handleRefresh}
      />

      {/* EDIT CHARGE MODAL */}
      <AddIPDChargesFullScreen
        open={openEdit}
        onClose={() => {
          setOpenEdit(false);
          setSelectedCharge(null);
        }}
        mode="edit"
        chargeData={selectedCharge}
        onSuccess={handleRefresh}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Charge"
        description="Are you sure you want to delete this charge? This action cannot be undone."
        onConfirm={confirmDelete}
        isLoading={loading}
      />

      <Dialog open={openDateFilter} onOpenChange={setOpenDateFilter}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Date Filter</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">From Date</label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">To Date</label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button
              variant="ghost"
              onClick={() => {
                setFromDate("");
                setToDate("");
              }}
            >
              Clear
            </Button>

            <Button onClick={() => setOpenDateFilter(false)}>
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
