// import {
//   AbilityBuilder,
//   AbilityClass,
//   Ability,
//   ExtractSubjectType,
// } from "@casl/ability"

// export type Actions = "manage" | "create" | "read" | "update" | "delete"

// export type Subjects =
//   | "Appointment"
//   | "Patient"
//   | "Billing"
//   | "all"

// export type AppAbility = Ability<[Actions, Subjects]>

// export function defineAbilityFor(role: string) {
//   const { can, cannot, build } = new AbilityBuilder<AppAbility>(
//     Ability as AbilityClass<AppAbility>
//   )

//   if (role === "owner") {
//     can("manage", "all")
//   }

//   if (role === "doctor") {
//     can("read", "Patient")
//     can("read", "Appointment")
//     can("update", "Appointment")
//   }

//   if (role === "receptionist") {
//     can("create", "Appointment")
//     can("read", "Patient")
//     can("create", "Patient")
//   }


//   return build({
//     detectSubjectType: (item) =>
//       item as ExtractSubjectType<Subjects>,
//   })
// }

// import { createMongoAbility } from "@casl/ability";

// export function defineAbility(permissions: Record<string, string[]>) {
//   const { can, build } = new AbilityBuilder(createMongoAbility);

//   Object.entries(permissions).forEach(([subject, actions]) => {
//     actions.forEach((action) => {
//       can(action, subject);
//     });
//   });

//   return build();
// }
