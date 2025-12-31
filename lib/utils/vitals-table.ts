import { IPDVitalRecord } from "@/Components/doctor/ipd/vitals/vitalsPage";


export function buildVitalsMatrix(records: IPDVitalRecord[]) {
  const headers: [string, any][] = [];
  const rows: Record<string, any> = {};

  records.forEach((rec) => {
    rec.vitals.forEach((v) => {
      if (!headers.find(([name]) => name === v.vitalName)) {
        headers.push([v.vitalName, { unit: v.unit, range: v.range }]);
      }
      if (!rows[v.date]) rows[v.date] = {};
      if (!rows[v.date][v.vitalName]) rows[v.date][v.vitalName] = [];

      // Preserve id and recordId
      rows[v.date][v.vitalName].push({
        id: v.id,          
        recordId: rec.id,  // parent record id
        value: v.vitalValue,
        vitalId: v.vitalId,
        time: v.time,
      });
    });
  });

  return { headers, rows };
}

