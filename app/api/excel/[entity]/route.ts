
import { NextResponse } from "next/server";

type ExcelConfig = {
  title: string;
  template: {
    filename: string;
    columns: { key: string; label: string }[];
    downloadUrl: string;
  };
  upload: {
    url: string;
    accept: string[];
  };
};

const EXCEL_CONFIG_MAP: Record<string, ExcelConfig> = {
  patient: {
    title: "Patient",
    template: {
        filename: "patient_template.xlsx",
        columns: [
        { key: "name", label: "Patient Name" },
        { key: "gender", label: "Gender" },
        { key: "dob", label: "Date of Birth" },
        { key: "email", label: "Email" },
        { key: "mobileNumber", label: "Mobile Number" },
        { key: "address", label: "Address" },
        { key: "city", label: "City" },
        { key: "state", label: "State" },
        { key: "areaOrPin", label: "Area / PIN" },
        { key: "bloodGroup", label: "Blood Group" },
        { key: "referredByDr", label: "Referred By Doctor" },
        { key: "scheduledBy", label: "Scheduled By" },
        ],
        downloadUrl: "/api/excel/patient/template",
    },
    upload: {
        url: "/api/excel/patient/upload",
        accept: [".xlsx"],
    },
    },
  vital:{
    title: "Vital",
    template:{
        filename:"vital_template.xlsx",
        columns:[
        { key: "name",label: "Vital Name",},
        { key: "vitalsUnit", label: "Unit",},
        { key: "from", label: "From Value",},
        { key: "to", label: "To Value", },
      ],
        downloadUrl:"/app/api/excel"
    },
    upload:{
        url:"/api/excel/vital/upload",
        accept:[".xlsx"]
    }
  },
  hopitalChargeUnit:{
    title: "Hospital Charge Unit",
    template:{
        filename:"hospital_charge_unit_template.xlsx",
        columns:[
            {key :"name",label:"Unit Name"}
        ],
        downloadUrl:""
    },
    upload:{
        url:"/api/excel/hospitalChargeUnit/upload",
        accept:[".xlsx"]
    }
  },
  hospitalChargeTaxCategory:{
    title: "Hospital Tax Category",
    template:{
        filename:"hospital_charge_tax_category_template.xlsx",
        columns:[
            { key: "name", label: "Tax Category Name" },
            { key: "percent", label: "Percent (%)" }
        ],
        downloadUrl:""
    },
    upload:{
        url:"/api/excel/hospitalChargeTaxCategory/upload",
        accept:[".xlsx"]
    }
  },
  medicineUnit:{
    title:"Medicine Unit",
    template:{
      filename:"medicine_unit_template.xlsx",
      columns:[
        { key:"name", label:"Unit Name"}
      ],
      downloadUrl:""
    },
    upload:{
      url:"/api/excel/medicneUnit/upload",
      accept:[".xlsx"]
    }
  }
};

export async function GET(
  req: Request,
  context: { params: Promise<{ entity: string }> } 
) {
  const { params } = context;
  const { entity } = await params; 

  const config = EXCEL_CONFIG_MAP[entity];

  if (!config) {
    return NextResponse.json({ error: "Invalid excel entity" }, { status: 404 });
  }

  return NextResponse.json(config);
}
