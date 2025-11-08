"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pencil, Trash2 } from "lucide-react";
import AddMemberModal from "@/Components/doctor/ourTeam/AddMemberModal"


const teamMembers = [
    { id:"1",name: "Dr. Ramesh Sharma", role: "Doctor", email: "ramesh@emr.com" },
    { id: "2", name: "Pooja Verma", role: "Receptionist", email: "pooja@emr.com" },
    { id: "3", name: "geeta Verma", role: "Admin", email: "geeta@emr.com" },

  ]
export default function TeamPage() {
  const [open, setOpen] = useState(false);
 
const [members, setMembers] = useState(teamMembers);
  

  return (
    
    <div className="p-5">

    <Card className="p-4">
      <CardHeader className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Team Members</h2>
        <Link href="/doctor/settings/ourTeam/newMember" >
            <Button variant="outline">
                <Plus className=" h-4 w-4" /> Add Member
            </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Email</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>{member.name}</TableCell>
                <TableCell>{member.role}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell className="flex gap-3">
                    <Link href={`doctor/settings/ourTeam/edit/${member.id}`}>
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
  )
}
