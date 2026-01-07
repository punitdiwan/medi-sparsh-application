"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MdDelete, MdEdit } from "react-icons/md";
import { ChargeTypeModal } from "./ChargeTypeModal";
import { toast } from "sonner";
import { useAbility } from "@/components/providers/AbilityProvider";
import { Can } from "@casl/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/model/ConfirmationModel";

// Types
interface Module {
  id: string;
  name: string;
}

interface ChargeType {
  id: string;
  name: string;
  modules: string[]; // Array of Module IDs
}

export default function ChargeTypeManager() {
  const [modules, setModules] = useState<Module[]>([]);
  const [chargeTypes, setChargeTypes] = useState<ChargeType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<ChargeType | null>(null);

  const ability = useAbility();

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Fetch Data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [modulesRes, chargeTypesRes] = await Promise.all([
        fetch("/api/modules"),
        fetch("/api/charge-types"),
      ]);

      if (!modulesRes.ok) {
        console.error("Modules API failed:", modulesRes.status, modulesRes.statusText);
      }
      if (!chargeTypesRes.ok) {
        console.error("Charge Types API failed:", chargeTypesRes.status, chargeTypesRes.statusText);
      }

      if (!modulesRes.ok || !chargeTypesRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const modulesData = await modulesRes.json();
      const chargeTypesData = await chargeTypesRes.json();

      setModules(modulesData);
      setChargeTypes(chargeTypesData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const paginated = chargeTypes.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const totalPages = Math.ceil(chargeTypes.length / rowsPerPage);

  const toggleFlag = async (chargeTypeId: string, moduleId: string) => {
    const chargeType = chargeTypes.find((c) => c.id === chargeTypeId);
    if (!chargeType) return;

    const currentModules = chargeType.modules || [];
    const isEnabled = currentModules.includes(moduleId);

    let newModules;
    if (isEnabled) {
      newModules = currentModules.filter((id) => id !== moduleId);
    } else {
      newModules = [...currentModules, moduleId];
    }

    // Optimistic Update
    setChargeTypes((prev) =>
      prev.map((c) =>
        c.id === chargeTypeId ? { ...c, modules: newModules } : c
      )
    );

    try {
      const response = await fetch(`/api/charge-types/${chargeTypeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: chargeType.name, modules: newModules }),
      });

      if (!response.ok) throw new Error("Failed to update");
    } catch (error) {
      console.error("Error updating module:", error);
      toast.error("Failed to update module");
      // Revert on error
      setChargeTypes((prev) =>
        prev.map((c) =>
          c.id === chargeTypeId ? { ...c, modules: currentModules } : c
        )
      );
    }
  };

  const handleSubmit = async (dataFromModal: { id?: string; name: string; modules: string[] }) => {
    try {
      if (dataFromModal.id) {
        // Edit
        const response = await fetch(`/api/charge-types/${dataFromModal.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: dataFromModal.name, modules: dataFromModal.modules }),
        });

        if (!response.ok) throw new Error("Failed to update charge type");
        const updated = await response.json();

        setChargeTypes((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );
        toast.success("Charge Type updated successfully");
      } else {
        // Add
        const response = await fetch("/api/charge-types", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: dataFromModal.name, modules: dataFromModal.modules }),
        });

        if (!response.ok) throw new Error("Failed to create charge type");
        const created = await response.json();

        setChargeTypes((prev) => [created, ...prev]);
        toast.success("Charge Type created successfully");
      }
      setModalOpen(false);
      setEditItem(null);
    } catch (error) {
      console.error("Error saving charge type:", error);
      toast.error("Failed to save charge type");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/charge-types/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      setChargeTypes((prev) => prev.filter((item) => item.id !== id));
      toast.success("Charge Type deleted");
    } catch (error) {
      console.error("Error deleting charge type:", error);
      toast.error("Failed to delete charge type");
    }
  };

  return (
    <Card className="shadow-md border border-dialog bg-card/50 backdrop-blur-sm p-0">
      <CardHeader className="px-6 py-4 text-white bg-Module-header rounded-t-xl">
        <div>
          <CardTitle className="text-2xl font-bold">Charge Type Management</CardTitle>
          <CardDescription className="mt-1 text-indigo-100">
            Define and manage different types of charges.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="p-4 space-y-4">
          <div className="flex justify-end items-center">
            <Can I="create" a="ChargesType" ability={ability}>
              <Button
                onClick={() => {
                  setEditItem(null);
                  setModalOpen(true);
                }}
              >
                + Add Charge Type
              </Button>
            </Can>
          </div>

          <div className="overflow-auto border rounded-md max-h-[430px]">
            <table className="w-full table-auto border-collapse">
              <thead className="sticky top-0 bg-muted z-10">
                <tr>
                  <th className="border p-2 text-left sticky left-0 bg-muted z-20">
                    Charge Name
                  </th>

                  {modules.map((mod) => (
                    <th key={mod.id} className="border p-2 text-center">
                      {mod.name.toUpperCase()}
                    </th>
                  ))}

                  <th className="border p-2 text-center sticky right-0 bg-muted z-20">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={modules.length + 2} className="text-center p-4">
                      Loading...
                    </td>
                  </tr>
                ) : paginated.length > 0 ? (
                  paginated.map((item) => (
                    <tr key={item.id}>
                      <td className="border p-2 sticky left-0 bg-background z-10">
                        {item.name}
                      </td>

                      {modules.map((mod) => (
                        <td key={mod.id} className="border p-2 text-center">
                          <input
                            type="checkbox"
                            checked={(item.modules || []).includes(mod.id)}
                            onChange={() => toggleFlag(item.id, mod.id)}
                          />
                        </td>
                      ))}

                      <td className="border p-2 sticky right-0 bg-background z-10">
                        <div className="flex gap-2 justify-center">
                          <Can I="update" a="ChargesType" ability={ability}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditItem(item);
                                setModalOpen(true);
                              }}
                            >
                              <MdEdit />
                            </Button>
                          </Can>
                          <Can I="delete" a="ChargesType" ability={ability}>
                            <ConfirmDialog
                              title={`Delete Charge Type "${item.name}"?`}
                              description="This action cannot be undone. Are you sure you want to permanently delete this charge type?"
                              actionLabel="Yes, Delete"
                              onConfirm={() => handleDelete(item.id)}
                              trigger={
                                <Button
                                  variant="destructive"
                                  size="sm"
                                >
                                <MdDelete />
                              </Button>
                              }
                            />                        
                          </Can>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={modules.length + 2} className="text-center p-4">
                      No charge types found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm">
                Page {currentPage} of {totalPages}
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  Prev
                </Button>

                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <ChargeTypeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        defaultData={
          editItem
            ? {
              id: editItem.id,
              name: editItem.name,
              modules: editItem.modules || [],
            }
            : null
        }
        modules={modules}
      />
    </Card>
  );
}
