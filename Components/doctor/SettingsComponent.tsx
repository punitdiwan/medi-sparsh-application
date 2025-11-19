"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function SettingsComponent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [phoneValidationEnabled, setPhoneValidationEnabled] = useState(false);
  const [validationKey ,setValidationKey] = useState();
  const {user} = useAuth();
  useEffect(() => {
    const fetchSetting = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/settings/phone-validation");
        const data = await response.json();

        if (data.success) {
          const isEnabled = data.data.value === "true";
          setValidationKey(data?.data?.key)
          setPhoneValidationEnabled(isEnabled);
        } else {
          toast.error("Failed to load settings");
        }
      } catch (error) {
        console.error("Error fetching setting:", error);
        toast.error("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSetting();
  }, []);

  const handleToggle = async (enabled: boolean) => {
    setPhoneValidationEnabled(enabled);

    try {
      setIsSaving(true);
      const response = await fetch("/api/settings/phone-validation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          key: validationKey,
          value: enabled ,
          orgId : user?.hospital?.hospitalId
        }),
      });

      const data = await response.json();
      console.log("Server response",data);
      if (data.success) {
        toast.success(
          enabled
            ? "Phone number validation enabled"
            : "Phone number validation disabled"
        );
      } else {
        toast.error("Failed to update setting");
        setPhoneValidationEnabled(!enabled);
      }
    } catch (error) {
      console.error("Error updating setting:", error);
      toast.error("Failed to update setting");
      setPhoneValidationEnabled(!enabled);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 cursor-pointer"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground mt-2">
              Configure application settings
            </p>
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">
                  Loading settings...
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Patient Registration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label htmlFor="phone-validation" className="text-base font-medium">
                      Phone Number Validation
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Require new patients to verify their phone number using OTP
                    </p>
                  </div>
                  <Switch
                    id="phone-validation"
                    checked={phoneValidationEnabled}
                    onCheckedChange={handleToggle}
                    disabled={isSaving}
                  />
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <span className="font-medium">ℹ️ Info:</span> When enabled, new patients will need to verify their phone number via OTP during registration. This adds an extra layer of security to patient accounts.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
