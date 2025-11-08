"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AddServicePage() {
  const router = useRouter()
  const [service, setService] = useState({
    name: "",
    category: "",
    amount: "",
    description: "",
  })

  const handleChange = (field: string, value: string) => {
    setService((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("New Service Added:", service)
    // ✅ You can later integrate this with backend (POST /api/services)
    router.push("/doctor/services")
  }

  return (
    <div className="flex justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <h2 className="text-2xl font-semibold">Add New Service</h2>
          <p className="text-sm text-muted-foreground">
            Create a new service offered at your clinic.
          </p>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">

            {/* Service Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Service Name</Label>
              <Input
                id="name"
                placeholder="e.g., General Consultation"
                value={service.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                onValueChange={(value) => handleChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Consultation">Consultation</SelectItem>
                  <SelectItem value="Lab Test">Lab Test</SelectItem>
                  <SelectItem value="Imaging">Imaging</SelectItem>
                  <SelectItem value="Procedure">Procedure</SelectItem>
                  <SelectItem value="Package">Package</SelectItem>
                  <SelectItem value="followsUp">FollowsUp</SelectItem>

                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="e.g., 500"
                value={service.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                required
              />
            </div>


            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Short description about this service..."
                value={service.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3 p-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/doctor/services")}
            >
              Cancel
            </Button>
            <Button
            type="button"
              
              onClick={() => router.push("/doctor/services")}>
                Save Service
                </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
