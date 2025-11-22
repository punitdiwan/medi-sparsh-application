"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MdDelete, MdEdit } from "react-icons/md";
import { ChargeTypeModal } from "./ChargeTypeModal";

type ChargeTypeFlags = {
  opd: boolean;
  ipd: boolean;
  lab: boolean;
  radiology: boolean;
  ambulance?: boolean;
};

type ChargeTypeItem = {
  id: string;
  chargeName: string;
  flags: ChargeTypeFlags;
};

const MODULES = ["opd", "ipd", "lab", "radiology", "ambulance"] as const;

export default function ChargeTypeManager() {
  const [data, setData] = useState<ChargeTypeItem[]>([
    {
      id: "1",
      chargeName: "Registration Charge",
      flags: { opd: true, ipd: false, lab: false, radiology: true, ambulance: false },
    },
    {
      id: "2",
      chargeName: "Doctor Consultation",
      flags: { opd: true, ipd: true, lab: false, radiology: false, ambulance: false },
    },
    {
      id: "3",
      chargeName: "Blood Test",
      flags: { opd: false, ipd: false, lab: true, radiology: false, ambulance: false },
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<ChargeTypeItem | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const paginated = data.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const totalPages = Math.ceil(data.length / rowsPerPage);

  const toggleFlag = (id: string, module: keyof ChargeTypeFlags) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, flags: { ...item.flags, [module]: !item.flags[module] } }
          : item
      )
    );
  };

  const handleSubmit = (dataFromModal: any) => {
    if (dataFromModal.id) {
      setData((prev) =>
        prev.map((item) =>
          item.id === dataFromModal.id
            ? {
                ...item,
                chargeName: dataFromModal.name,
                flags: dataFromModal.flags,
              }
            : item
        )
      );
    } else {
      setData((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          chargeName: dataFromModal.name,
          flags: dataFromModal.flags,
        },
      ]);
    }

    setModalOpen(false);
  };

  return (
    <div className="p-6 bg-background space-y-4">

      <div className="flex justify-between items-center">

        <Button
          onClick={() => {
            setEditItem(null);
            setModalOpen(true);
          }}
        >
          + Add Charge Type
        </Button>
      </div>

      <div className="overflow-auto border rounded-md max-h-[430px]">
        <table className="w-full table-auto border-collapse">
          <thead className="sticky top-0 bg-muted z-10">
            <tr>
              <th className="border p-2 text-left sticky left-0 bg-muted z-20">
                Charge Name
              </th>

              {MODULES.map((mod) => (
                <th key={mod} className="border p-2 text-center">
                  {mod.toUpperCase()}
                </th>
              ))}

              <th className="border p-2 text-center sticky right-0 bg-muted z-20">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((item) => (
              <tr key={item.id}>
                <td className="border p-2 sticky left-0 bg-background z-10">
                  {item.chargeName}
                </td>

                {MODULES.map((mod) => (
                  <td key={mod} className="border p-2 text-center">
                    <input
                      type="checkbox"
                      checked={item.flags[mod] || false}
                      onChange={() => toggleFlag(item.id, mod)}
                    />
                  </td>
                ))}

                <td className="border p-2 sticky right-0 bg-background z-10">
                  <div className="flex gap-2 justify-center">
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

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        setData((prev) => prev.filter((i) => i.id !== item.id))
                      }
                    >
                      <MdDelete />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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

      <ChargeTypeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        defaultData={
          editItem
            ? {
                id: editItem.id,
                name: editItem.chargeName,
                flags: editItem.flags,
              }
            : null
        }
      />
    </div>
  );
}
