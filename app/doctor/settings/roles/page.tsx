"use client";

import { authClient } from "@/lib/auth-client";
export const dynamic = "force-dynamic";
const page = () => {

    return (
        <>
            <div onClick={async() => {
                console.log("Roles page clicked");
                const permission = {
                    project: ["create", "update", "delete"]
                }
                await authClient.organization.createRole({
                    role: "my-unique-role", // required
                    permission: permission,
                    organizationId: "XVeNOXOH6znV3vdz8R5SytTxcaKdcDgF",
                });
            }}>
                hello roles page
            </div>
        </>
    )
}

export default page