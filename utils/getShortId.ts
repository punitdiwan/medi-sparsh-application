
export function getShortId(id: string): string {
  if (!id) return "";
  // Remove non-alphanumeric characters (like dashes)
  const alphanumeric = id.replace(/[^a-zA-Z0-9]/g, "");
  return alphanumeric.slice(0, 12);
}
