import { createAccessControl} from "better-auth/plugins/access";
import { defaultStatements,  ownerAc } from 'better-auth/plugins/organization/access'
import { ALL_PERMISSIONS } from "./allPermissions";
const statement = {
     ...defaultStatements, 
    ...ALL_PERMISSIONS,
} as const;
export const ac = createAccessControl(statement);

// export const secret = ac.newRole({ 
    
//     project: ["create"], 
//     role: ["create","update","delete"],
// }); 

// export const normal = ac.newRole({ 
//     project: ["read"], 
// }); 

export const owner= ac.newRole({
    ...ALL_PERMISSIONS,
    ...ownerAc.statements
});

