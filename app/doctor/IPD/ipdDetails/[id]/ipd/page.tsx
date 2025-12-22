"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

/* ---------------- DUMMY DATA ---------------- */

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

/* ---------------- PAGE ---------------- */

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

      <div className="lg:col-span-4 space-y-6">

        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback>RK</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">Ramesh Kumar</h3>
              <p className="text-sm text-muted-foreground">IPD-001 • Male • 45Y</p>
            </div>
          </CardHeader>

          <CardContent className="space-y-2 text-sm">
            <p><b>Bed:</b> ICU-02</p>
            <p><b>Doctor:</b> Dr. Amit Sharma</p>
            <p><b>Admission Date:</b> 12-02-2025</p>
            <Badge variant="outline">Active</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing Status</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            <Progress value={overallPercentage} />

            <div className="flex justify-between text-sm">
              <span>Paid</span>
              <span className="font-medium">₹{totalPaid}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Total</span>
              <span className="font-medium">₹{totalAmount}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-destructive">Pending</span>
              <span className="text-destructive font-medium">
                ₹{totalPending}
              </span>
            </div>

            {/* Status Badge */}
            <div>
              {overallPercentage === 100 ? (
                <Badge className="bg-green-600">Fully Paid</Badge>
              ) : overallPercentage >= 50 ? (
                <Badge variant="secondary">Partially Paid</Badge>
              ) : (
                <Badge variant="destructive">Payment Due</Badge>
              )}
            </div>
          </CardContent>
        </Card>


        {/* Current Vitals */}
        <Card>
          <CardHeader>
            <CardTitle>Current Vitals</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <p>BP: 120/80</p>
            <p>Pulse: 78</p>
            <p>Temp: 98.6°F</p>
            <p>SpO₂: 98%</p>
          </CardContent>
        </Card>

        {/* Symptoms */}
        <Card>
          <CardHeader>
            <CardTitle>Symptoms</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p>• Fever</p>
            <p>• Chest Pain</p>
            <p>• Breathlessness</p>
          </CardContent>
        </Card>

        {/* Doctors */}
        <Card>
          <CardHeader>
            <CardTitle>Doctors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>Dr. Amit Sharma (Physician)</p>
            <p>Dr. Neha Gupta (Cardiology)</p>
          </CardContent>
        </Card>

        {/* Nurse Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Nurse Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            Patient stable, medication administered on time.
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-8 space-y-8">

      <Card>
  <CardHeader>
    <CardTitle>Department Wise Billing</CardTitle>
  </CardHeader>

  <CardContent>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {departmentBilling.map((dept) => {
        const remaining = dept.total - dept.paid;
        const percentage = Math.round((dept.paid / dept.total) * 100);

        return (
          <div
            key={dept.name}
            className="border rounded-lg p-4 space-y-2"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{dept.name}</h4>
              <span className="text-sm font-semibold">
                {percentage}%
              </span>
            </div>

            {/* Progress */}
            <Progress value={percentage} />

            {/* Amounts */}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Paid: ₹{dept.paid}
              </span>
              <span
                className={
                  remaining === 0
                    ? "text-green-600 font-medium"
                    : "text-destructive font-medium"
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



        {/* SECTION LIST */}
        {sections.map((section) => (
          <div key={section}>
            <h3 className="text-lg font-semibold mb-2">{section}</h3>
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


