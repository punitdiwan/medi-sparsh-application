
const TrialNav = ({ endDate }: { endDate: string }) => {
    const { message, variant } = getTrialStatus(endDate);
    return (
        <>
            <div
                className={` w-full border px-4 py-2 text-center text-sm font-medium
                ${VARIANT_STYLES[variant]}`}
            >
                🚀 Trial Mode — Some features may be limited ({message})
            </div>
        </>
    )
}

export default TrialNav

function getTrialStatus(trialEndsAt: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const end = new Date(trialEndsAt);
    end.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil(
        (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays < 0) {
        return { message: "Trial expired", variant: "expired" };
    }

    if (diffDays === 0) {
        return { message: "Last day of trial", variant: "last" };
    }

    if (diffDays === 1) {
        return { message: "1 day remaining", variant: "urgent" };
    }

    if (diffDays <= 3) {
        return { message: `${diffDays} days remaining`, variant: "warning" };
    }

    return { message: `${diffDays} days remaining`, variant: "safe" };
}
const VARIANT_STYLES: Record<string, string> = {
    safe:
        "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",

    warning:
        "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",

    urgent:
        "bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",

    last:
        "bg-orange-100 text-orange-900 border-orange-300 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700",

    expired:
        "bg-red-50 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
};

