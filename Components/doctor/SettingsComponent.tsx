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

type Setting = {
  key: string;
  value: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
};

const SETTINGS_META: Record<
  string,
  { label: string; description: string; group: string }
> = {
  phone_validation: {
    label: "Phone Number Validation",
    description:
      "Require new patients to verify their phone number using OTP during registration.",
    group: "Patient Registration",
  },
  organization_mode_check: {
    label: "Organization Mode",
    description: "Select whether your organization is a Clinic or Hospital.",
    group: "Organization",
  },


};


export default function SettingsComponent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const [settings, setSettings] = useState<Record<string, Setting>>({});
  const [savingKeys, setSavingKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/settings/phone-validation");
        const data = await response.json();
        console.log("settings data", data);

        if (!data.success) {
          toast.error("Failed to load settings");
          return;
        }

        const map: Record<string, Setting> = {};
          data.data.forEach((s:any) => {
            if (SETTINGS_META[s.key]) {  
              map[s.key] = s;
            }
          });


        setSettings(map);
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast.error("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // 

  const handleToggle = async (key: string, enabled: boolean) => {
        const isOrgMode = key === "organization_mode_check";

        // optimistic update
        setSettings((prev) => ({
          ...prev,
          [key]: {
            ...(prev[key] || {
              key,
              organizationId: user?.hospital?.hospitalId || "",
              createdAt: "",
              updatedAt: "",
              value: "false",
            }),
            value: enabled ? "true" : "false",
          },
        }));

        setSavingKeys((prev) => ({ ...prev, [key]: true }));

        try {
          const response = await fetch("/api/settings/phone-validation", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              key,
              value: enabled,
              orgId: user?.hospital?.hospitalId,
            }),
          });

          const data = await response.json();

          if (!data.success) {
            toast.error("Failed to update");
            return;
          }

          if (isOrgMode) {
            toast.success(
              enabled ? "Organization set to Hospital" : "Organization set to Clinic"
            );
          } else {
            toast.success(
              enabled
                ? `${SETTINGS_META[key].label} enabled`
                : `${SETTINGS_META[key].label} disabled`
            );
          }
        } catch (err) {
          console.error(err);
          toast.error("Error updating setting");
        } finally {
          setSavingKeys((prev) => ({ ...prev, [key]: false }));
        }
      };


  const renderSettingRow = (key: string) => {
  if (key === "organization_mode_check") {
    return renderOrganizationModeRadio(key);
  }

  const meta = SETTINGS_META[key];
  const setting = settings[key];
  const enabled = setting?.value === "true";

  return (
    <div
      key={key}
      className="flex items-center justify-between p-4 border rounded-lg"
    >
      <div className="space-y-1">
        <Label className="text-base font-medium">{meta.label}</Label>
        <p className="text-sm text-muted-foreground">{meta.description}</p>
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={(checked) => handleToggle(key, checked)}
        disabled={!!savingKeys[key]}
      />
    </div>
  );
};


 const renderOrganizationModeRadio = (key: string) => {
  const setting = settings[key];
  const selected = setting?.value === "true";

  return (
    <div className="p-4 border rounded-lg space-y-3">
      <Label className="text-base font-medium">
        {SETTINGS_META[key].label}
      </Label>

      <p className="text-sm text-muted-foreground">
        {SETTINGS_META[key].description}
      </p>

      <div className="flex items-center gap-6 mt-2">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="organizationMode"
            value="hospital"
            checked={selected === true}
            onChange={() => handleToggle(key, true)}
            disabled={savingKeys[key]}
          />
          <span>Hospital</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="organizationMode"
            value="clinic"
            checked={selected === false}
            onChange={() => handleToggle(key, false)}
            disabled={savingKeys[key]}
          />
          <span>Clinic</span>
        </label>
      </div>
    </div>
  );
};


  const patientRegistrationKeys = Object.keys(settings).filter(
    (k) => SETTINGS_META[k]?.group === "Patient Registration"
  );

  const organizationKeys = Object.keys(settings).filter(
    (k) => SETTINGS_META[k]?.group === "Organization"
  );


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
            <>
              {patientRegistrationKeys.length > 0 && (
                <Card >
                  <CardHeader>
                    <CardTitle>Patient Registration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {patientRegistrationKeys.map((key) => (
                      <div key={key}>{renderSettingRow(key)}</div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {organizationKeys.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Organization</CardTitle>
                  </CardHeader>
                 <CardContent className="space-y-6">
                    {organizationKeys.map((key) => (
                      <div key={key}>{renderSettingRow(key)}</div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );


}
