"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";


const billing = {
  total: 100000,
  paid: 65000,
};

const sections = [
  "Medication",
  "Prescription",
  "Consultant Register",
  "Lab Investigation",
  "Operations",
  "Charges",
  "Payments",
  "Live Consultation",
  "Treatment History",
  "Bed History",
];

const departmentBilling = [
  {
    name: "IPD Charges",
    total: 40000,
    paid: 30000,
  },
  {
    name: "Pharmacy",
    total: 18000,
    paid: 12000,
  },
  {
    name: "Lab",
    total: 12000,
    paid: 8000,
  },
  {
    name: "Blood Bank",
    total: 8000,
    paid: 4000,
  },
  {
    name: "Ambulance",
    total: 5000,
    paid: 5000,
  },
];


export default function IPDOverviewPage() {
  const pending = billing.total - billing.paid;
  const progress = Math.round((billing.paid / billing.total) * 100);

  const totalAmount = departmentBilling.reduce(
    (sum, dept) => sum + dept.total,
    0
  );

  const totalPaid = departmentBilling.reduce(
    (sum, dept) => sum + dept.paid,
    0
  );

  const totalPending = totalAmount - totalPaid;

  const overallPercentage = totalAmount
    ? Math.round((totalPaid / totalAmount) * 100)
    : 0;

   return (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

    {/* ================= LEFT PANEL ================= */}
    <div className="lg:col-span-4 space-y-6">

      {/* PATIENT CARD */}
      <Card className="border-indigo-200/50 ">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-14 w-14 ring-2 ring-indigo-400">
            <AvatarFallback className="bg-indigo-600 text-white">
              RK
            </AvatarFallback>
          </Avatar>

          <div>
            <h3 className="font-semibold text-lg text-indigo-global">
              Ramesh Kumar
            </h3>
            <p className="text-sm text-indigo-global">
              IPD-001 • Male • 45Y
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-2 text-sm text-slate-700">
          <p><b>Bed:</b> ICU-02</p>
          <p><b>Doctor:</b> Dr. Amit Sharma</p>
          <p><b>Admission Date:</b> 12-02-2025</p>

          <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-300">
            Active
          </Badge>
        </CardContent>
      </Card>

      {/* BILLING STATUS */}
      <Card className="border-indigo-200/50">
        <CardHeader>
          <CardTitle className="text-indigo-global">
            Billing Status
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Progress
            value={overallPercentage}
            className="h-2 bg-indigo-100"
          />

          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Paid</span>
            <span className="font-semibold text-emerald-600">
              ₹{totalPaid}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Total</span>
            <span className="font-medium">
              ₹{totalAmount}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-rose-600">Pending</span>
            <span className="font-semibold text-rose-600">
              ₹{totalPending}
            </span>
          </div>

          {overallPercentage === 100 ? (
            <Badge className="bg-emerald-600 text-white">
              Fully Paid
            </Badge>
          ) : overallPercentage >= 50 ? (
            <Badge className="bg-indigo-100 text-indigo-global">
              Partially Paid
            </Badge>
          ) : (
            <Badge className="bg-rose-600 text-white">
              Payment Due
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* VITALS */}
      <Card>
        <CardHeader>
          <CardTitle className="text-indigo-global">
            Current Vitals
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-indigo-global p-2 rounded">BP: 120/80</div>
          <div className="bg-indigo-global p-2 rounded">Pulse: 78</div>
          <div className="bg-indigo-global p-2 rounded">Temp: 98.6°F</div>
          <div className="bg-indigo-global p-2 rounded">SpO₂: 98%</div>
        </CardContent>
      </Card>

      {/* SYMPTOMS */}
      <Card>
        <CardHeader>
          <CardTitle className="text-indigo-global">
            Symptoms
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          <Badge variant="secondary">Fever</Badge>
          <Badge variant="secondary">Chest Pain</Badge>
          <Badge variant="secondary">Breathlessness</Badge>
        </CardContent>
      </Card>

      {/* DOCTORS */}
      <Card>
        <CardHeader>
          <CardTitle className="text-indigo-global">
            Doctors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>Dr. Amit Sharma <span className="text-muted-foreground">(Physician)</span></p>
          <p>Dr. Neha Gupta <span className="text-muted-foreground">(Cardiology)</span></p>
        </CardContent>
      </Card>

      {/* NURSE NOTES */}
      <Card>
        <CardHeader>
          <CardTitle className="text-indigo-global">
            Nurse Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          Patient stable, medication administered on time.
        </CardContent>
      </Card>
    </div>

    {/* ================= RIGHT PANEL ================= */}
    <div className="lg:col-span-8 space-y-8">

      {/* DEPARTMENT BILLING */}
      <Card className="border-indigo-200/50">
        <CardHeader>
          <CardTitle className="text-indigo-global">
            Department Wise Billing
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departmentBilling.map((dept) => {
              const remaining = dept.total - dept.paid;
              const percentage = Math.round((dept.paid / dept.total) * 100);

              return (
                <div
                  key={dept.name}
                  className="rounded-xl border bg-gradient-to-br from-white to-indigo-50 p-4 space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-indigo-800">
                      {dept.name}
                    </h4>
                    <span className="text-sm font-semibold text-indigo-800">
                      {percentage}%
                    </span>
                  </div>

                  <Progress value={percentage} className="h-2" />

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">
                      Paid: ₹{dept.paid}
                    </span>
                    <span
                      className={
                        remaining === 0
                          ? "text-emerald-600 font-medium"
                          : "text-rose-600 font-medium"
                      }
                    >
                      Remaining: ₹{remaining}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* TIMELINE SECTIONS */}
      {sections.map((section) => (
        <div key={section}>
          <h3 className="text-lg font-semibold text-indigo-global mb-2">
            {section}
          </h3>
          <Separator className="mb-4" />
          <Card>
            <CardContent className="py-4 text-sm text-muted-foreground">
              No records available
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  </div>
);
}


