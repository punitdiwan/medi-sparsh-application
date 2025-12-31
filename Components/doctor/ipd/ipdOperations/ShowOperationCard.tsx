import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
    Stethoscope,
    CalendarDays,
    Clock,
    Users,
    UserRound,
    UserCheck,
    FlaskConical,
    Wrench,
    FileText,
    UserCog,
} from "lucide-react";
import { Operation } from "./ipdOperationManager";

export function ShowOperationCard({ operation }: { operation: Operation }) {
    const staff = operation.supportStaff || {};
    const doctors = operation.doctors || [];

    return (
        <Card className="w-full max-w-full h-full shadow-lg bg-overview-card border-overview-strong">
            {/* HEADER */}
            <CardHeader className="border-b border-dialog px-4 py-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    {/* LEFT – TITLE & CATEGORY */}
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <Stethoscope className="h-5 w-5" />
                            </div>
                            {operation.operationName}
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs w-fit">
                            {operation.categoryName}
                        </Badge>
                    </div>

                    {/* RIGHT – BASIC DETAILS */}
                    <div className="flex flex-wrap gap-3 sm:justify-end text-xs">
                        <MiniDetail
                            icon={CalendarDays}
                            label="Date"
                            value={format(new Date(operation.operationDate), "dd MMM yyyy")}
                        />
                        <MiniDetail
                            icon={Clock}
                            label="Time"
                            value={format(new Date(operation.operationTime), "hh:mm a")}
                        />
                        <MiniDetail
                            icon={FlaskConical}
                            label="Anesthesia"
                            value={operation.anaesthetiaType || "—"}
                        />
                    </div>
                </div>
            </CardHeader>

            {/* CONTENT */}
            <CardContent className="px-4 space-y-5 text-sm h-auto">
                {/* DOCTORS – MAIN SECTION */}
                <div className="rounded-lg border-overview-strong bg-dialog-surface p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-primary">
                        <UserRound className="h-4 w-4" />
                        Operating Doctors
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {doctors.length ? (
                            doctors.map((doc: string, index: number) => (
                                <Badge
                                    key={index}
                                    variant="outline"
                                    className="px-3 py-1 text-sm rounded-full"
                                >
                                    {doc}
                                </Badge>
                            ))
                        ) : (
                            <span className="text-muted-foreground">—</span>
                        )}
                    </div>
                </div>

                {/* SUPPORTING STAFF */}
                <div className="rounded-lg border-overview-strong bg-dialog-surface p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Users className="h-4 w-4" />
                        Supporting Staff
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Detail icon={Users} label="Assistant 1" value={staff.assistant1 || "—"} />
                        <Detail icon={Users} label="Assistant 2" value={staff.assistant2 || "—"} />
                        <Detail icon={UserCheck} label="Anesthetist" value={operation.anaesthetist?.name || "—"} />
                        <Detail icon={UserCog} label="OT Assistant" value={staff.otAssistant || "—"} />
                        <Detail icon={Wrench} label="OT Technician" value={staff.technician || "—"} />
                    </div>
                </div>

                {/* REMARKS / RESULT */}
                <div className="p-3 rounded-lg border-overview-strong bg-dialog-surface">
                    <div className="flex items-center gap-2 mb-2 text-sm font-medium text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        Remarks / Result
                    </div>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                        {operation.operationDetails || "—"}
                    </p>
                </div>
            </CardContent>
        </Card>

    );
}

/* ---------------- Detail Row ---------------- */

function Detail({
    icon: Icon,
    label,
    value,
}: {
    icon: any;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 p-2 rounded-md bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="font-medium text-foreground">{value}</span>
            </div>
        </div>
    );
}
function MiniDetail({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
    return (
        <div className="flex items-start gap-2">
            <div className="mt-0.5 p-1.5 rounded-md bg-primary/10 text-primary">
                <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="flex flex-col leading-tight">
                <span className="text-[10px] text-muted-foreground">{label}</span>
                <span className="text-xs font-medium text-foreground">{value}</span>
            </div>
        </div>
    );
}
