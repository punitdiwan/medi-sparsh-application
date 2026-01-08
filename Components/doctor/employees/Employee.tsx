"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Users, Plus, Filter } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Table } from "@/components/Table/Table";
import { FieldSelectorDropdown } from "@/components/FieldSelectorDropdown";

import HoneycombLoader from "@/components/HoneycombLoader";
import { EditEmployeeModal } from "@/Components/doctor/employees/EditEmployee";
import { ConfirmDialog } from "@/components/model/ConfirmationModel";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import AddEmployeeForm from "@/Components/doctor/employees/AddEmployee";
import FilterBar, { FilterField } from "@/features/filterbar/FilterBar";
import { useAbility } from "@/components/providers/AbilityProvider";
import { Can } from "@casl/react";
import { Card } from "@/components/ui/card";

type Employee = {
  user_id: string;
  staff_id: string; // Add staffId for API operations
  name: string;
  email?: string;
  mobile?: string;
  gender?: string;
  role?: string;
  department?: string;
  joiningDate?: string;
  address?: string;
  specialization?: string;
  qualification?: string;
  experience?: string;
  consultationFee?: string;
  availability?: string;
  isdeleted?: boolean;
};
type Specialization = {
  name: string;
  id?: string;
  description?: string;
};

type Doctor = {
  specialization?: Specialization | Specialization[];
  qualification?: string;
  experience?: string;
  consultation_fee?: string;
  availability?: string;
};

type StaffWithDoctor = {
  user_id: string;
  name: string;
  email?: string;
  number?: string;
  role?: string;
  department?: string;
  joining_date?: string;
  doctors?: Doctor;
  gender?: string;
  address?: string;
  isdeleted?: boolean;
};

type TypedColumn<T> = ColumnDef<T> & { accessorKey?: string };

const optionalColumns: TypedColumn<Employee>[] = [
  { header: "Email", accessorKey: "email" },
  { header: "Department", accessorKey: "department" },
  { header: "Joining Date", accessorKey: "joiningDate" },
  { header: "Experience", accessorKey: "experience" },
  { header: "Qualification", accessorKey: "qualification" },
  { header: "Specialization", accessorKey: "specialization" },
  { header: "Gender", accessorKey: "gender" },
  { header: "Address", accessorKey: "address" },
  {
    header: "Status",
    accessorKey: "isdeleted",
    cell: ({ row }) => (
      <span
        className={`${row.original.isdeleted ? "text-red-600" : "text-green-600"
          } font-medium`}
      >
        {row.original.isdeleted ? "Inactive" : "Active"}
      </span>
    ),
  },
];

type PatientFilters = {
  search?: string;
  joiningDate?: string;
};
const employeeFilterFields: FilterField[] = [
  {
    key: "search",
    label: "Search",
    type: "text",
    placeholder: "Search by name, email, or number",
  },
  {
    key: "joiningDate",
    label: "Joining Date",
    type: "date",
  },
];

