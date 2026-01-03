"use client";

import React, { createContext, useContext, ReactNode } from "react";

interface DischargeContextType {
    dischargeStatus: string;
    isDischarged: boolean;
}

const DischargeContext = createContext<DischargeContextType | undefined>(undefined);

export function DischargeProvider({
    children,
    dischargeStatus
}: {
    children: ReactNode;
    dischargeStatus: string;
}) {
    const isDischarged = dischargeStatus !== "pending";

    return (
        <DischargeContext.Provider value={{ dischargeStatus, isDischarged }}>
            {children}
        </DischargeContext.Provider>
    );
}

export function useDischarge() {
    const context = useContext(DischargeContext);
    if (context === undefined) {
        // Return a default value instead of throwing, to avoid breaking pages if used outside provider
        return { dischargeStatus: "pending", isDischarged: false };
    }
    return context;
}
