// import { AbilityBuilder } from "@casl/ability";
// import { AppAbility } from "./ability";

// type PermissionMap = Record<string, string[]>;

// export function buildAbilityFromPermissions(
//   permissions: PermissionMap
// ) {
//   const { can, build } = new AbilityBuilder(AppAbility);

//   Object.entries(permissions).forEach(([subject, actions]) => {
//     actions.forEach((action) => {
//       can(action as any, subject as any);
//     });
//   });

//   return build({
//     detectSubjectType: (item) =>
//       typeof item === "string" ? item : item.__type,
//   });
// }
