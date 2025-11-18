import "dotenv/config";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth"
import { specializations } from "@/lib/db/migrations/schema";
import { eq } from "drizzle-orm";

const addSpecialization = async () => {
  const specializationData = [
    { name: "General Medicine", description: "General medical practice" },
    { name: "Cardiology", description: "Heart and cardiovascular system" },
    { name: "Dermatology", description: "Skin, hair, and nails" },
    { name: "Neurology", description: "Brain and nervous system" },
    { name: "Orthopedics", description: "Bones, joints, and muscles" },
    { name: "Pediatrics", description: "Children's health" },
    { name: "Gynecology", description: "Women's reproductive health" },
    { name: "Ophthalmology", description: "Eye care" },
    { name: "ENT", description: "Ear, nose, and throat" },
    { name: "Psychiatry", description: "Mental health" },
  ];



  await db.transaction(async (tx) => {
    for (const spec of specializationData) {
      const [existingSpec] = await tx
        .select()
        .from(specializations)
        .where(eq(specializations.name, spec.name))
        .limit(1);

      if (!existingSpec) {
        await tx.insert(specializations).values(spec);
        console.log(`✅ Created specialization: ${spec.name}`);
      } else {
        console.log(`ℹ️ Specialization exists: ${spec.name}`);
      }
    }


  });
}


async function seed() {
  console.log("🌱 Seeding BetterAuth data...");
  // Sample specializations



  // Insert organization record manually
  // await db.execute(sql`
  //   INSERT INTO auth.organization (id, name, slug)
  //   VALUES (uuid_generate_v7(), 'Medisparsh', 'medisparsh')
  //   ON CONFLICT (slug) DO NOTHING;
  // `);
  // console.log("✅ Organization 'Medisparsh' created!");

  // const userResp = await auth.api.signUpEmail({
  //   body: {
  //     name: "pspcial",
  //     email: "special@medisparsh.com",
  //     password: "password",
  //   },
  // });
  // console.log("✅ User 'User' created!", userResp);

  // const org = await auth.api.createOrganization({
  //   body: {
  //     name: "Medisparsh",
  //     slug: "medisparsh",
  //     userId: userResp.user.id,
  //     logo: "https://example.com/logo.png",
  //     metadata: {
  //       subdomain: "medisparsh.com",
  //       address: "123 Medical Street, City",
  //       phone: "+91-1234567890",
  //       email: "contact@medisparsh.com",
  //     },

  //   },
  // });
  // console.log("✅ Organisation created!", org);



  await addSpecialization();


}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
