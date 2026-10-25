const DEFAULT_PASSWORD = "";
const SESSION_MAX_AGE_SEC = 24 * 60 * 60;

export async function verifyDashboardPassword(password) {
  if (typeof password !== "string") return false;
  const settings = await getSettings();
  const storedHash = settings?.password;

  if (storedHash) return bcrypt.compare(password, storedHash);

  const initialPassword = process.env.INITIAL_PASSWORD ?? DEFAULT_PASSWORD;
  return password === initialPassword;
}
