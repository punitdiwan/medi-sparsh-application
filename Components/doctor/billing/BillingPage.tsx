// "use client";

// import * as React from "react";
// import BillingForm, { BillData } from "@/Components/forms/BillingForm";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";

// export default function BillingPage() {
//   const [bills, setBills] = React.useState<any[]>([]);

//   const handleCreateBill = (bill: BillData & { total: number }) => {
//     setBills((prev) => [...prev, bill]);
//   };

//   return (
//     <div className="p-8 space-y-6">
//       <BillingForm onCreateBill={handleCreateBill} />

//       {bills.length > 0 && (
//         <Card className="mt-8 border border-border shadow-sm dark:bg-neutral-950">
//           <CardHeader>
//             <CardTitle>Generated Bills</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Patient Name</TableHead>
//                   <TableHead>Patient ID</TableHead>
//                   <TableHead>Service</TableHead>
//                   <TableHead className="text-right">Price (₹)</TableHead>
//                   <TableHead className="text-right">Discount (₹)</TableHead>
//                   <TableHead className="text-right">Total (₹)</TableHead>
//                   <TableHead>Payment</TableHead>
//                 </TableRow>
//               </TableHeader>

//               <TableBody>
//                 {bills.map((bill, index) => (
//                   <TableRow key={index} className="hover:bg-muted/30">
//                     <TableCell>{bill.patientName}</TableCell>
//                     <TableCell>{bill.patientId}</TableCell>
//                     <TableCell>{bill.serviceName}</TableCell>
//                     <TableCell className="text-right">
//                       ₹{bill.unitPrice}
//                     </TableCell>
//                     <TableCell className="text-right">
//                       ₹{bill.discount}
//                     </TableCell>
//                     <TableCell className="text-right font-medium">
//                       ₹{bill.total}
//                     </TableCell>
//                     <TableCell className="capitalize">
//                       {bill.paymentMethod}
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }

"use client";

import * as React from "react";
import BillingForm, { BillData } from "@/Components/forms/BillingForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function BillingPage() {
  const [bills, setBills] = React.useState<any[]>([]);
  const [showBillingForm, setShowBillingForm] = React.useState(false); // State for showing the billing form

  const handleCreateBill = (bill: BillData & { total: number }) => {
    setBills((prev) => [...prev, bill]);
    setShowBillingForm(false); // Hide form after bill is created
  };

  return (
    <div className="p-8 space-y-6">

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Billing</h2>
        <Button
          onClick={() => setShowBillingForm((prev) => !prev)} 
          
        >
          {showBillingForm ? "Cancel" : "Create Billing"}
        </Button>
      </div>

     
      {showBillingForm && <BillingForm onCreateBill={handleCreateBill} />}

      {bills.length > 0 && (
        <Card className="mt-8 border border-border shadow-sm dark:bg-neutral-950">
          <CardHeader>
            <CardTitle>Generated Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead className="text-right">Price (₹)</TableHead>
                  <TableHead className="text-right">Discount (₹)</TableHead>
                  <TableHead className="text-right">Total (₹)</TableHead>
                  <TableHead>Payment</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {bills.map((bill, index) => (
                  <TableRow key={index} className="hover:bg-muted/30">
                    <TableCell>{bill.patientName}</TableCell>
                    <TableCell>{bill.patientId}</TableCell>
                    <TableCell>{bill.serviceName}</TableCell>
                    <TableCell className="text-right">
                      ₹{bill.unitPrice}
                    </TableCell>
                    <TableCell className="text-right">
                      ₹{bill.discount}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ₹{bill.total}
                    </TableCell>
                    <TableCell className="capitalize">
                      {bill.paymentMethod}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
