import { createAccessControl} from "better-auth/plugins/access";
import { defaultStatements,  ownerAc } from 'better-auth/plugins/organization/access'

const statement = {
     ...defaultStatements, 
    project: ["create","show", "hide"],
    role: ["create","update","delete"],
} as const;
export const ac = createAccessControl(statement);

export const secret = ac.newRole({ 
    
    project: ["create","show"], 
    role: ["create","update","delete"],
}); 

export const normal = ac.newRole({ 
    project: ["hide"], 
}); 

export const owner= ac.newRole({
    project: ["create","show"], 
    role: ["create","update","delete"],
    ...ownerAc.statements
});

