function calculateAge(dob: string) {
  if (!dob) return 0;
  const date = new Date(dob);
  if (isNaN(date.getTime())) return 0;
  const diff = Date.now() - date.getTime();
  return new Date(diff).getUTCFullYear() - 1970;
}
export default calculateAge