import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Calendar, Clock, User, Pencil, Stethoscope } from "lucide-react";
import { Appointment } from "./appointmentpage";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

type Props = {
  data: Appointment;
  onEdit?: (appointment: Appointment) => void;
};

export function AppointmentCard({ data, onEdit }: Props) {
  const isScheduled = data.status === "scheduled";
  const isCompleted = data.status === "completed";
  const isCancelled = data.status === "cancelled";

  const calculateAge = (dob: string | undefined) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Icon colors
  const iconColor =
    isCompleted
      ? "text-green-600 dark:text-green-400"
      : isCancelled
        ? "text-red-600 dark:text-red-400"
        : "text-indigo-600 dark:text-indigo-400";

  // Badge classes
  const badgeClass =
    isScheduled
      ? "bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-100"
      : isCompleted
        ? "bg-green-200 dark:bg-green-700 text-green-800 dark:text-green-100"
        : "bg-red-200 dark:bg-red-700 text-red-800 dark:text-red-100";

  return (
    <Card className="bg-overview-card rounded-xl shadow-md border">
      {/* Header: Patient + Edit */}
      <CardHeader className=" flex flex-row items-center justify-between">
        <CardTitle className="flex flex-col gap-2">
          {/* Patient */}
          <div className="flex items-center gap-2 text-lg">
            <User className={`h-5 w-5 ${iconColor}`} />
            {data.patientName}
          </div>

          {/* Doctor */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-muted-foreground/70">
            <Stethoscope className="h-4 w-4 text-muted-foreground dark:text-muted-foreground/70" />
            {data.doctorName || "N/A"}
          </div>
        </CardTitle>

        {/* Edit button */}
        {isScheduled && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="icon"
                  onClick={() => onEdit?.(data)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Edit Appointment</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </CardHeader>

      <CardContent className="space-y-3 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            {/* Contact */}
            <div className="flex items-center gap-2">
              <Phone className={`h-4 w-4 ${iconColor}`} />
              <span>{data.contact}</span>
            </div>

            {/* Email */}
            <div className="flex items-center gap-2">
              <span className="font-semibold">Email:</span>
              <span>{data.email || "N/A"}</span>
            </div>

            {/* Gender / Age */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Gender:</span>
                <span className="capitalize">{data.gender || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Age:</span>
                <span>{calculateAge(data.dob)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {/* Date */}
            <div className="flex items-center gap-2">
              <Calendar className={`h-4 w-4 ${iconColor}`} />
              <span>
                {new Date(data.date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Time */}
            <div className="flex items-center gap-2">
              <Clock className={`h-4 w-4 ${iconColor}`} />
              <span>{data.time}</span>
            </div>
          </div>
        </div>

        <Separator className="my-2" />

        {/* Purpose */}
        {data.purpose && (
          <div className="text-muted-foreground dark:text-muted-foreground/70">
            <span className="font-semibold text-foreground dark:text-foreground/90">Purpose:</span> {data.purpose}
          </div>
        )}

        {/* Notes */}
        {data.notes && (
          <div className="text-muted-foreground dark:text-muted-foreground/70">
            <span className="font-semibold text-foreground dark:text-foreground/90">Notes:</span> {data.notes}
          </div>
        )}

        {/* Services */}
        {data.services && data.services.length > 0 && (
          <div className="space-y-1">
            <span className="font-semibold">Services:</span>
            <div className="flex flex-wrap gap-2">
              {data.services.map((service: any, idx: number) => (
                <Badge key={idx} variant="outline" className="bg-background/50">
                  {service.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Status */}
        <div className="flex justify-end pt-2">
          <Badge className={`font-semibold px-3 py-1 ${badgeClass}`}>
            {data.status.toUpperCase()}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
