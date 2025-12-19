"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/model/ConfirmationModel"
import { useAbility } from "@/components/providers/AbilityProvider"
import { Can } from "@casl/react"
import { SymptomTypeModal } from "./symptomTypeModal"

type Symptom = {
  id: string
  name: string
  createdAt: string
}

const DUMMY_SYMPTOMS: Symptom[] = [
  { id: "1", name: "Fever", createdAt: new Date().toISOString() },
  { id: "2", name: "Headache", createdAt: new Date().toISOString() },
  { id: "3", name: "Cough", createdAt: new Date().toISOString() },
]

export default function SymptomTypeManager() {
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

  const filteredSymptoms = useMemo(() => {
    return symptoms.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [symptoms, search])

  const handleSave = async (payload: { id?: string; name: string }) => {
    if (!payload.name.trim()) {
      toast.error("Symptom name is required")
      return
    }

    if (payload.id) {
      // Update
      setSymptoms((prev) =>
        prev.map((s) =>
          s.id === payload.id ? { ...s, name: payload.name } : s
        )
      )
      toast.success("Symptom updated")
    } else {
      // Create
      setSymptoms((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          name: payload.name,
          createdAt: new Date().toISOString(),
        },
      ])
      toast.success("Symptom added")
    }
  }

  const handleDelete = async (id: string) => {
    setSymptoms((prev) => prev.filter((s) => s.id !== id))
    toast.success("Symptom deleted")
  }

  return (
    <Card className="shadow-md border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div>
          <CardTitle className="text-2xl font-bold">
            Symptom Type Manager
          </CardTitle>
          <CardDescription className="mt-1">
            Add, edit and manage patient symptoms type.
          </CardDescription>
        </div>
      </CardHeader>

      <Separator />

      <CardContent>
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center gap-4">
            <Input
              placeholder="Search symptoms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />

            <Can I="create" a="symptomsType" ability={ability}>
              <SymptomTypeModal
                onSubmit={async (name) => {
                  await handleSave({ name })
                }}
              />
            </Can>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symptom Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground">
                    Loading symptoms...
                  </TableCell>
                </TableRow>
              ) : filteredSymptoms.length > 0 ? (
                filteredSymptoms.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.name}</TableCell>

                    <TableCell className="text-right space-x-2">
                      <Can I="update" a="symptomsType" ability={ability}>
                        <SymptomTypeModal
                          initialValue={s.name}
                          onSubmit={async (name) => {
                            await handleSave({ id: s.id, name })
                          }}
                        />
                      </Can>

                      <Can I="delete" a="symptomsType" ability={ability}>
                        <ConfirmDialog
                          trigger={
                            <Button size="sm" variant="destructive">
                              Delete
                            </Button>
                          }
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
                  <TableCell colSpan={2} className="text-center text-muted-foreground">
                    No symptoms found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