export default function Employee() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [visibleFields, setVisibleFields] = useState<string[]>([
    "department",
    "joiningDate",
  ]);
  const [showAddEmployee, setShowAddEmployee] = useState(false);

  const ability = useAbility();
  // const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const totalPages = Math.ceil(employees.length / rowsPerPage);
  const paginatedEmployees = employees.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);

  const [filter, setFilter] = useState<"active" | "Inactive" | "all">("all");
  const [filters, setFilters] = useState<PatientFilters>({});
  const handleFilterChange = (value: "active" | "Inactive" | "all") => {
    setFilter(value);
  };

  const getStaffWithDoctor = async () => {
    try {
      const response = await fetch("/api/employees");
      const result = await response.json();
      console.info(result);
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to fetch employees");
      }

      // Transform the data to match the Employee type
      const transformedData: Employee[] = result.data.map((staff: any) => {
        const doctorData = staff.doctorData;

        // Format specialization
        let specializationNames = "-";
        if (doctorData?.specialization) {
          if (Array.isArray(doctorData.specialization)) {
            specializationNames = doctorData.specialization
              .map((s: any) => s.name)
              .join(", ");
          } else if (typeof doctorData.specialization === "object" && doctorData.specialization.name) {
            specializationNames = doctorData.specialization.name;
          }
        }

        return {
          user_id: staff.staff.userId,
          staff_id: staff.staff.id, // Add staffId for API calls
          name: staff.user.name,
          email: staff.user.email || "",
          mobile: staff.staff.mobileNumber || "",
          gender: staff.staff.gender || "",
          role: staff.member.role || "",
          department: staff.staff.department || "",
          joiningDate: staff.staff.joiningDate || "",
          address: staff.staff.address || "",
          specialization: doctorData ? specializationNames : "-",
          qualification: doctorData?.qualification || "-",
          experience: doctorData?.experience || "-",
          consultationFee: doctorData?.consultationFee || "-",
          availability: doctorData?.availability || "-",
          isdeleted: staff.staff.isDeleted || false,
        };
      });

      setAllEmployees(transformedData);
      setEmployees(transformedData.filter((e) => !e.isdeleted)); // default active
      setLoading(false);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to fetch employees");
      setLoading(false);
    }
  };

  const applyFilter = useCallback(
    (list: Employee[], currentFilter: typeof filter) => {
      const filtered =
        currentFilter === "active"
          ? list.filter((e) => e.isdeleted === false)
          : currentFilter === "Inactive"
            ? list.filter((e) => e.isdeleted === true)
            : list;

      setEmployees(filtered);
    },
    []
  );

  const applySearchAndDateFilter = useCallback(() => {
    let filtered = [...allEmployees];

    if (filters.search && filters.search.trim() !== "") {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.name?.toLowerCase().includes(term) ||
          e.email?.toLowerCase().includes(term) ||
          e.mobile?.includes(term) ||
          e.department?.toLowerCase().includes(term)
      );
    }

    if (filters.joiningDate) {
      filtered = filtered.filter((e) => {
        if (!e.joiningDate) return false;
        const employeeDate = new Date(e.joiningDate)
          .toISOString()
          .split("T")[0];
        return employeeDate === filters.joiningDate;
      });
    }

    // apply "active/inactive/all" on top
    if (filter === "active") filtered = filtered.filter((e) => !e.isdeleted);
    if (filter === "Inactive") filtered = filtered.filter((e) => e.isdeleted);

    setEmployees(filtered);
  }, [filters, filter, allEmployees]);

  useEffect(() => {
    applySearchAndDateFilter();
  }, [filters, filter, allEmployees, applySearchAndDateFilter]);

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      setLoading(true);
      const data = await getStaffWithDoctor();
      if (!isMounted) return;
    }

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    applyFilter(allEmployees, filter);
  }, [filter, allEmployees, applyFilter]);

  const handleDelete = async (staff_id: string) => {
    try {
      const response = await fetch(`/api/employees/${staff_id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to delete employee");
      }

      // Refresh the employee list after deletion
      await getStaffWithDoctor();
      toast.success("Employee deleted successfully!");
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error("Failed to delete employee");
    }
  };

  const handleActivate = async (staff_id: string) => {
    try {
      const response = await fetch(`/api/employees/${staff_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isDeleted: false }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to activate employee");
      }

      // Refresh the employee list after activation
      await getStaffWithDoctor();
      toast.success("Employee activated successfully!");
    } catch (error) {
      console.error("Error activating employee:", error);
      toast.error("Failed to activate employee");
    }
  };

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null
  );

  const baseColumns: ColumnDef<Employee>[] = [
    // {
    //   header: "#",
    //   cell: ({ row }) => row.index + 1,
    // },
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "Role",
      accessorKey: "role",
    },
    {
      header: "Mobile",
      accessorKey: "mobile",
    },
  ];

  const columns: ColumnDef<Employee>[] = [
    ...baseColumns,
    ...optionalColumns.filter((col) => {
      const key = (col as { accessorKey?: string }).accessorKey;
      return key && visibleFields.includes(key);
    }),
    {
      header: "Actions",
      cell: ({ row }) => {
        const isDeleted = row.original.isdeleted;

        return (
          <div className="flex gap-2 justify-center">
            {isDeleted ? (
              // 🟢 Show only "Activate" button when inactive
              <Can I="update" a="members" ability={ability}>
                <ConfirmDialog
                  trigger={
                    <Button
                      variant="secondary"
                      size="sm"
                      className="text-white border border-white/10"
                    >
                      Activate
                    </Button>
                  }
                  title={`Activate ${row.original.name}?`}
                  description={`Are you sure you want to activate ${row.original.name}?`}
                  actionLabel="Activate"
                  cancelLabel="Cancel"
                  onConfirm={() => handleActivate(row.original.staff_id)}
                  onCancel={() => console.log("Activation cancelled")}
                />
              </Can>
            ) : (
              <>
                <Can I="update" a="members" ability={ability}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedEmployeeId(row.original.staff_id)}
                  >
                    Edit
                  </Button>
                </Can>
                <Can I="delete" a="members" ability={ability}>
                  <ConfirmDialog
                    trigger={
                      <Button variant="destructive" size="sm">
                        Delete
                      </Button>
                    }
                    title={`Delete ${row.original.name}?`}
                    description={`Are you sure you want to delete ${row.original.name}?`}
                    actionLabel="Delete"
                    cancelLabel="Cancel"
                    onConfirm={() => handleDelete(row.original.staff_id)}
                    onCancel={() => console.log("Delete cancelled")}
                  />
                </Can>
              </>
              
            )}
          </div>
        );
      },
    },
  ];
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <HoneycombLoader />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header Section */}
      <Card className="bg-Module-header flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 mb-2 gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-white" />
          {/* <h1 className="text-2xl font-semibold">Employees</h1> */}
          <h1 className="text-2xl text-white font-semibold">
            Employees ({employees.length})
          </h1>
        </div>

        <div className="flex flex-wrap items-center justify-start sm:justify-end gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 bg-white/20 border-white/20 text-gray-300 hover:bg-indigo-50">
                <Filter className="w-4 h-4" />
                {filter === "active"
                  ? "Active Employees"
                  : filter === "Inactive"
                    ? "Inactive Employees"
                    : "All Employees"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => handleFilterChange("active")}>
                Active Employees
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("Inactive")}>
                Inactive Employees
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("all")}>
                All Employees
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <FieldSelectorDropdown
            columns={optionalColumns}
            visibleFields={visibleFields}
            onToggle={(key, checked) => {
              setVisibleFields((prev) =>
                checked ? [...prev, key] : prev.filter((f) => f !== key)
              );
            }}
          />

          <Button
            variant="outline"
            onClick={() =>
              router.push("/doctor/employees/manageSpecialization")
            }
            className="flex items-center gap-2 bg-white/20 border-white/20 text-gray-300 hover:bg-indigo-50"
          >
            <Plus className="w-4 h-4" />
            Manage Specializations
          </Button>
          <Can I="create" a="members" ability={ability}>
            <Button
              onClick={() => setShowAddEmployee(true)}
              className="flex items-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50"
            >
              <Plus className="w-4 h-4" />
              Add Employee
            </Button>
          </Can>
        </div>
        <p className="text-sm text-indigo-100 leading-relaxed max-w-4xl">
          Manage hospital employees and doctors, including roles, departments,
          specializations, and availability. Add, update, activate, or deactivate
          staff members from this section.
        </p>
      </Card>
      <div className="mb-2">
        <FilterBar fields={employeeFilterFields} onFilter={setFilters} />
      </div>

      {/* ✅ Table Section */}

        <Table data={paginatedEmployees} columns={columns} fallback={"No employee found"}/>

      {employees.length > rowsPerPage && (
        <div className="flex justify-between items-center mt-4 px-2">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1); // reset to first page
              }}
              className="border border-gray-300 rounded-md px-2 py-1 bg-transparent"
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {showAddEmployee && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/10 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-xl shadow-lg p-6">
            <AddEmployeeForm
              onCancel={() => {
                setShowAddEmployee(false);
                getStaffWithDoctor();
              }}
            />
          </div>
        </div>
      )}


      {selectedEmployeeId && (
        <EditEmployeeModal
          employeeId={selectedEmployeeId}
          onClose={() => setSelectedEmployeeId(null)}
          onUpdated={async () => {
            // Refresh the employee list after update
            await getStaffWithDoctor();
            setSelectedEmployeeId(null);
          }}
        />
      )}
    </div>
  );
}
