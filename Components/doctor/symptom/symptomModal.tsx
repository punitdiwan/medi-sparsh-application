"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { z } from "zod"

type Props = {
  symptomHeads: string[] // list of existing heads for dropdown
  initialData?: {
    head?: string
    type?: string
    description?: string
  }
  onSubmit: (data: { head: string; type: string; description?: string }) => Promise<void>
}

const symptomSchema = z.object({
  head: z.string().min(1, "Symptoms Head is required"),
  type: z.string().min(1, "Symptoms Type is required"),
  description: z.string().optional(),
})

export function SymptomModal({ symptomHeads, initialData, onSubmit }: Props) {
  const [open, setOpen] = useState(false)
  const [head, setHead] = useState(initialData?.head || "")
  const [type, setType] = useState(initialData?.type || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initialData) {
      setHead(initialData.head || "")
      setType(initialData.type || "")
      setDescription(initialData.description || "")
    }
  }, [initialData, open])

  const handleSubmit = async () => {
    const result = symptomSchema.safeParse({ head, type, description })
    if (!result.success) {
      toast.error(result.error.message)
      return
    }

    setLoading(true)
    await onSubmit({ head, type, description })
    setLoading(false)
    setOpen(false)
    setHead("")
    setType("")
    setDescription("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">{initialData ? "Edit" : "Add Symptom"}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Symptom" : "Add Symptom"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label>Symptoms Type *</Label>
            <Select value={head} onValueChange={setHead}>
              <SelectTrigger>
                <SelectValue placeholder="Select or type head" />
              </SelectTrigger>
              <SelectContent>
                {symptomHeads.map((h) => (
                  <SelectItem key={h} value={h}>{h}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Symptoms Head *</Label>
            <Input
              placeholder="Enter symptom type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea
              placeholder="Optional description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
