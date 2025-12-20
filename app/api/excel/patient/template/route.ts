export const runtime = "nodejs";

import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { getActiveOrganization } from "@/lib/getActiveOrganization";

const GENDERS = ["Male", "Female", "Other"];

export async function GET() {
  const org = await getActiveOrganization();
  if (!org) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workbook = new ExcelJS.Workbook();

  const mainSheet = workbook.addWorksheet("Patients");

  mainSheet.addRow([
    "name",          
    "gender",        
    "dob",           
    "email",         
    "mobileNumber",  
    "address",       
    "city",          
    "state",         
    "areaOrPin",     
    "bloodGroup",    
    "referredByDr",  
  ]);

  for (let i = 0; i < 500; i++) {
    mainSheet.addRow([]);
  }

  const genderSheet = workbook.addWorksheet("Genders");
  genderSheet.addRow(["name"]);

  GENDERS.forEach((g) => {
    genderSheet.addRow([g]);
  });

  for (let row = 2; row <= 501; row++) {
    mainSheet.getCell(`B${row}`).dataValidation = {
      type: "list",
      allowBlank: false,
      formulae: [`Genders!$A$2:$A$${GENDERS.length + 1}`],
      showErrorMessage: true,
      errorTitle: "Invalid Gender",
      error: "Please select gender from dropdown only",
    };

    mainSheet.getCell(`C${row}`).numFmt = "dd-mm-yyyy";
  }

  mainSheet.columns = [
    { width: 25 }, 
    { width: 15 }, 
    { width: 15 }, 
    { width: 25 }, 
    { width: 18 }, 
    { width: 30 }, 
    { width: 18 }, 
    { width: 18 }, 
    { width: 15 }, 
    { width: 15 }, 
    { width: 25 }, 
  ];

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        'attachment; filename="patient_template.xlsx"',
    },
  });
}
