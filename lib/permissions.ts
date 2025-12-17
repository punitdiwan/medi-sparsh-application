import { createAccessControl} from "better-auth/plugins/access";
import { defaultStatements,  ownerAc } from 'better-auth/plugins/organization/access'
import { Hospital } from "lucide-react";

const statement = {
     ...defaultStatements, 
    project: ["create","update","delete","read"],
    appointment: ["create","update","delete","read"],
    role: ["create","update","delete","read"],
    patient:["create","update","delete","read"],
    prescription:["create","update","delete","read"],
    reports:["create","update","delete","read"],
    services:["create","update","delete","read"],
    members:["create","update","delete","read"],
    bed:["create","update","delete","read"],
    hospitalCharger:["create","update","delete","read"],
    payment:["create","update","delete","read"],
    shifts:["create","update","delete","read"],
    vitals:["create","update","delete","read"],
    medicineRedord:["create","update","delete","read"],
    stats:["create","update","delete","read"],
    billing:["create","update","delete","read"],
    pharmacyMedicine:["create","update","delete","read"],
    stock:["create","update","delete","read"],
} as const;
export const ac = createAccessControl(statement);

export const secret = ac.newRole({ 
    
    project: ["create"], 
    role: ["create","update","delete"],
}); 

export const normal = ac.newRole({ 
    project: ["read"], 
}); 

export const owner= ac.newRole({
    project: ["create","update","delete","read"],
    appointment: ["create","update","delete","read"],
    role: ["create","update","delete","read"],
    patient:["create","update","delete","read"],
    prescription:["create","update","delete","read"],
    reports:["create","update","delete","read"],
    services:["create","update","delete","read"],
    members:["create","update","delete","read"],
    bed:["create","update","delete","read"],
    hospitalCharger:["create","update","delete","read"],
    payment:["create","update","delete","read"],
    shifts:["create","update","delete","read"],
    vitals:["create","update","delete","read"],
    medicineRedord:["create","update","delete","read"],
    stats:["create","update","delete","read"],
    billing:["create","update","delete","read"],
    pharmacyMedicine:["create","update","delete","read"],
    stock:["create","update","delete","read"],
    ...ownerAc.statements
});

