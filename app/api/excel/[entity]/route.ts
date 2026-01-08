
import { charges } from "@/db/schema";
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

const fileFormate = [".xlsx"];

const EXCEL_CONFIG_MAP: Record<string, ExcelConfig> = {
  patient: {
    title: "Patient",
    template: {
        filename: "patient_template.xlsx",
        columns: [
        ],
        downloadUrl: "/api/excel/patient/template",
    },
    upload: {
        url: "/api/excel/patient/upload",
        accept: fileFormate,
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
        accept:fileFormate
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
        accept:fileFormate
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
        accept:fileFormate
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
      accept:fileFormate
    }
  },
  medicineGroup:{
    title:"Medicine Group",
    template:{
      filename:"medicine_group_template.xlsx",
      columns:[
        { key:"name", label:"Group Name"}
      ],
      downloadUrl:""
    },
    upload:{
      url:"/api/excel/medicineGroup/upload",
      accept:fileFormate
    }
  },
  symptomeType:{
    title:"Symptome Type",
    template:{
      filename:"symptome_type_template.xlsx",
      columns:[
        {key:"name", label:"Symptom Name"}
      ],
      downloadUrl:""
    },
    upload:{
      url:"/api/excel/symptomType/upload",
      accept:fileFormate
    }

  },
  symptoms:{
    title:"Symptom List",
     template:{
      filename:"symptome_list_template.xlsx",
      columns:[
      ],
      downloadUrl:"/api/excel/symptom/template"
    },
    upload:{
      url:"/api/excel/symptom/upload",
      accept:fileFormate
    }
  },
  operationCategories:{
    title:"Operation Categories",
     template:{
      filename:"operation_categories_template.xlsx",
      columns:[
        { key:"name", label:"Category Name"}
      ],
      downloadUrl:""
    },
    upload:{
      url:"/api/excel/operationCategory/upload",
      accept:fileFormate
    }
  },
  operations:{
    title:"Operations",
     template:{
      filename:"operations_template.xlsx",
      columns:[
      ],
      downloadUrl:"/api/excel/operation/template"
    },
    upload:{
      url:"/api/excel/operation/upload",
      accept:fileFormate
    }
  },
  beds:{
    title:"Beds",
     template:{
      filename:"beds_template.xlsx",
      columns:[
      ],
      downloadUrl:"/api/excel/bed/template"
    },
    upload:{
      url:"/api/excel/bed/upload",
      accept:fileFormate
    }
  },
  chargesCategories:{
    title:"Charges Categories",
     template:{
      filename:"charges_categories_template.xlsx",
      columns:[
      ],
      downloadUrl:"/api/excel/chargesCategory/template"
    },
    upload:{
      url:"/api/excel/chargesCategory/upload",
      accept:fileFormate
    }
  },
  charges:{
    title:"Charges",
      template:{
        filename:"charges_template.xlsx",
        columns:[
        ],
        downloadUrl:"/api/excel/charges/template"
      },
      upload:{
        url:"/api/excel/charges/upload",
        accept:fileFormate
      }
  },
  medicineCompany :{
    title:"Medicine Company",
      template:{
        filename:"medicine_company_template.xlsx",
        columns:[
          { key:"name", label:"Medicine Company Name"}
        ],
        downloadUrl:""
      },
      upload:{
        url:"/api/excel/medicineCompany/upload",
        accept:fileFormate
      }
  },
  medicineSupplier :{
    title:"Medicine Supplier",
       template:{
          filename:"medicine_supplier_template.xlsx",
          columns: [
            { key: "supplierName", label: "Supplier Company Name" },
            { key: "contactNumber", label: "Contact Number" },
            { key: "address", label: "Address" },
            { key: "contactPerson", label: "Contact Person" },
            { key: "contactPersonNumber", label: "Person Phone" },
            { key: "drugLicenseNumber", label: "Drug License Number" }
          ],
          downloadUrl:""
       },
       upload:{
          url:"/api/excel/medicineSuplier/upload",
          accept:fileFormate
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
