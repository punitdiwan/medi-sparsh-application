import SymptomTypeManager from "@/Components/doctor/symptom/symptomTypeManager";
import SymptomManager from "@/Components/doctor/symptom/symptomManager";

export const dynamic = "force-dynamic";

const page = () => {
  return (
    <div className="space-y-6">
      <SymptomManager />
    </div>
  );
};

export default page;