"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

export default function UploadReportPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    patientName: "",
    patientId: "",
    appointmentDate: "",
    reportFile: null as File | null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === "reportFile") {
      setFormData({ ...formData, reportFile: files ? files[0] : null });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/doctor/reports");
  };

  return (
    <div className="p-6 flex justify-center">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Upload Lab Report</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Patient Name */}
            <div className="flex flex-col space-y-1">
              <Label htmlFor="patientName">Patient Name</Label>
              <Input
                id="patientName"
                name="patientName"
                placeholder="Enter patient name"
                value={formData.patientName}
                onChange={handleChange}
                required
              />
            </div>

            {/* Patient ID */}
            <div className="flex flex-col space-y-1">
              <Label htmlFor="patientId">Patient ID</Label>
              <Input
                id="patientId"
                name="patientId"
                placeholder="Enter patient ID"
                value={formData.patientId}
                onChange={handleChange}
                required
              />
            </div>

            {/* Appointment Date */}
            <div className="flex flex-col space-y-1">
              <Label htmlFor="appointmentDate">Appointment Date</Label>
              <Input
                id="appointmentDate"
                name="appointmentDate"
                type="date"
                value={formData.appointmentDate}
                onChange={handleChange}
                required
              />
            </div>

            {/* File Upload */}
            <div className="flex flex-col space-y-1">
              <Label htmlFor="reportFile">Upload Report (PDF/Image)</Label>
              <Input
                id="reportFile"
                name="reportFile"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleChange}
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3 mt-5">
            <Link href="/doctor/reports">
            <Button variant="outline">Cancel</Button></Link>
            <Button type="submit">Submit</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
