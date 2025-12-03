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
import { authClient, useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import MaskedInput from "@/components/InputMask";
import { useAuth } from "@/context/AuthContext";
import AdminProfileUI from "./adminProfile/page";
import ChangePasswordForm from "@/Components/forms/ChangePasswordForm";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
interface StaffData {
    id: string;
    userId: string;
    hospitalId: string;
    name: string;
    mobileNumber: string | null;
    gender: string;
    dob: string | null;
    department: string | null;
    joiningDate: string | null;
    address: string | null;
}

interface DoctorData {
    id: string;
    staffId: string;
    hospitalId: string;
    specialization: any;
    qualification: string;
    experience: string;
    consultationFee: string;
    availability: string | null;
}

interface ProfileData {
    staff: StaffData;
    doctor: DoctorData | null;
    user: {
        id: string;
        email: string;
        name: string;
    };
}
type UserData = {
    id: string;
    email: string;
    name: string;
    image?: string;          // required
    emailVerified?: boolean; // required
};

export default function DoctorProfile() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarUrl, setAvatarUrl] = useState("/images/placeholder.jpg");
    const [showClinicDetails, setShowClinicDetails] = useState(false);
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    const { user } = useAuth();
    // console.log("user data for doctors profile",user);
    const hospital = user?.hospital;
    const canEditClinic = user?.memberRole === "owner";
    const [clinicForm, setClinicForm] = useState({
        name: hospital?.name ?? "",
        email: hospital?.metadata?.email ?? "",
        phone: hospital?.metadata?.phone ?? "",
        address: hospital?.metadata?.address ?? "",
    });

    useEffect(() => {
        if (profileData?.staff) {
            setClinicForm({
                name: hospital?.name ?? "",
                email: hospital?.metadata?.email ?? "",
                phone: hospital?.metadata?.phone ?? "",
                address: hospital?.metadata?.address ?? "",
            });
        }
    }, [profileData]);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        mobileNumber: "",
        gender: "",
        dob: "",
        department: "",
        address: "",
        qualification: "",
        experience: "",
        consultationFee: "",
        specialization: "",
    });

    const { data: session } = useSession();

    const handleAvatarClick = () => fileInputRef.current?.click();
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () =>
                reader.result && setAvatarUrl(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        if (!session?.user?.id) return;

        const fetchProfileData = async () => {
            try {
                setLoading(true);
                const response = await fetch("/api/profile");
                const result = await response.json();
                if (result.success && result.data) {
                    setProfileData(result.data);
                    // Populate form data
                    const { staff, doctor, user } = result.data;
                    setFormData({
                        name: user?.name ?? "",
                        mobileNumber: staff?.mobileNumber ?? "",
                        gender: staff?.gender ?? "",
                        dob: staff?.dob ? staff.dob.slice(0, 10) : "",
                        department: staff?.department ?? "",
                        address: staff?.address ?? "",
                        qualification: doctor?.qualification ?? "",
                        experience: doctor?.experience ?? "",
                        consultationFee: doctor?.consultationFee ?? "",
                        specialization:
                            Array.isArray(doctor?.specialization) &&
                                doctor.specialization.length > 0 &&
                                doctor.specialization[0]?.name
                                ? doctor.specialization[0].name
                                : "",
                    });


                } else {
                    toast.error(result.error || "Failed to load profile");
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
                toast.error("Failed to load profile data");
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [session?.user?.id]);

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSaveProfile = async () => {
        try {
            setSaving(true);

            const updateData: any = {
                name: formData.name,
                mobileNumber: formData.mobileNumber,
                gender: formData.gender,
                dob: formData.dob || null,
                department: formData.department,
                address: formData.address,
            };

            if (profileData?.doctor) {
                updateData.doctorData = {
                    specialization: formData.specialization
                        ? [{ name: formData.specialization }]
                        : profileData.doctor.specialization,
                    qualification: formData.qualification,
                    experience: formData.experience,
                    consultationFee: formData.consultationFee,
                };
            }

            const response = await fetch("/api/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updateData),
            });

            const result = await response.json();

            if (result.success) {
                toast.success("Profile updated successfully");

                const refreshResponse = await fetch("/api/profile");
                const refreshResult = await refreshResponse.json();
                if (refreshResult.success) {
                    setProfileData(refreshResult.data);
                }
            } else {
                toast.error(result.error || "Failed to update profile");
            }
        } catch (error) {
            console.error("Error saving profile:", error);
            toast.error("Failed to save profile");
        } finally {
            setSaving(false);
        }
    };
    const handleSaveClinic = async () => {
        if (!canEditClinic) {
            toast.error("Only organization owners can update clinic details");
            return;
        }

        try {
            setSaving(true);

            const clinicData = {
                name: clinicForm.name,
                email: clinicForm.email,
                phone: clinicForm.phone,
                address: clinicForm.address,
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
                toast.success("Clinic details updated successfully");

                // Refresh user/hospital data
                const refreshResponse = await fetch("/api/profile");
                const refreshResult = await refreshResponse.json();
                if (refreshResult.success) {
                    setProfileData(refreshResult.data);
                }
            } else {
                toast.error(result.error || "Failed to update clinic details");
            }
        } catch (error) {
            console.error("Error saving clinic details:", error);
            toast.error("Failed to save clinic details");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading profile...</div>;
    }
    if (!user) return <div>Loading...</div>;

    if (!profileData || !profileData.doctor) {
        const userData: UserData = {
            id: user?.userData?.id ?? "",
            name: user?.userData?.name ?? "",
            email: user?.userData?.email ?? "",
            image: user?.userData?.image ?? "",
            emailVerified: user?.userData?.emailVerified ?? false
        };

        return (
            <AdminProfileUI
                data={{
                    userData,
                    hospital: user?.hospital!,
                    memberRole: user?.memberRole ?? "admin"
                }}
            />
        );
    }




    return (
        <div className="p-8 flex flex-col lg:flex-row justify-between gap-6  min-h-screen">
            {/* Left: Avatar + Actions */}
            <Card className="lg:w-1/3 flex flex-col items-center  p-6 gap-4 shadow-md">
                <Avatar className="w-20 h-20 border-2 border-gray-200">
                    <AvatarImage src={hospital?.logo ?? "/images/hospital-placeholder.png"} />
                    <AvatarFallback>DR</AvatarFallback>
                </Avatar>

                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />
                <Button
                    onClick={handleAvatarClick}
                    variant="outline"
                    className="w-full"
                >
                    Upload Profile Photo
                </Button>

                <Button
                    onClick={() => setShowClinicDetails((prev) => !prev)}
                    variant="secondary"
                    className="w-full"
                >
                    {showClinicDetails ? "View Doctor Profile" : "View Clinic Details"}
                </Button>
                <Button
                    onClick={() => setShowPasswordModal(true)}
                    variant="default"
                    className="w-full"
                >
                    Change Password
                </Button>

            </Card>

            {/* Right: Profile / Clinic Info */}
            <Card className="lg:w-2/3 p-6 shadow-md">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold border-b pb-2">
                        {showClinicDetails ? "Clinic Details" : "Doctor Profile"}
                    </CardTitle>
                </CardHeader>

                <CardContent className="mt-4 space-y-4">
                    {showClinicDetails ? (
                        // CLINIC SECTION
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <Label className="mb-2">Clinic Name</Label>
                                <Input
                                    value={clinicForm.name}
                                    onChange={(e) => setClinicForm(prev => ({ ...prev, name: e.target.value }))}
                                    readOnly={!canEditClinic}
                                    disabled={!canEditClinic}
                                />
                            </div>
                            <div>
                                <Label className="mb-2">Clinic Email</Label>
                                <Input
                                    value={clinicForm.email}
                                    onChange={(e) => setClinicForm(prev => ({ ...prev, email: e.target.value }))}
                                    readOnly={!canEditClinic}
                                    disabled={!canEditClinic}
                                />
                            </div>

                            <div>
                                <Label className="mb-2">Clinic Contact</Label>
                                <Input
                                    value={clinicForm.phone}
                                    onChange={(e) => setClinicForm(prev => ({ ...prev, phone: e.target.value }))}
                                    readOnly={!canEditClinic}
                                    disabled={!canEditClinic}
                                />
                            </div>

                            {/* <div>
                                <Label className="mb-2">Working Hours</Label>
                                <Input placeholder="Mon–Sat, 10:00 AM – 6:00 PM" />
                            </div> */}
                            <div className="">
                                <Label className="mb-2">Clinic Address</Label>
                                <Input
                                    value={clinicForm.address}
                                    onChange={(e) => setClinicForm(prev => ({ ...prev, address: e.target.value }))}
                                    readOnly={!canEditClinic}
                                    disabled={!canEditClinic}
                                />
                            </div>
                            {canEditClinic && (
                                <Button variant="outline" onClick={handleSaveClinic} disabled={saving}>
                                    {saving ? "Saving..." : "Save Changes"}
                                </Button>
                            )}

                        </div>
                    ) : (
                        //  DOCTOR SECTION
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label className="mb-2">Full Name</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                    placeholder="Dr. Jane Doe"
                                />
                            </div>
                            <div>
                                <Label className="mb-2">Email</Label>
                                <Input
                                    value={profileData.user.email}
                                    disabled
                                    placeholder="jane.doe@example.com"
                                />
                            </div>
                            <div>
                                <Label className="mb-2">Contact Number</Label>
                                <MaskedInput
                                    value={formData.mobileNumber}
                                    onChange={(e) => {
                                        const raw = e.target.value.replace(/\D/g, "").slice(-10);
                                        handleInputChange("mobileNumber", raw);
                                    }}
                                    placeholder="+91 000-000-0000"
                                />
                            </div>
                            <div>
                                <Label className="mb-2">Gender</Label>
                                <Select
                                    value={formData.gender}
                                    onValueChange={(value) => handleInputChange("gender", value)}
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
                                <Label className="mb-2">Date of Birth</Label>
                                <Input
                                    type="date"
                                    value={formData.dob}
                                    onChange={(e) => handleInputChange("dob", e.target.value)}
                                />
                            </div>
                            <div>
                                <Label className="mb-2">Department</Label>
                                <Input
                                    value={formData.department}
                                    onChange={(e) => handleInputChange("department", e.target.value)}
                                    placeholder="Cardiology"
                                />
                            </div>
                            {profileData.doctor && (
                                <>
                                    <div>
                                        <Label className="mb-2">Specialization</Label>
                                        <Input
                                            value={formData.specialization}
                                            onChange={(e) => handleInputChange("specialization", e.target.value)}
                                            placeholder="Cardiology"
                                        />
                                    </div>
                                    <div>
                                        <Label className="mb-2">Qualification</Label>
                                        <Input
                                            value={formData.qualification}
                                            onChange={(e) => handleInputChange("qualification", e.target.value)}
                                            placeholder="MBBS, MD"
                                        />
                                    </div>
                                    <div>
                                        <Label className="mb-2">Experience (Years)</Label>
                                        <Input
                                            value={formData.experience}
                                            onChange={(e) => handleInputChange("experience", e.target.value)}
                                            placeholder="12"
                                        />
                                    </div>
                                    <div>
                                        <Label className="mb-2">Consultation Fee</Label>
                                        <Input
                                            value={formData.consultationFee}
                                            onChange={(e) => handleInputChange("consultationFee", e.target.value)}
                                            placeholder="500"
                                        />
                                    </div>
                                </>
                            )}
                            <div className="md:col-span-2">
                                <Label className="mb-2">Address</Label>
                                <Input
                                    value={formData.address}
                                    onChange={(e) => handleInputChange("address", e.target.value)}
                                    placeholder="123, MG Road, Pune"
                                />
                            </div>
                            <div className="md:col-span-2 text-right mt-2">
                                <Button
                                    variant="outline"
                                    onClick={handleSaveProfile}
                                    disabled={saving}
                                >
                                    {saving ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
            <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
                <DialogContent className="max-w-md p-0"
                    onInteractOutside={(e) => e.preventDefault()}  
                    onEscapeKeyDown={(e) => e.preventDefault()} 
                >
                     <VisuallyHidden>
                        <DialogTitle>Change Password</DialogTitle>
                    </VisuallyHidden>
                    <ChangePasswordForm
                        open={showPasswordModal}
                        onClose={() => setShowPasswordModal(false)}
                        onSubmit={async (values) => {
                            try {
                                const res = await authClient.changePassword({
                                    currentPassword: values.currentPassword,
                                    newPassword: values.newPassword,
                                });

                                if (res?.data != null) {
                                    toast.success("Password changed successfully!");
                                    setShowPasswordModal(false);
                                    return true;
                                } else {
                                    toast.error(res?.error?.message || "Failed to change password");
                                    return false;
                                }
                            } catch (err: any) {
                                toast.error(err.message || "Something went wrong");
                                console.error(err);
                                return false;
                            }
                        }}

                    />
                </DialogContent>
            </Dialog>



        </div>
    );
}
