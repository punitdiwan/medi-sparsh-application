"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";

// Mock services stored in state (frontend only)
const initialServices = [
  {
    id: "1",
    name: "General Consultation",
    category: "Consultation",
    amount: "500",
    duration: "15",
    description: "Basic consultation",
  },
  {
    id: "2",
    name: "X-Ray",
    category: "Imaging",
    amount: "1000",
    duration: "10",
    description: "Chest X-Ray",
  },
  {
    id: "3",
    name: "Follows up",
    category: "FollowsUp",
    amount: "1000",
    duration: "10",
    description: "Chest X-Ray",
  },
 
];

export default function Services() {
  const [services, setServices] = useState(initialServices);

  return (
    <div className="p-5">
      <Card className="p-4">
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Our Services</h2>
          <Link href="/doctor/services/newServices">
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" /> Add Service
            </Button>
          </Link>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
  <TableRow>
    <TableHead className="font-semibold uppercase">Service Name</TableHead>
    <TableHead className="font-semibold uppercase">Category</TableHead>
    <TableHead className="font-semibold uppercase">Amount (₹)</TableHead>
    <TableHead className="font-semibold uppercase">Action</TableHead>
  </TableRow>
</TableHeader>


            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>{service.name}</TableCell>
                  <TableCell>{service.category}</TableCell>
                  <TableCell>{service.amount}</TableCell>
                  <TableCell className="flex gap-3">
                    <Link href={`/doctor/services/edit/${service.id}`}>
                      <Pencil className="mr-1 h-4 w-4" />
                    </Link>

                    <Trash2 className="mr-1 h-4 w-4" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
