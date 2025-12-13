// import { NextResponse } from "next/server";
// import ExcelJS from "exceljs";
// import { db } from "@/db";
// import { eq, and } from "drizzle-orm";
// import {
//   pharmacyMedicines,
//   medicineCategories,
//   medicineCompanies,
//   medicineUnits,
//   medicineGroups,
// } from "@/db/schema";
// import { getActiveOrganization } from "@/lib/getActiveOrganization";

// export async function POST(req: Request) {
//   try {
//     /* ---------------- Auth ---------------- */
//     const org = await getActiveOrganization();
//     if (!org) {
//       return NextResponse.json(
//         { error: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     const hospitalId = org.id;

//     /* ---------------- File ---------------- */
//     const formData = await req.formData();
//     const file = formData.get("file") as File | null;

//     if (!file) {
//       return NextResponse.json(
//         { error: "File not provided" },
//         { status: 400 }
//       );
//     }

//     const buffer = Buffer.from(await file.arrayBuffer());

//     /* ---------------- Workbook ---------------- */
//     const workbook = new ExcelJS.Workbook();
//     await workbook.xlsx.load(buffer);

//     const sheet = workbook.getWorksheet("Medicines");
//     if (!sheet) {
//       return NextResponse.json(
//         { error: "Medicines sheet not found" },
//         { status: 400 }
//       );
//     }

//     /* ---------------- Master Data ---------------- */
//     const [categories, companies, units, groups] = await Promise.all([
//       db
//         .select()
//         .from(medicineCategories)
//         .where(eq(medicineCategories.hospitalId, hospitalId)),

//       db
//         .select()
//         .from(medicineCompanies)
//         .where(eq(medicineCompanies.hospitalId, hospitalId)),

//       db
//         .select()
//         .from(medicineUnits)
//         .where(eq(medicineUnits.hospitalId, hospitalId)),

//       db
//         .select()
//         .from(medicineGroups)
//         .where(eq(medicineGroups.hospitalId, hospitalId)),
//     ]);

//     const categoryMap = new Map(
//       categories.map((c) => [c.name.toLowerCase(), c.id])
//     );
//     const companyMap = new Map(
//       companies.map((c) => [c.name.toLowerCase(), c.id])
//     );
//     const unitMap = new Map(
//       units.map((u) => [u.name.toLowerCase(), u.id])
//     );
//     const groupMap = new Map(
//       groups.map((g) => [g.name.toLowerCase(), g.id])
//     );

//     /* ---------------- Insert ---------------- */
//     let inserted = 0;

//     await db.transaction(async (tx) => {
//       for (let row = 2; row <= sheet.rowCount; row++) {
//         const r = sheet.getRow(row);

//         const name = String(r.getCell(1).value || "").trim();
//         const categoryName = String(r.getCell(2).value || "").trim();
//         const companyName = String(r.getCell(3).value || "").trim();
//         const unitName = String(r.getCell(4).value || "").trim();
//         const groupName = String(r.getCell(5).value || "").trim();
//         const notes = String(r.getCell(6).value || "").trim();

//         if (!name) continue;

//         if (!categoryName || !companyName || !unitName) {
//           throw new Error(`Row ${row}: Required fields missing`);
//         }

//         const categoryId = categoryMap.get(categoryName.toLowerCase());
//         if (!categoryId) {
//           throw new Error(`Row ${row}: Invalid category "${categoryName}"`);
//         }

//         const companyId = companyMap.get(companyName.toLowerCase());
//         if (!companyId) {
//           throw new Error(`Row ${row}: Invalid company "${companyName}"`);
//         }

//         const unitId = unitMap.get(unitName.toLowerCase());
//         if (!unitId) {
//           throw new Error(`Row ${row}: Invalid unit "${unitName}"`);
//         }

//         const groupId = groupName
//           ? groupMap.get(groupName.toLowerCase()) ?? null
//           : null;

//         /* ---- Duplicate check ---- */
//         const exists = await tx.query.pharmacyMedicines.findFirst({
//           where: and(
//             eq(pharmacyMedicines.name, name),
//             eq(pharmacyMedicines.hospitalId, hospitalId)
//           ),
//         });

//         if (exists) continue;

//         await tx.insert(pharmacyMedicines).values({
//           name,
//           categoryId,
//           companyId,
//           unitId,
//           groupId,
//           notes,
//           hospitalId,
//         });

//         inserted++;
//       }
//     });

//     return NextResponse.json({
//       success: true,
//       inserted,
//     });
//   } catch (err: any) {
//     return NextResponse.json(
//       { error: err.message || "Upload failed" },
//       { status: 400 }
//     );
//   }
// }
