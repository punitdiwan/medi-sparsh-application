import {
  AbilityBuilder,
  createMongoAbility,
  type MongoAbility,
} from "@casl/ability";

export type AppAbility = MongoAbility;

type PermissionJSON = Record<string, string[]>;
// example:
// {
//   appointment: ["create", "read"],
//   patient: ["read"]
// }

export function defineAbilityFromJSON(
  permissions: PermissionJSON
): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(
    createMongoAbility
  );

  if (!permissions) {
    return build();
  }

  Object.entries(permissions).forEach(([subject, actions]) => {
    actions.forEach((action) => {
      can(action as any, subject as any);
    });
  });

  return build();
}
