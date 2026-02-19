import {
    Calendar,
    Home,
    User,
    Bed,
    NotebookPen,
    ClipboardPlus,
    Settings,
    ServerCog,
    BriefcaseMedical,
    FlaskConical,
    Microscope,
    Ambulance
} from "lucide-react";

export type AppMode = "clinic" | "hospital" | "Pathology" | "Radiology" | "Pharmacy";

export type SidebarChildItem = {
    title: string;
    url: string;
    subject?: string;
    action?: string;
    moduleCode?: string; 
};

export type SidebarItem = {
    title: string;
    url?: string;
    subject?: string;
    action?: string;
    moduleCode?: string; // New field for module code
    icon: any;
    children?: SidebarChildItem[];
};

export const SIDEBAR_CONFIG: Record<AppMode, SidebarItem[]> = {
    clinic: [
        { title: "Dashboard", url: "/doctor", icon: Home },
        { title: "Patients", url: "/doctor/patient", icon: User, subject: "patient", action: "read" },
        { title: "Appointment", url: "/doctor/appointment", icon: Calendar, subject: "appointment", action: "read" },
        { title: "Prescription", url: "/doctor/prescription", icon: NotebookPen, subject: "prescription", action: "read" },
        { title: "Reports", url: "/doctor/reports", icon: ClipboardPlus, subject: "reports", action: "read" },
        { title: "Services", url: "/doctor/services", icon: ServerCog, subject: "services", action: "read" },
        {
            title: 'Settings',
            icon: Settings,
            children: [
                { title: 'Members', url: '/doctor/employees', subject: 'members', action: 'read', },
                { title: 'Symptoms', url: '/doctor/settings/symptom', subject: 'symptoms', action: 'read' },
                { title: 'Vital', url: '/doctor/settings/vital', subject: 'vitals', action: 'read', },
                { title: 'Medicine Record', url: '/doctor/settings/medicineRecord', subject: 'medicineRedord', action: 'read', },
                { title: 'Stats', url: '/doctor/settings/stats', subject: 'stats', action: 'read', },
                { title: 'Payments History', url: '/doctor/billing', subject: 'payment', action: 'read', },
                { title: 'Roles', url: '/doctor/settings/roles', subject: 'role', action: 'read', },
            ],
        },
    ],
    Pathology: [
       { title: "Dashboard", url: "/doctor", icon: Home },
        { title: "Patients", url: "/doctor/patient", icon: User, subject: "patient", action: "read" },
        {
            title: 'Settings',
            icon: Settings,
            children: [
                { title: 'Members', url: '/doctor/employees', subject: 'members', action: 'read', },
                { title: 'Pathology', url: '/doctor/settings/pathology', subject: 'pathologySettings', action: 'read' ,moduleCode: 'PAT'},
                { title: 'Roles', url: '/doctor/settings/roles', subject: 'role', action: 'read', },
            ],
        },
    ],
    Radiology: [
        { title: "Dashboard", url: "/doctor", icon: Home },
        { title: "Patients", url: "/doctor/patient", icon: User, subject: "patient", action: "read" },
        {
            title: 'Settings',
            icon: Settings,
            children: [
                { title: 'Members', url: '/doctor/employees', subject: 'members', action: 'read', },
                { title: 'Radiology', url: '/doctor/settings/radiology', subject: 'radiologySettings', action: 'read' ,moduleCode: 'RAD'},
                { title: 'Roles', url: '/doctor/settings/roles', subject: 'role', action: 'read', },
            ],
        },
    ]
    ,
    Pharmacy: [
        { title: "Dashboard", url: "/doctor", icon: Home },
        { title: "Patients", url: "/doctor/patient", icon: User, subject: "patient", action: "read" },
        {
            title: 'Settings',
            icon: Settings,
            children: [
                { title: 'Members', url: '/doctor/employees', subject: 'members', action: 'read', },
                { title: 'Medicine Record', url: '/doctor/settings/medicineRecord', subject: 'medicineRedord', action: 'read', },
                { title: 'Roles', url: '/doctor/settings/roles', subject: 'role', action: 'read', },
            ],
        },
    ]
    ,

    hospital: [
        { title: "Dashboard", url: "/doctor", icon: Home },
        { title: "Patients", url: "/doctor/patient", icon: User, subject: "patient", action: "read" },
        { title: "Appointment", url: "/doctor/appointment", icon: Calendar, subject: "appointment", action: "read" },
        { title: "Prescription", url: "/doctor/prescription", icon: NotebookPen, subject: "prescription", action: "read" },
        { title: "IPD-In Patient", url: "/doctor/IPD", icon: Bed, subject: "ipd", action: "read" },

        {
            title: "Pharmacy",
            moduleCode: "PHAR",
            icon: BriefcaseMedical,
            children: [
                { title: "Billing", url: "/doctor/pharmacy", subject: "billing", action: "read" },
                { title: "Medicines", url: "/doctor/pharmacy/medicine", subject: "pharmacyMedicine", action: "read" },
                { title: "Stock", url: "/doctor/pharmacy/purchase", subject: "stock", action: "read" },
            ],
        },

        {
            title: "Pathology",
            moduleCode: "PAT",
            icon: FlaskConical,
            children: [
                { title: "Billing", url: "/doctor/pathology", subject: "PathologyBilling", action: "read" },
                { title: 'Payments', url: '/doctor/pathology/payments', subject: 'PathologyBilling', action: 'read', },
                { title: "Pathology Test", url: "/doctor/pathology/pathologyTest", subject: "PathologyTest", action: "read" },
            ],
        },

        {
            title: "Radiology",
            moduleCode: "RAD",
            icon: Microscope,
            children: [
                { title: "Billing", url: "/doctor/radiology", subject: "RadiologyBilling", action: "read" },
                { title: 'Payments', url: '/doctor/radiology/RadiologyPayments', subject: 'RadiologyPayments', action: 'read', },
                { title: "Radiology Test", url: "/doctor/radiology/radiologyTest", subject: "RadiologyTest", action: "read" },
            ],
        },

        {
            title: "Ambulance",
            moduleCode: "AMB",
            icon: Ambulance,
            children: [
                { title: "Billing", url: "/doctor/ambulance", subject: "ambulance", action: "read" },
                { title: "Ambulance Management", url: "/doctor/ambulance/ambulanceManagement", subject: "ambulanceManagement", action: "read" },
            ],
        },

        { title: "Reports", url: "/doctor/reports", icon: ClipboardPlus, subject: "reports", action: "read" },
        { title: "Services", url: "/doctor/services", icon: ServerCog, subject: "services", action: "read" },
        {
            title: 'Settings',
            icon: Settings,
            children: [
                { title: 'Members', url: '/doctor/employees', subject: 'members', action: 'read', },
                { title: 'Hospital Charges', url: '/doctor/settings/hospitalCharges', subject: 'hospitalCharger', action: 'read', },
                { title: 'Bed', url: '/doctor/settings/Bed', subject: 'bed', action: 'read', },
                { title: 'Shift Management', url: '/doctor/settings/shifts', subject: 'doctorShift', action: 'read', },
                { title: 'Symptoms', url: '/doctor/settings/symptom', subject: 'symptoms', action: 'read' },
                { title: 'Vital', url: '/doctor/settings/vital', subject: 'vitals', action: 'read', },
                { title: 'Operations', url: '/doctor/settings/operations', subject: 'operation', action: 'read' },
                { title: 'Medicine Record', url: '/doctor/settings/medicineRecord', subject: 'medicineRedord', action: 'read', },
                { title: 'Pathology', url: '/doctor/settings/pathology', subject: 'pathologySettings', action: 'read' ,moduleCode: 'PAT'},
                { title: 'Radiology', url: '/doctor/settings/radiology', subject: 'radiologySettings', action: 'read' ,moduleCode: 'RAD'},
                { title: 'Stats', url: '/doctor/settings/stats', subject: 'stats', action: 'read', },
                { title: 'Payments History', url: '/doctor/billing', subject: 'payment', action: 'read', },
                { title: 'App Settings', url: '/doctor/settings/config', subject: 'appSetting', action: 'read', },
                { title: 'Roles', url: '/doctor/settings/roles', subject: 'role', action: 'read', },
            ],
        },
    ],
};

