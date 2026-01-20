"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table } from "@/components/Table/Table";
import { ColumnDef } from "@tanstack/react-table";
import { FieldSelectorDropdown } from "@/components/FieldSelectorDropdown";
import { PaginationControl } from "@/components/pagination";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { getPharmacySaleById, getPharmacySales } from "@/lib/actions/pharmacySales";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAbility } from "@/components/providers/AbilityProvider";
import { Can } from "@casl/react";
import { Card } from "@/components/ui/card";
import { PharmacyBillPdf } from "@/Components/pdf/pharmacyBillPdf";
import { pdf } from "@react-pdf/renderer";

type Bill = {
  id: string;
  billNo: string;
  date: string;
  customerName: string;
  customerPhone: string;
  paymentMode: string;
  totalAmount: number;
};

type TypedColumn<T> = ColumnDef<T> & { accessorKey?: string };

interface PharmacyBillPdfProps {
  billNumber: string;
  billDate: string;

  customerName: string;
  customerPhone: string;

  paymentMode: string;

  items: Array<{
    name: string;
    qty: number;
    price: number;
    total: number;
  }>;

  totalAmount: number;
  discount: number;
  tax: number;

  organization: {
    id: string;
    name: string;
    metadata: string | null;
  };

  orgModeCheck: boolean;
}

export default function PharmacyBillPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const route = useRouter();
  const ability = useAbility();
  const [visibleFields, setVisibleFields] = useState<string[]>([
    "billNo",
    "date",
    "customerName",
    "customerPhone",
    "paymentMode",
    "totalAmount",
  ]);

  useEffect(() => {
    const saved = localStorage.getItem("visibleBillFields");
    if (saved) setVisibleFields(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("visibleBillFields", JSON.stringify(visibleFields));
  }, [visibleFields]);

  useEffect(() => {
    const fetchBills = async () => {
      const res = await getPharmacySales();
      if (res.error) {
        toast.error(res.error);
      } else if (res.data) {
        console.log("billing data", res.data)
        const mappedBills = res.data.map((b: any) => ({
          id: b.id,
          billNo: b.billNumber,
          date: format(new Date(b.createdAt), "yyyy-MM-dd"),
          customerName: b.customerName,
          customerPhone: b.customerPhone,
          paymentMode: b.paymentMode,
          totalAmount: Number(b.netAmount), // Using netAmount as total amount to pay
        }));
        setBills(mappedBills);
      }
    };
    fetchBills();
  }, []);

  const filteredData = useMemo(() => {
    return bills.filter((b) =>
      search
        ? b.billNo.toLowerCase().includes(search.toLowerCase()) ||
        b.customerName.toLowerCase().includes(search.toLowerCase()) ||
        b.customerPhone.includes(search)
        : true
    );
  }, [search, bills]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginated = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const handlePrint = async (billId: string) => {
    if (!billId) return;

    try {
      const res: any = await getPharmacySaleById(billId);

      if (!res?.data) {
        toast.error("Bill not found");
        return;
      }

      const bill = res.data;
      console.log("before print bill data",bill)
      const blob = await pdf(
        <PharmacyBillPdf
          billNumber={bill.billNumber}
          billDate={format(new Date(bill.createdAt), "dd-MM-yyyy")}
          customerName={bill.customerName}
          customerPhone={bill.customerPhone}
          paymentMode={bill.paymentMode}
          items={bill.items || []}
          totalAmount={Number(bill.netAmount)}
          discount={Number(bill.discount || 0)}
          tax={Number(bill.tax || 0)}
          organization={bill.organization}
          orgModeCheck={true}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const win = window.open(url);

      if (win) {
        win.onload = () => {
          win.focus();
          win.print();
        };
      }
    } catch (error) {
      console.error("Print error:", error);
      toast.error("Failed to print bill");
    }
  };


  const allColumns: ColumnDef<Bill>[] = [
    { accessorKey: "billNo", header: "Bill No" },
    { accessorKey: "date", header: "Bill Date" },
    { accessorKey: "customerName", header: "Customer Name" },
    { accessorKey: "customerPhone", header: "Customer Phone" },
    { accessorKey: "paymentMode", header: "Payment Mode" },
    { accessorKey: "totalAmount", header: "Total Amount" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePrint(row?.original?.id)}
        >
          Print
        </Button>
      ),
    },
  ];

  const columns = useMemo(() => {
    const filtered = allColumns.filter((col) => {
      if (col.id === "actions") return false;

      const key = "accessorKey" in col ? col.accessorKey : undefined;
      return key && visibleFields.includes(key as string);
    });

    const actionCol = allColumns.find((c) => c.id === "actions");
    if (actionCol) filtered.push(actionCol);

    return filtered;
  }, [visibleFields, allColumns]);

  return (
    <div className="p-6">
      <Card className="bg-Module-header text-white shadow-lg mb-4 px-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Pharmacy Billing
          </h1>
          <p className="text-sm text-white/80 max-w-2xl">
            Generate and manage pharmacy bills for customers. View bill history,
            payment modes, and print invoices seamlessly.
          </p>
        </div>
      </Card>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <Input
          placeholder="Search Bill / Patient / Case ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />

        <div className="flex gap-3">
          <Can I="create" a="billing" ability={ability}>
            <Button variant="default" onClick={() => route.push("/doctor/pharmacy/genrateBill")}><Plus size={16} /> Generate Bill</Button>
          </Can>
          <FieldSelectorDropdown
            columns={allColumns as TypedColumn<Bill>[]}
            visibleFields={visibleFields}
            onToggle={(key, checked) => {
              setVisibleFields((prev) =>
                checked ? [...prev, key] : prev.filter((f) => f !== key)
              );
            }}
          />
        </div>
      </div>


      <Table data={paginated} columns={columns} fallback={"No Bill found"} />


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
  );
}
