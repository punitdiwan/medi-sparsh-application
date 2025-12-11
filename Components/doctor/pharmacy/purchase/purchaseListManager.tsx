"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table } from "@/components/Table/Table";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import BackButton from "@/Components/BackButton";
import { getPurchases, getPurchaseDetails } from "@/lib/actions/pharmacyPurchase";
import PurchaseDetailsModal from "./PurchaseDetailsModal";
import { toast } from "sonner";
import { format } from "date-fns";

type Purchase = {
  id: string;
  billNumber: string;
  supplierName: string | null;
  purchaseDate: Date;
  totalAmount: string;
};

export default function MedicinePurchaseListPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [search, setSearch] = useState("");
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // NEW DATE FILTERS
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const route = useRouter();

  useEffect(() => {
    const fetchPurchases = async () => {
      const res = await getPurchases();
      if (res.error) {
        toast.error(res.error);
      } else if (res.data) {
        setPurchases(res.data);
      }
    };
    fetchPurchases();
  }, []);

  // FILTER LOGIC (search + date)
  const filtered = useMemo(() => {
    return purchases.filter((p) => {
      const matchesSearch = search
        ? p.billNumber.toLowerCase().includes(search.toLowerCase()) ||
        (p.supplierName && p.supplierName.toLowerCase().includes(search.toLowerCase()))
        : true;

      const purchaseDate = new Date(p.purchaseDate);

      const matchesFrom =
        fromDate ? purchaseDate >= new Date(fromDate) : true;

      const matchesTo = toDate ? purchaseDate <= new Date(toDate) : true;

      return matchesSearch && matchesFrom && matchesTo;
    });
  }, [search, fromDate, toDate, purchases]);

  const columns: ColumnDef<Purchase>[] = [
    {
      header: "S.No",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "purchaseDate",
      header: "Purchase Date",
      cell: ({ row }) => format(new Date(row.original.purchaseDate), "dd MMM yyyy"),
    },
    { accessorKey: "billNumber", header: "Bill No" },
    { accessorKey: "supplierName", header: "Supplier Name", cell: ({ row }) => row.original.supplierName || "-" },
    { accessorKey: "totalAmount", header: "Total Amount" },

    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handleView(row.original)}>
            <FileText size={16} /> View
          </Button>
        </div>
      ),
    },
  ];

  const handleView = async (purchase: Purchase) => {
    const res = await getPurchaseDetails(purchase.id);
    if (res.error) {
      toast.error(res.error);
    } else if (res.data) {
      setSelectedPurchase(res.data);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="p-6">
      <BackButton />
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-3xl font-bold">Medicine Purchase List</h1>
      </div>


      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <Input
          placeholder="Search Bill / Supplier"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* DATE FILTER ROW (2nd line) */}
      <div className="flex flex-wrap items-center gap-4 mb-6">

        {/* FROM DATE */}
        <div className="flex flex-col">
          <label className="text-sm font-medium">From</label>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-[180px]"
          />
        </div>

        {/* TO DATE */}
        <div className="flex flex-col">
          <label className="text-sm font-medium">To</label>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-[180px]"
          />
        </div>

        {/* BUTTON — RIGHT SIDE */}
        <div className="ml-auto">
          <Button
            variant="default"
            onClick={() => route.push("/doctor/pharmacy/purchase/medicine")}
          >
            <Plus size={16} /> Purchase Medicine
          </Button>
        </div>
      </div>


      <Table data={filtered} columns={columns} />

      <PurchaseDetailsModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        purchase={selectedPurchase}
      />
    </div>
  );
}
