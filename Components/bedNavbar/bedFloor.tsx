import { Floor } from "./bedNavType";
import { WardCard } from "./bedward";

export function FloorSection({ floor }: { floor: Floor }) {
  return (
    <div>
      <div className="mb-4">
        <span className="inline-block bg-secondary text-primary  px-3 py-1 rounded-full font-semibold text-lg">
          {floor.floorName}
        </span>
      </div>

      <div className="flex flex-col gap-6 mb-8">
        {floor.wards.map((ward) => (
          <WardCard key={ward.id} ward={ward} />
        ))}
      </div>
    </div>
  );
}
