import { cookies } from "next/headers";

// Dipakai di semua endpoint /api/admin/* untuk cek apakah request berasal
// dari admin yang sudah login (cookie admin_email cocok dengan ADMIN_EMAIL).
export async function isAdminAuthorized(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminEmail = cookieStore.get("admin_email")?.value;
  return Boolean(adminEmail && adminEmail === process.env.ADMIN_EMAIL);
}