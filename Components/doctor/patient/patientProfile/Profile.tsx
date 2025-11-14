"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useSearchParams, useParams } from "next/navigation";

import { toast } from "sonner";
import MaskedInput from "@/components/InputMask";

function Profile() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState("/images/placeholder.jpg");
  const [activeSection, setActiveSection] = useState<
    "basic" | "address" | "doctor"
  >("basic");
  const [editMode, setEditMode] = useState(false);
  const [patientInfo, setPatientInfo] = useState<any>();
  const [patientData, setPatientData] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    gender: "",
    dob: "",
    bloodGroup: "",
    address: "",
    city: "",
    state: "",
    areaOrPin: "",
    referredByDr: "",
  });
  const handleAvatarClick = () => {
    if (editMode) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setAvatarUrl(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditToggle = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    // Optional: Reset state to previous values
  };

  const handleSave = async () => {
    if (!patientInfo?.id) return;
    console.log("Payload sent to API:", patientData);
    console.log("Updating ID:", patientInfo.id);
    const payload = {
      ...patientData,
      dob: patientData.dob === "" ? null : patientData.dob,
    };
    try {
      const response = await fetch(`/api/patients/${patientInfo.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to update patient");
      }

      setPatientInfo(result.data);
      setEditMode(false);
      toast.success("Patient updated successfully!");
    } catch (err) {
      console.error("Error updating patient:", err);
      toast.error(err instanceof Error ? err.message : "Failed to update patient");
    }
  };

  const params = useParams();
  const { id } = params;

  // ✅ Get patient name from query string (?name=John)
  const searchParams = useSearchParams();
  const name = searchParams.get("name");

  useEffect(() => {
    if (!patientInfo) return;

    setPatientData({
      name: patientInfo.name || "",
      email: patientInfo.email || "",
      mobileNumber: patientInfo.mobileNumber || "",
      gender: patientInfo.gender || "",
      dob: patientInfo.dob || "",
      bloodGroup: patientInfo.bloodGroup || "",
      address: patientInfo.address || "",
      city: patientInfo.city || "",
      state: patientInfo.state || "",
      areaOrPin: patientInfo.areaOrPin || "",
      referredByDr: patientInfo.referredByDr || "",
    });
  }, [patientInfo]);
  useEffect(() => {
    if (!id) return;

    const fetchPatient = async () => {
      try {
        const response = await fetch(`/api/patients/${id}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Failed to fetch patient");
        }

        setPatientInfo(result.data);
      } catch (error) {
        console.error("Error fetching patient:", error);
        toast.error("Failed to load patient data");
      }
    };

    fetchPatient();
  }, [id]);
  return (
    <div className="flex justify-center mt-10">
      <Card className="w-full max-w-5xl p-6">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Patient Profile</CardTitle>
          {!editMode && (
            <Button variant="outline" onClick={handleEditToggle}>
              Edit
            </Button>
          )}
        </CardHeader>

        <CardContent>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Sidebar */}
            <div className="flex flex-col items-center lg:w-1/3 gap-6">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center gap-4">
                <Avatar
                  className={`w-20 h-20 border-2 ${editMode ? "cursor-pointer" : "cursor-default"
                    }`}
                  onClick={handleAvatarClick}
                >
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback>
                    {(() => {
                      if (!patientData.name) return "P"; // default fallback
                      const words = patientData.name.trim().split(" ");
                      if (words.length === 1) return words[0][0]?.toUpperCase();
                      return (
                        words[0][0] + words[words.length - 1][0]
                      ).toUpperCase();
                    })()}
                  </AvatarFallback>
                </Avatar>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                {editMode && (
                  <Button
                    onClick={handleAvatarClick}
                    variant="outline"
                    className="w-full"
                  >
                    Upload Photo
                  </Button>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex flex-col w-full gap-2">
                <Button
                  variant={activeSection === "basic" ? "default" : "outline"}
                  onClick={() => setActiveSection("basic")}
                >
                  Basic Info
                </Button>
                <Button
                  variant={activeSection === "address" ? "default" : "outline"}
                  onClick={() => setActiveSection("address")}
                >
                  Address
                </Button>
                <Button
                  variant={activeSection === "doctor" ? "default" : "outline"}
                  onClick={() => setActiveSection("doctor")}
                >
                  Referred Doctor
                </Button>
              </div>
            </div>

            {/* Right Form Section */}
            <div className="flex-1 px-4 py-6">
              {/* Basic Info Section */}
              {activeSection === "basic" && (
                <div className="grid grid-cols-2 gap-4">
                  {/* <div>
                    <Label htmlFor="id" className="mb-2">
                      Patient's ID
                    </Label>
                    <div id="patientID" className="input-field">
                      {id}
                    </div>
                  </div> */}

                  <div>
                    <Label htmlFor="name" className="mb-2">
                      Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      disabled={!editMode}
                      value={patientData.name}
                      onChange={(e) =>
                        setPatientData({ ...patientData, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="mb-2">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      disabled={!editMode}
                      value={patientData.email}
                      onChange={(e) =>
                        setPatientData({
                          ...patientData,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="mb-2">
                      Contact Number
                    </Label>
                    <MaskedInput
                      placeholder="Enter your contact number"
                      disabled={!editMode}
                      value={patientData.mobileNumber}
                      onChange={(e) =>
                        setPatientData({
                          ...patientData,
                          mobileNumber: e.target.value.replace(/\D/g, "").slice(-10),
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label className="mb-2">Gender</Label>
                    <Select
                      disabled={!editMode}
                      value={patientData.gender}
                      onValueChange={(value) =>
                        setPatientData({ ...patientData, gender: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dob" className="mb-2">
                      Date of Birth
                    </Label>
                    <Input
                      id="dob"
                      type="date"
                      disabled={!editMode}
                      value={patientData.dob}
                      onChange={(e) =>
                        setPatientData({ ...patientData, dob: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label className="mb-2">Blood Group</Label>
                    <Select
                      disabled={!editMode}
                      value={patientData.bloodGroup}
                      onValueChange={(value) =>
                        setPatientData({ ...patientData, bloodGroup: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Address Section */}
              {activeSection === "address" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label className="mb-2">Full Address</Label>
                    <Input
                      placeholder="Street, City, State, ZIP"
                      disabled={!editMode}
                      value={patientData.address}
                      onChange={(e) =>
                        setPatientData({
                          ...patientData,
                          address: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label className="mb-2">City</Label>
                    <Input
                      placeholder="Enter city"
                      disabled={!editMode}
                      value={patientData.city}
                      onChange={(e) =>
                        setPatientData({ ...patientData, city: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label className="mb-2">State</Label>
                    <Input
                      placeholder="Enter state"
                      disabled={!editMode}
                      value={patientData.state}
                      onChange={(e) =>
                        setPatientData({ ...patientData, state: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label className="mb-2">ZIP Code</Label>
                    <Input
                      placeholder="Enter zip code"
                      disabled={!editMode}
                      value={patientData.areaOrPin}
                      onChange={(e) =>
                        setPatientData({
                          ...patientData,
                          areaOrPin: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {/* Referred Doctor Section */}
              {activeSection === "doctor" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2">Referred Doctor</Label>
                    <Input
                      placeholder="Enter doctor's name"
                      disabled={!editMode}
                      value={patientData.referredByDr}
                      onChange={(e) =>
                        setPatientData({
                          ...patientData,
                          referredByDr: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label className="mb-2">Specialty</Label>
                    <Input
                      placeholder="E.g., Cardiologist"
                      disabled={!editMode}
                    />
                  </div>
                </div>
              )}

              {/* Edit / Save / Cancel Buttons */}
              {editMode && (
                <div className="mt-6 flex gap-4">
                  <Button onClick={handleSave}>Save Changes</Button>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Profile;
