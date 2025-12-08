"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table } from "@/components/Table/Table";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import BackButton from "@/Components/BackButton";

type Purchase = {
  id: string;
  purchaseNo: string;
  purchaseDate: string;
  billNo: string;
  supplierName: string;
  total: number;
  discount: number;
  tax: number;
  netAmount: number;
};

export default function MedicinePurchaseListPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [search, setSearch] = useState("");

  // NEW DATE FILTERS
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const route = useRouter();

  useEffect(() => {
    const sample: Purchase[] = [
      {
        id: "1",
        purchaseNo: "P001",
        purchaseDate: "2025-01-05",
        billNo: "B001",
        supplierName: "HealthCare Suppliers",
        total: 1000,
        discount: 50,
        tax: 30,
        netAmount: 980,
      },
      {
        id: "2",
        purchaseNo: "P002",
        purchaseDate: "2025-01-10",
        billNo: "B002",
        supplierName: "MediPharma",
        total: 1500,
        discount: 100,
        tax: 75,
        netAmount: 1475,
      },
    ];
    setPurchases(sample);
  }, []);

  // FILTER LOGIC (search + date)
  const filtered = useMemo(() => {
    return purchases.filter((p) => {
      const matchesSearch = search
        ? p.purchaseNo.toLowerCase().includes(search.toLowerCase()) ||
          p.billNo.toLowerCase().includes(search.toLowerCase()) ||
          p.supplierName.toLowerCase().includes(search.toLowerCase())
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
    { accessorKey: "purchaseNo", header: "Pharmacy Purchase No." },
    {
      accessorKey: "purchaseDate",
      header: "Purchase Date",
      cell: ({ row }) => new Date(row.original.purchaseDate).toLocaleDateString(),
    },
    { accessorKey: "billNo", header: "Bill No" },
    { accessorKey: "supplierName", header: "Supplier Name" },
    { accessorKey: "total", header: "Total" },
    { accessorKey: "discount", header: "Discount" },
    { accessorKey: "tax", header: "Tax" },
    { accessorKey: "netAmount", header: "Net Amount" },

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

  const handleView = (purchase: Purchase) => {
    console.log("View Purchase:", purchase);
  };

  return (
    <div className="p-6">
        <BackButton/>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-3xl font-bold">Medicine Purchase List</h1>
      </div>


    <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
    <Input
        placeholder="Search Purchase / Bill / Supplier"
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
    </div>
  );
}
