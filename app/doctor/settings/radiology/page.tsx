
import RadiologyCategoryManager from "@/Components/doctor/settings/radiology/RadiologyCategoryManager";

export const dynamic = "force-dynamic";

const page = () => {
    return (
        <div className="space-y-6">
            <RadiologyCategoryManager />
        </div>
    );
};

export default page;
