import { db } from "@/db"; // apne db path ke according change karo
import { masterModules, modules, organization } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

async function seed() {
  try {
    console.log("🌱 Seeding started...");

    // 👉 Yaha hospitalId pass karo (ya organization create karke le lo)
    const hospitalId = "ygGeCQegHGHni2xdwihOjxtkvhA3WbUX"; 

    // Check hospital exist karta hai ya nahi
    const hospital = await db
      .select()
      .from(organization)
      .where(eq(organization.id, hospitalId));

    if (!hospital.length) {
      console.log("❌ Hospital not found");
      return;
    }
    console.log("Hospital Name",hospital[0].name)

    // Saare master modules lao
    const allMasterModules = await db
      .select()
      .from(masterModules);

    if (!allMasterModules.length) {
      console.log("❌ No master modules found");
      return;
    }

    // Pehle check karo ki already insert to nahi hai
    const existingModules = await db
      .select()
      .from(modules)
      .where(eq(modules.hospitalId, hospitalId));

    if (existingModules.length > 0) {
      console.log("⚠ Modules already seeded for this hospital");
      return;
    }

    // Insert mapping
    const moduleInserts = allMasterModules.map((m) => ({
      name: m.name,
      hospitalId: hospitalId,
      moduleId: m.id,
    }));

    await db.insert(modules).values(moduleInserts);

    console.log("✅ Modules seeded successfully!");
  } catch (error) {
    console.error("❌ Seed error:", error);
  }
}

seed();