// export const MASTER_SIDEBAR: SidebarItem[] = [
//   { title: 'Dashboard', url: '/doctor', icon: Home },
//   { title: 'Patients', url: '/doctor/patient', icon: User, subject: 'patient', action: 'read',moduleCode: "CLN" },
//   { title: 'Appointment', url: '/doctor/appointment', icon: Calendar, subject: 'appointment', action: 'read', moduleCode: "CLN" },
//   { title: 'IPD-In Patient', url: '/doctor/IPD', icon: Bed, subject: 'ipd', action: 'read', moduleCode: "HOSP" },
//   { title: 'Prescription', url: '/doctor/prescription', icon: NotebookPen, subject: 'prescription', action: 'read', moduleCode: "CLN" },
//   {
//     title: 'Pharmacy',
//     moduleCode: "PHAR",
//     icon: BriefcaseMedical,
//     children: [
//       { title: 'Billing', url: '/doctor/pharmacy', subject: 'billing', action: 'read', },
//       { title: 'Medicines', url: '/doctor/pharmacy/medicine', subject: 'pharmacyMedicine', action: 'read', },
//       { title: 'Stock', url: '/doctor/pharmacy/purchase', subject: 'stock', action: 'read', },
//     ],
//   },
//   {
//     title: 'Pathology',
//     moduleCode: "PAT",
//     icon: FlaskConical,
//     children: [
//       { title: 'Billing', url: '/doctor/pathology', subject: 'PathologyBilling', action: 'read', },
//       { title: 'Payments', url: '/doctor/pathology/payments', subject: 'PathologyBilling', action: 'read', },
//       { title: 'Pathology Test', url: '/doctor/pathology/pathologyTest', subject: 'PathologyTest', action: 'read', },
//     ],
//   },
//   {
//     title: 'Radiology',
//     moduleCode: "RAD",
//     icon: Microscope,
//     children: [
//       { title: 'Billing', url: '/doctor/radiology', subject: 'RadiologyBilling', action: 'read', },
//       { title: 'Payments', url: '/doctor/radiology/RadiologyPayments', subject: 'RadiologyPayments', action: 'read', },
//       { title: 'Radiology Test', url: '/doctor/radiology/radiologyTest', subject: 'RadiologyTest', action: 'read', },
//     ],
//   },
//   {
//     title: 'Ambulance',
//     moduleCode: "AMB",
//     icon: Ambulance,
//     children: [
//       { title: 'Billing', url: '/doctor/ambulance', subject: 'ambulance', action: 'read', },
//       { title: 'Ambulance Management', url: '/doctor/ambulance/ambulanceManagement', subject: 'ambulanceManagement', action: 'read', },
//     ],
//   },
//   {
//     title: 'Reports', url: '/doctor/reports', icon: ClipboardPlus, subject: 'reports',
//     action: 'read',
//     moduleCode: "CLN",
//   },
//   {
//     title: 'Services', url: '/doctor/services', icon: ServerCog, subject: 'services',
//     action: 'read',
//     moduleCode: "CLN",
//   },
//   {
//     title: 'Settings',
//     icon: Settings,
//     children: [
//       { title: 'Members', url: '/doctor/employees', subject: 'members', action: 'read', },
//       { title: 'Hospital Charges', url: '/doctor/settings/hospitalCharges', subject: 'hospitalCharger', action: 'read', moduleCode: "HOSP" },
//       { title: 'Bed', url: '/doctor/settings/Bed', subject: 'bed', action: 'read', moduleCode: "HOSP" },
//       { title: 'Shift Management', url: '/doctor/settings/shifts', subject: 'doctorShift', action: 'read', moduleCode: "HOSP" },
//       { title: 'Symptoms', url: '/doctor/settings/symptom', subject: 'symptoms', action: 'read' },
//       { title: 'Vital', url: '/doctor/settings/vital', subject: 'vitals', action: 'read', },
//       { title: 'Operations', url: '/doctor/settings/operations', subject: 'operation', action: 'read', moduleCode: "HOSP" },
//       { title: 'Medicine Record', url: '/doctor/settings/medicineRecord', subject: 'medicineRedord', action: 'read', },
//       { title: 'Pathology', url: '/doctor/settings/pathology', subject: 'pathologySettings', action: 'read' ,moduleCode: "PAT",},
//       { title: 'Radiology', url: '/doctor/settings/radiology', subject: 'radiologySettings', action: 'read', moduleCode: "RAD", },
//       { title: 'Stats', url: '/doctor/settings/stats', subject: 'stats', action: 'read', },
//       { title: 'Payments History', url: '/doctor/billing', subject: 'payment', action: 'read', },
//       { title: 'App Settings', url: '/doctor/settings/config', subject: 'appSetting', action: 'read', },
//       { title: 'Roles', url: '/doctor/settings/roles', subject: 'role', action: 'read', },
//     ],
//   },
// ];