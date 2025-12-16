import { validateServerSession } from "../validateSession"
import { defineAbilityFor } from "./ability"

export async function getServerAbility() {
  const session = await validateServerSession()
  console.log("session",session);
//   const role = session?.user?.role ?? "doctor"
  const role = 'dcotor';

  return defineAbilityFor(role)
}
