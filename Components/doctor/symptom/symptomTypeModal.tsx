"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

type Props = {
  initialValue?: string
  onSubmit: (name: string) => Promise<void>
}

export function SymptomTypeModal({ initialValue = "", onSubmit }: Props) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(initialValue)

  const handleSubmit = async () => {
    await onSubmit(name)
    setOpen(false)
    setName("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          {initialValue ? "Edit" : "Add Symptom"}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialValue ? "Edit Symptom" : "Add Symptom"}
          </DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Symptom name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
