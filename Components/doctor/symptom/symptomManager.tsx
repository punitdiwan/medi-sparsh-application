"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/model/ConfirmationModel"
import { useAbility } from "@/components/providers/AbilityProvider"
import { Can } from "@casl/react"
import { SymptomModal } from "./symptomModal"

type Symptom = {
  id: string
  head: string
  type: string
  description?: string
}

// Dummy data
const DUMMY_SYMPTOMS: Symptom[] = [
  {
    id: "1",
    type: "Skin",
    head: "Atopic dermatitis (Eczema)",
    description: "Atopic dermatitis usually develops in early childhood and is more common in people who have a family history of the condition.",
  },
  {
    id: "2",
    type: "Fever",
    head: "High-grade fever",
    description: "Fever above 102°F lasting more than 3 days.",
  },
]

export default function SymptomManager() {
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const ability = useAbility()

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setSymptoms(DUMMY_SYMPTOMS)
      setLoading(false)
    }, 500)
  }, [])

  // Filter by search
  const filteredSymptoms = useMemo(() => {
    if (!search.trim()) return symptoms
    return symptoms.filter((s) =>
      s.head.toLowerCase().includes(search.toLowerCase()) ||
      s.type.toLowerCase().includes(search.toLowerCase()) ||
      (s.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
    )
  }, [symptoms, search])

  // Add / Edit
  const handleSave = async (payload: { id?: string; head: string; type: string; description?: string }) => {
    if (!payload.head.trim() || !payload.type.trim()) {
      toast.error("Head and Type are required")
      return
    }

    if (payload.id) {
      setSymptoms((prev) => prev.map((s) => (s.id === payload.id ? { ...s, ...payload } : s)))
      toast.success("Symptom updated")
    } else {
      setSymptoms((prev) => [
        ...prev,
        { id: crypto.randomUUID(), head: payload.head, type: payload.type, description: payload.description },
      ])
      toast.success("Symptom added")
    }
  }

  // Delete
  const handleDelete = (id: string) => {
    setSymptoms((prev) => prev.filter((s) => s.id !== id))
    toast.success("Symptom deleted")
  }

  // Unique heads for modal dropdown
  const symptomHeads = useMemo(() => {
    return Array.from(new Set(symptoms.map((s) => s.head)))
  }, [symptoms])

  return (
    <Card className="shadow-md border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Symptoms Head List</CardTitle>
        <CardDescription className="mt-1">Add, edit and manage patient symptoms.</CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="space-y-4 p-4">
        <div className="flex justify-between items-center gap-4">
          <Input
            placeholder="Search symptoms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />

          <Can I="create" a="symptoms" ability={ability}>
            <SymptomModal symptomHeads={symptomHeads} onSubmit={handleSave} />
          </Can>
        </div>

        <Table className="mt-4 w-full overflow-auto">
            <TableHeader>
                <TableRow>
                <TableHead>Symptoms Head</TableHead>
                <TableHead>Symptoms Type</TableHead>
                <TableHead>Symptoms Description</TableHead>
                <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Loading symptoms...
                    </TableCell>
                </TableRow>
                ) : filteredSymptoms.length > 0 ? (
                filteredSymptoms.map((s) => (
                    <TableRow key={s.id}>
                    <TableCell className="whitespace-normal max-w-[150px]">{s.head}</TableCell>
                    <TableCell className="whitespace-normal max-w-[200px]">{s.type}</TableCell>
                    <TableCell className="whitespace-normal max-w-[400px] wrap-break-words">{s.description}</TableCell>
                    <TableCell className="text-right space-x-2">
                        <Can I="update" a="symptoms" ability={ability}>
                        <SymptomModal
                            initialData={s}
                            symptomHeads={symptomHeads}
                            onSubmit={handleSave}
                        />
                        </Can>
                        <Can I="delete" a="symptoms" ability={ability}>
                        <ConfirmDialog
                            trigger={<Button size="sm" variant="destructive">Delete</Button>}
                            title="Delete Symptom?"
                            description="Are you sure you want to delete this symptom?"
                            actionLabel="Delete"
                            cancelLabel="Cancel"
                            onConfirm={() => handleDelete(s.id)}
                        />
                        </Can>
                    </TableCell>
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No symptoms found.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>

      </CardContent>
    </Card>
  )
}
