"use client";
import { authClient } from "@/lib/auth-client";
export const dynamic = "force-dynamic";

const page = () => {

    return (
        <>
            <div onClick={async () => {
                // const org = await authClient.organization.getFullOrganization({
                //     query: {
                //         organizationId: "XVeNOXOH6znV3vdz8R5SytTxcaKdcDgF",
                //     }
                // });
                // console.log("Organization details:", org);
                // const c = await authClient.organization.updateMemberRole({
                //     organizationId: org.data!.id,
                //     role: ["owner", "admin"],
                //     memberId: "zm3vxvR6XoQMZ6lYiWYjBhR1BH0G5bAT"
                // });

                // console.log("Update member role response:", c.data);

                const hasPermission = await authClient.organization.hasPermission({
                    permissions: {
                        project: ["show"],
                    }                  
                });
                console.log("Has permission:", hasPermission.data);

                // console.log("Roles page clicked");
                // const permission = {
                //     project: ["create", "update", "delete"]
                // }
                const permission = {
                    project: ["create", "show"]
                }

                // await authClient.organization.createRole({
                //     role: "newRole", // required
                //     permission: permission,
                //     organizationId: "XVeNOXOH6znV3vdz8R5SytTxcaKdcDgF",
                // });
            }}>
                hello roles page
            </div>
        </>
    )
}

export default page