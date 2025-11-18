"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
  const { userData, hospital } = data;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card className="shadow-lg border rounded-xl">
        
        <CardHeader className="flex flex-col items-center gap-4">
          
          {/* Hospital Logo */}
          {hospital.logo ? (
            <img
              src={hospital.logo}
              alt="Hospital Logo"
              className="w-24 h-24 object-cover rounded-full shadow"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 shadow">
              No Logo
            </div>
          )}

          <CardTitle className="text-xl font-bold border-b pb-2 w-full text-center">
            Admin Profile
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-8 mt-4">
          
          {/* Hospital Info */}
          <div>
            <h2 className="font-semibold text-lg mb-3">Hospital Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div className="flex flex-col gap-1">
                <Label>Hospital Name</Label>
                <Input className="bg-background text-foreground" value={hospital.name ?? ""} readOnly />
              </div>

              <div className="flex flex-col gap-1">
                <Label>Email</Label>
                <Input className="bg-background text-foreground" value={hospital?.metadata?.email ?? ""} readOnly />
              </div>

              <div className="flex flex-col gap-1">
                <Label>Contact Number</Label>
                <Input className="bg-background text-foreground" value={hospital?.metadata?.phone ?? ""} readOnly />
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <Label>Address</Label>
                <Input className="bg-background text-foreground" value={hospital?.metadata?.address ?? ""} readOnly />
              </div>

            </div>
          </div>

          {/* Owner Info */}
          <div>
            <h2 className="font-semibold text-lg mb-3">Owner Information</h2>

            <div className="flex items-center gap-6 mb-5">
              
              {/* {userData.image ? (
                <img
                  src={userData.image}
                  alt="Owner"
                  className="w-20 h-20 rounded-full object-cover shadow"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 shadow">
                  No Image
                </div>
              )} */}

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">

                <div className="flex flex-col gap-1">
                  <Label>Owner Name</Label>
                  <Input value={userData.name ?? ""} disabled />
                </div>

                <div className="flex flex-col gap-1">
                  <Label>Owner Email</Label>
                  <Input value={userData.email ?? ""} disabled />
                </div>

              </div>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProfileUI;
