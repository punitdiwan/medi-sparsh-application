"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateUserProfile } from "@/lib/actions/updateUserProfile";
import { Pencil, CirclePlus, Loader2, Camera } from 'lucide-react';
import { useAuth } from "@/context/AuthContext";
// ------- TYPES -------
interface HospitalMetadata {
  email: string;
  phone: string;
  address: string;
}

interface Hospital {
  hospitalId: string;
  name: string;
  slug: string;
  logo: string | null;
  metadata: HospitalMetadata;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  emailVerified?: boolean;
}

interface AdminProfileProps {
  data: {
    userData: UserData;
    hospital: Hospital;
    memberRole: string;
  };
}

const AdminProfileUI: React.FC<AdminProfileProps> = ({ data }) => {
  const { userData, hospital, memberRole } = data;
  const [isEditingClinic, setIsEditingClinic] = useState(false);
  const [isEditingOwner, setIsEditingOwner] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingUser, setIsUploadingUser] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const userFileInputRef = React.useRef<HTMLInputElement>(null);
  const { user, setUser } = useAuth();
  const [clinicFormData, setClinicFormData] = useState({
    name: hospital?.name ?? "",
    email: hospital?.metadata?.email ?? "",
    phone: hospital?.metadata?.phone ?? "",
    address: hospital?.metadata?.address ?? "",
  });
  const [ownerFormData, setOwnerFormData] = useState({
    name: userData?.name ?? "",
    email: userData?.email ?? "",
  });

  // Update form data when hospital or user data changes
  useEffect(() => {
    setClinicFormData({
      name: hospital?.name ?? "",
      email: hospital?.metadata?.email ?? "",
      phone: hospital?.metadata?.phone ?? "",
      address: hospital?.metadata?.address ?? "",
    });
    setOwnerFormData({
      name: userData?.name ?? "",
      email: userData?.email ?? "",
    });
  }, [hospital, userData]);

  const handleClinicInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClinicFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOwnerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOwnerFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClinicCancel = () => {
    // Reset form to original values
    setClinicFormData({
      name: hospital?.name ?? "",
      email: hospital?.metadata?.email ?? "",
      phone: hospital?.metadata?.phone ?? "",
      address: hospital?.metadata?.address ?? "",
    });
    setIsEditingClinic(false);
  };

  const handleOwnerCancel = () => {
    // Reset form to original values
    setOwnerFormData({
      name: userData?.name ?? "",
      email: userData?.email ?? "",
    });
    setIsEditingOwner(false);
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        // Administration profile currently shows Hospital Logo, so we upload as clinic logo
        const response = await fetch("/api/upload/clinic-logo", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          toast.success("Clinic logo updated successfully");
          // Update local state and global auth context if needed
          if (user) {
            setUser({
              ...user,
              hospital: {
                ...user.hospital!,
                logo: result.data.imageUrl
              }
            });
          }
        } else {
          toast.error(result.error || "Failed to upload image");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("An error occurred while uploading the image");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleUserAvatarClick = () => userFileInputRef.current?.click();

  const handleUserFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsUploadingUser(true);
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload/profile-image", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          toast.success("Owner image updated successfully");
          if (user) {
            setUser({
              ...user,
              userData: {
                ...user.userData,
                image: result.data.imageUrl
              }
            });
          }
        } else {
          toast.error(result.error || "Failed to upload image");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("An error occurred while uploading the image");
      } finally {
        setIsUploadingUser(false);
      }
    }
  };

  const handleClinicSave = async () => {
    try {
      setIsSaving(true);

      // Validate required fields
      if (!clinicFormData.name.trim()) {
        toast.error("Hospital name is required");
        return;
      }

      const clinicData = {
        name: clinicFormData.name,
        email: clinicFormData.email,
        phone: clinicFormData.phone,
        address: clinicFormData.address,
      };

      const response = await fetch("/api/clinic", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clinicData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Hospital details updated successfully");
        setIsEditingClinic(false);
      } else {
        toast.error(result.error || "Failed to update hospital details");
      }
    } catch (error) {
      console.error("Error saving hospital details:", error);
      toast.error("Failed to save hospital details");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOwnerSave = async () => {
    try {
      setIsSaving(true);

      // Validate required fields
      if (!ownerFormData.name.trim()) {
        toast.error("Owner name is required");
        return;
      }
      if (!ownerFormData.email.trim()) {
        toast.error("Owner email is required");
        return;
      }

      const result = await updateUserProfile({
        name: ownerFormData.name,
        email: ownerFormData.email,
      });

      if (result.success) {
        toast.success("Owner information updated successfully");
        setIsEditingOwner(false);
      } else {
        toast.error(result.error || "Failed to update owner information");
      }
    } catch (error) {
      console.error("Error saving owner information:", error);
      toast.error("Failed to save owner information");
    } finally {
      setIsSaving(false);
    }
  };

  const canEdit = memberRole === "owner";

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card className="shadow-lg border rounded-xl bg-custom-gradient">

        <CardHeader className="flex flex-col items-center gap-4">

          {/* Hospital Logo */}
          <div className="relative w-24 h-24 rounded-full shadow flex items-center justify-center overflow-visible border-2 border-primary/20">
            <img
              src={hospital?.logo || "/palceholderImg.jpg"}
              alt="Hospital Logo"
              className="w-full h-full object-cover rounded-full"
            />

            {/* Half inside / half outside icon */}
            <Button
              variant="secondary"
              type="button"
              onClick={handleAvatarClick}
              disabled={isUploading}
              className="absolute -bottom-2 -right-2 p-0 shadow bg-background rounded-full w-8 h-8">
              {isUploading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : hospital.logo ? (
                <Pencil size={18} className="p-0 w-4 h-4 text-indigo-800 dark:text-white" />
              ) : (
                <CirclePlus size={18} className="p-0 w-4 h-4 text-indigo-800 dark:text-white" />
              )}
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>




          <CardTitle className="text-xl font-bold border-b pb-2 w-full text-center">
            Admin Profile
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-8 mt-4">

          {/* Hospital Info */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-lg">Hospital Information</h2>
              {canEdit && !isEditingClinic && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingClinic(true)}
                >
                  Edit
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div className="flex flex-col gap-1">
                <Label>Hospital Name</Label>
                <Input
                  name="name"
                  className="bg-background text-foreground"
                  value={clinicFormData.name}
                  readOnly={!isEditingClinic}
                  onChange={handleClinicInputChange}
                  disabled={!isEditingClinic}
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label>Email</Label>
                <Input
                  name="email"
                  className="bg-background text-foreground"
                  value={clinicFormData.email}
                  readOnly={!isEditingClinic}
                  onChange={handleClinicInputChange}
                  disabled={!isEditingClinic}
                  type="email"
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label>Contact Number</Label>
                <Input
                  name="phone"
                  className="bg-background text-foreground"
                  value={clinicFormData.phone}
                  readOnly={!isEditingClinic}
                  onChange={handleClinicInputChange}
                  disabled={!isEditingClinic}
                />
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <Label>Address</Label>
                <Input
                  name="address"
                  className="bg-background text-foreground"
                  value={clinicFormData.address}
                  readOnly={!isEditingClinic}
                  onChange={handleClinicInputChange}
                  disabled={!isEditingClinic}
                />
              </div>

            </div>

            {/* Edit Action Buttons */}
            {isEditingClinic && (
              <div className="flex gap-3 justify-end mt-6">
                <Button
                  variant="outline"
                  onClick={handleClinicCancel}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleClinicSave}
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>

          {/* Owner Info */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-lg">Owner Information</h2>
              {canEdit && !isEditingOwner && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingOwner(true)}
                >
                  Edit
                </Button>
              )}
            </div>

            <div className="flex items-center gap-6 mb-5">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">

                <div className="flex flex-col gap-1">
                  <Label>Owner Name</Label>
                  <Input
                    name="name"
                    value={ownerFormData.name}
                    onChange={handleOwnerInputChange}
                    disabled={!isEditingOwner}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label>Owner Email</Label>
                  <Input
                    name="email"
                    type="email"
                    value={ownerFormData.email}
                    onChange={handleOwnerInputChange}
                    disabled={!isEditingOwner}
                  />
                </div>

                <div className="flex flex-col gap-1 md:col-span-2">
                  <Label>Owner Image</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border bg-gray-100 flex-shrink-0">
                      <img
                        src={userData?.image || "/palceholderImg.jpg"}
                        alt="Owner"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleUserAvatarClick}
                      disabled={isUploadingUser}
                      className="gap-2"
                    >
                      {isUploadingUser ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                      {userData?.image ? "Change Image" : "Upload Image"}
                    </Button>
                    <input
                      type="file"
                      ref={userFileInputRef}
                      onChange={handleUserFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Edit Action Buttons */}
            {isEditingOwner && (
              <div className="flex gap-3 justify-end mt-6">
                <Button
                  variant="outline"
                  onClick={handleOwnerCancel}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleOwnerSave}
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProfileUI;
