"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

const services = [
  { name: "General Consultation", price: 500 },
  { name: "Blood Test", price: 800 },
  { name: "X-Ray", price: 1200 },
  { name: "MRI Scan", price: 3500 },
];

export type BillData = {
  patientName: string;
  patientId: string;
  serviceName: string;
  unitPrice: string;
  discount: string;
  paymentMethod: string;
};

export default function BillingForm({
  onCreateBill,
}: {
  onCreateBill: (data: any) => void;
}) {
  const form = useForm<BillData>({
    defaultValues: {
      patientName: "",
      patientId: "",
      serviceName: "",
      unitPrice: "",
      discount: "0",
      paymentMethod: "cash",
    },
  });

  const selectedService = form.watch("serviceName");
  const discount = parseFloat(form.watch("discount") || "0");
  const unitPrice =
    services.find((s) => s.name === selectedService)?.price || 0;
  const total = unitPrice - discount;

  React.useEffect(() => {
    if (selectedService) {
      const price = services.find((s) => s.name === selectedService)?.price;
      if (price !== undefined) form.setValue("unitPrice", price.toString());
    }
  }, [selectedService, form]);

  const onSubmit = (data: BillData) => {
    onCreateBill({
      ...data,
      unitPrice: parseFloat(data.unitPrice),
      discount: parseFloat(data.discount),
      total,
    });
    form.reset();
  };

  return (
    <Card className="border border-border shadow-md dark:bg-neutral-950">
      <CardHeader>
        <h3 className="text-lg font-semibold tracking-tight">
          Create a New Bill
        </h3>
        <p className="text-sm text-muted-foreground">
          Fill in patient and billing details below.
        </p>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* Patient Information */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="patientName"
                rules={{ required: "Patient name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter patient name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="patientId"
                rules={{ required: "Patient ID is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient ID</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter patient ID"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Service Name */}
            <FormField
              control={form.control}
              name="serviceName"
              rules={{ required: "Service is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service</FormLabel>
                  <Select
                    onValueChange={(val) => field.onChange(val)}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem
                          key={service.name}
                          value={service.name}
                        >
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Unit Price */}
            <FormField
              control={form.control}
              name="unitPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Price (₹)</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" readOnly />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Discount */}
            <FormField
              control={form.control}
              name="discount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount (₹)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="0"
                      max={unitPrice}
                      placeholder="Enter discount"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Payment Method */}
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex space-x-6 mt-2"
                    >
                      {["cash", "card", "upi"].map((method) => (
                        <div
                          key={method}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            value={method}
                            id={method}
                          />
                          <label
                            htmlFor={method}
                            className="capitalize text-sm font-medium"
                          >
                            {method}
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Total */}
            <div className="pt-4 border-t border-border">
              <p className="text-lg font-semibold">
                Total Payable: ₹{total >= 0 ? total : 0}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
              >
                Cancel
              </Button>
              <Button type="submit">Create Bill</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
