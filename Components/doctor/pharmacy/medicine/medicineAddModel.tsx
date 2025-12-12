"use client";

import { useState, useEffect } from "react";

export type MedicineForm = {
  name: string;
  category: string;
  company: string;
  composition: string;
  group: string;
  unit: string;
  minLevel: string;
  reorderLevel: string;
  tax: string;
  packing: string;
  vat: string;
  rackNumber: string;
  note: string;
  photo: File | null;
};

interface MedicineModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: MedicineForm) => void;
}

export default function MedicineModal({ open, onClose, onSubmit }: MedicineModalProps) {
  const initialForm: MedicineForm = {
    name: "",
    category: "",
    company: "",
    composition: "",
    group: "",
    unit: "",
    minLevel: "",
    reorderLevel: "",
    tax: "",
    packing: "",
    vat: "",
    rackNumber: "",
    note: "",
    photo: null,
  };

  const [form, setForm] = useState<MedicineForm>(initialForm);
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    if (!open) {
      setForm(initialForm);
      setPreview("");
    }
  }, [open]);

  const handleChange = (key: keyof MedicineForm, value: any) => {
    setForm({ ...form, [key]: value });
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    handleChange("photo", file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const submitForm = () => {
    onSubmit(form);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
      <div className="bg-white dark:bg-gray-900 w-full h-full md:h-auto md:max-w-6xl md:rounded-xl relative flex flex-col shadow-xl">
        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Add Medicine</h2>
          <button
            onClick={onClose}
            className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-2xl font-bold"
          >
            &times;
          </button>
        </div>

        {/* FORM */}
        <div className="p-4 overflow-y-auto flex-1 max-h-[80vh]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { key: "name", label: "Medicine Name *" },
              { key: "category", label: "Category *" },
              { key: "company", label: "Company" },
              { key: "composition", label: "Composition" },
              { key: "group", label: "Group" },
              { key: "unit", label: "Unit *" },
              { key: "minLevel", label: "Min Level", type: "number" },
              { key: "reorderLevel", label: "Re-Order Level", type: "number" },
              { key: "tax", label: "Tax %", type: "number" },
              { key: "packing", label: "Packing *" },
              { key: "vat", label: "VAT A/C" },
              { key: "rackNumber", label: "Rack Number" },
            ].map((field) => (
              <div key={field.key}>
                <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">
                  {field.label}
                </label>
                {field.key === "unit" || field.key === "category" || field.key === "company" || field.key === "group" ? (
                  <select
                    value={(form as any)[field.key]}
                    onChange={(e) => handleChange(field.key as keyof MedicineForm, e.target.value)}
                    className="w-full border rounded p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select</option>
                    <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                  </select>
                ) : (
                  <input
                    type={field.type ?? "text"}
                    value={(form as any)[field.key]}
                    onChange={(e) => handleChange(field.key as keyof MedicineForm, e.target.value)}
                    className="w-full border rounded p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
            ))}
          </div>

          {/* PHOTO */}
          <div className="mt-4">
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Medicine Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="border p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
            />
            {preview && (
              <img
                src={preview}
                className="mt-2 h-32 w-32 object-cover rounded border border-gray-300 dark:border-gray-600"
              />
            )}
          </div>

          {/* NOTE */}
          <div className="mt-4">
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">Note</label>
            <textarea
              className="w-full border rounded p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.note}
              onChange={(e) => handleChange("note", e.target.value)}
            />
          </div>

          {/* SUBMIT BUTTON */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={submitForm}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Save Medicine
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
