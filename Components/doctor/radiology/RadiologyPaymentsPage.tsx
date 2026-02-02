"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table } from "@/components/Table/Table";
import { ColumnDef } from "@tanstack/react-table";
import { FieldSelectorDropdown } from "@/components/FieldSelectorDropdown";
import { PaginationControl } from "@/components/pagination";
import {
  MoreVertical,
  Search,
  IndianRupee,
  Calendar,
  CreditCard,
  Download,
  Clock,
  CheckCircle2,
  Printer,
  Wallet
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface RadiologyPayment {
  id: string;
  billId: string;
  billNo: string;
  paymentDate: string;
  paymentAmount: string;
  paymentMode: string;
  referenceNo: string | null;
  patientName: string;
  patientPhone: string;
}

interface RadiologyPaymentsPageProps {
  payments: RadiologyPayment[];
}

export default function RadiologyPaymentsPage({ payments }: RadiologyPaymentsPageProps) {
  const initialPayments = payments;
  const [searchTerm, setSearchTerm] = useState("");
  const [modeFilter, setModeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [visibleFields, setVisibleFields] = useState<string[]>(["billNo", "patientName", "paymentDate", "paymentMode", "paymentAmount", "actions"]);
  const [activeTab, setActiveTab] = useState< "today" | "week" | "month">("today");

  // Filter Logic
  const filteredPayments = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date();
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    return initialPayments.filter((p) => {
      const matchesSearch =
        p.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.billNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.referenceNo?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesMode = modeFilter === "all" || p.paymentMode === modeFilter;

      // Filter by date based on active tab
      const date = new Date(p.paymentDate);
      let matchesDate = true;
      if (activeTab === "today") {
        matchesDate = date.toDateString() === today.toDateString();
      } else if (activeTab === "week") {
        matchesDate = date >= startOfWeek && date <= today;
      } else if (activeTab === "month") {
        matchesDate = date >= startOfMonth && date <= today;
      }

      return matchesSearch && matchesMode && matchesDate;
    });
  }, [initialPayments, searchTerm, modeFilter, activeTab]);

  // Totals
  const totalAmount = filteredPayments.reduce((sum, p) => sum + Number(p.paymentAmount), 0);

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / rowsPerPage);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const allColumnsForSelector = useMemo(() => [
    { header: "Bill ID", accessorKey: "billNo" },
    { header: "Patient", accessorKey: "patientName" },
    { header: "Date", accessorKey: "paymentDate" },
    { header: "Mode", accessorKey: "paymentMode" },
    { header: "Amount", accessorKey: "paymentAmount" },
    { header: "Ref No", accessorKey: "referenceNo" },
  ], []);

  const columns = useMemo(() => {
    const allCols: ColumnDef<any>[] = [
      {
        header: "Bill ID",
        accessorKey: "billNo",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-bold text-primary tracking-tight">#{row.original.billNo}</span>
            <span className="text-[10px] text-muted-foreground font-mono truncate max-w-20">{row.original.billId}</span>
          </div>
        )
      },
      {
        header: "Patient",
        accessorKey: "patientName",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center text-primary font-bold text-xs ring-1 ring-primary/10">
              {row.original.patientName?.charAt(0) || "P"}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{row.original.patientName || "Unknown"}</span>
              <span className="text-[11px] text-muted-foreground">{row.original.patientPhone || "-"}</span>
            </div>
          </div>
        )
      },
      {
        header: "Payment Date",
        accessorKey: "paymentDate",
        cell: ({ row }) => (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              {row.original.paymentDate ? format(new Date(row.original.paymentDate), "dd MMM yyyy") : "-"}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Clock className="h-2.5 w-2.5" />
              {row.original.paymentDate ? format(new Date(row.original.paymentDate), "hh:mm a") : "-"}
            </div>
          </div>
        )
      },
      {
        header: "Mode",
        accessorKey: "paymentMode",
        cell: ({ row }) => {
          const mode = row.original.paymentMode;

          const colorMap: Record<string, string> = {
            Online: "bg-green-500 dark:text-green-600 ",
            Card: "bg-blue-500 dark:text-blue-600 ",
            Cash: "bg-orange-500 dark:text-orange-600 ",
          };

          const colorClass = colorMap[mode] || "bg-muted text-muted-foreground border-muted";

          return (
            <Badge
              className={`rounded-md font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 text-white dark:bg-primary ${colorClass}`}
            >
              {mode}
            </Badge>
          );
        }
      },
      {
        header: "Reference No",
        accessorKey: "referenceNo",
        cell: ({ row }) => (
          <span className="text-xs font-mono text-muted-foreground">
            {row.original.referenceNo || "-"}
          </span>
        )
      },
      {
        header: "Amount",
        accessorKey: "paymentAmount",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-sm font-black text-green-600">₹{parseFloat(row.original.paymentAmount).toLocaleString()}</span>
          </div>
        )
      },
      {
        id: "actions",
        header: () => <div className="text-right pr-4">Actions</div>,
        cell: ({ row }) => (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted-foreground/10">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 p-1">
                <DropdownMenuItem className="gap-2 cursor-pointer font-medium">
                  <Printer className="h-4 w-4 text-primary" /> Print Receipt
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer font-medium">
                  <Download className="h-4 w-4 text-blue-600" /> Download PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ];

    return allCols.filter((col) => {
      const key = "accessorKey" in col ? col.accessorKey as string : col.id;
      return visibleFields.includes(key!);
    });
  }, [visibleFields]);

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-Module-header p-6 rounded-2xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">Radiology Payments</h1>
          </div>
          <p className="text-gray-300 flex items-center gap-2 text-sm font-medium pl-10">
            Manage and track all radiology financial transactions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 font-bold shadow-sm bg-white/20 border border-white/20 text-gray-300">
            <Download className="h-4 w-4" /> Export PDF
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => {
        setActiveTab(v as | "today" | "week" | "month");
        setCurrentPage(1);
      }} className="w-full space-y-2">
        <TabsList className="shadow-xl bg-overview-card border-overview-strong">
          <TabsTrigger value="today" >
            Today
          </TabsTrigger>
          <TabsTrigger value="week" >
            This Week
          </TabsTrigger>
          <TabsTrigger value="month" >
            This Month
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard title="Total Payments" value={`${totalAmount.toLocaleString()}`} icon={Wallet} color="primary" />
            <StatsCard title="Cash Collection" value={`${filteredPayments.filter(p => p.paymentMode === 'Cash').reduce((sum, p) => sum + Number(p.paymentAmount), 0).toLocaleString()}`} icon={IndianRupee} color="orange" />
            <StatsCard title="UPI/Digital" value={`${filteredPayments.filter(p => p.paymentMode === 'Online').reduce((sum, p) => sum + Number(p.paymentAmount), 0).toLocaleString()}`} icon={CheckCircle2} color="green" />
            <StatsCard title="Card" value={`${filteredPayments.filter(p => p.paymentMode === 'Card').reduce((sum, p) => sum + Number(p.paymentAmount), 0).toLocaleString()}`} icon={CreditCard} color="blue" />
          </div>

          {/* Filters Section */}
          <Card className="shadow-xl bg-overview-card border-overview-strong p-0">
            <CardContent className="p-6">
              <div className="flex flex-col items-center lg:flex-row gap-6">
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Search </label>
                  <div className="relative group max-w-74">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input
                      placeholder="Search by Patient, Bill No, or Reference ID..."
                      className="pl-10 pr-10 w-auto bg-background/50 border-primary/10 focus:border-primary transition-all shadow-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center justify-center"
                      title="Clear search"
                      >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:flex gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Payment Mode</label>
                    <Select value={modeFilter} onValueChange={setModeFilter}>
                      <SelectTrigger className=" bg-background/50 border-primary/10 shadow-sm font-bold">
                        <SelectValue placeholder="All Modes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Modes</SelectItem>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Online">UPI / Online</SelectItem>
                        <SelectItem value="Card">Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 flex flex-col justify-end">
                    <FieldSelectorDropdown
                      columns={allColumnsForSelector as any}
                      visibleFields={visibleFields}
                      onToggle={(key, checked) => {
                        setVisibleFields((prev) =>
                          checked ? [...prev, key] : prev.filter((f) => f !== key)
                        );
                      }}
                      buttonLabel="Columns"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Table */}
          <div className="rounded-xl border bg-card text-card-foreground shadow-2xl overflow-hidden ring-1 ring-primary/5">
            <Table
              columns={columns as any}
              data={paginatedPayments}
            />

            {filteredPayments.length === 0 && (
              <div className="p-20 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="p-6 bg-muted/30 rounded-full">
                    <Search className="h-12 w-12 text-muted-foreground/30" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold">No transactions found</h3>
                  <p className="text-muted-foreground max-w-xs mx-auto">Try adjusting your search terms or filters to find exactly what you're looking for.</p>
                </div>
                <Button variant="link" className="text-primary font-bold" onClick={() => { setSearchTerm(""); setModeFilter("all"); }}>
                  Clear All Filters
                </Button>
              </div>
            )}

            {/* Pagination */}
            <div className="border-t bg-muted/10 px-6 py-4 flex items-center justify-between">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filteredPayments.length)} of {filteredPayments.length} transactions
              </p>
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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: string }) {
  const colorMap: Record<string, string> = {
    primary: "bg-primary/10 text-primary border-primary/20",
    orange: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    green: "bg-green-500/10 text-green-600 border-green-500/20",
    blue: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  }

  return (
    <Card className=" dark:border-none  shadow-lg overflow-hidden relative group">
      <div className={`absolute top-0 left-0 w-1 h-full ${color === 'primary' ? 'bg-primary' : color === 'orange' ? 'bg-orange-500' : color === 'green' ? 'bg-green-500' : 'bg-blue-500'}`} />
      <CardContent className="px-5 ">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-2 rounded-lg ${colorMap[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">{title}</p>
          <p className="text-2xl font-black tracking-tighter flex items-center"><IndianRupee size={20} />{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
