"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import PatientRegistrationForm from "@/Components/forms/PatientRegistrationFrom";
import { InputOTPForm } from "@/components/model/Otpmodel";

type AddPatientDialogProps = {
  onPatientAdded?: () => void; 
};

const AddPatientDialog: React.FC<AddPatientDialogProps> = ({ onPatientAdded }) => {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [otpVerifyHandler, setOtpVerifyHandler] = useState<((otp: string) => Promise<void>) | null>(null);

  return (
    <>
      {/* Trigger button */}
      <Button onClick={() => setIsRegistrationOpen(true)} className="btn-theme">
        <UserPlus className="mr-2 h-4 w-4 text-current" />
        New Patient
      </Button>

      {/* Patient Registration Dialog */}
      <Dialog open={isRegistrationOpen} onOpenChange={setIsRegistrationOpen}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
          </DialogHeader>
          <PatientRegistrationForm
            onSuccess={() => {
              setIsRegistrationOpen(false);
              setIsOtpOpen(false);
              onPatientAdded?.(); // notify parent to refresh list
            }}
            onCancel={() => setIsRegistrationOpen(false)}
            onOtpRequired={(data, verifyHandler) => {
              setIsRegistrationOpen(false);
              setOtpVerifyHandler(() => verifyHandler);
              setIsOtpOpen(true);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* OTP Verification Dialog */}
      <Dialog open={isOtpOpen} onOpenChange={setIsOtpOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Mobile Number</DialogTitle>
          </DialogHeader>
          <InputOTPForm
            onVerify={async (otp) => {
              if (otpVerifyHandler) {
                await otpVerifyHandler(otp);
                onPatientAdded?.();
              }
            }}
            onClose={() => {
              setIsOtpOpen(false);
              setIsRegistrationOpen(true); // reopen registration form if cancelled
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddPatientDialog;
