import AdminPanel from '@/components/AdminPanel';
import AdminLogin from '@/components/AdminLogin';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, isValidAdminSession } from '@/lib/admin-auth';

export const metadata = { title: 'Portfolio Admin — Kush Khurana' };

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const isAuthenticated = isValidAdminSession(cookieStore.get(ADMIN_COOKIE)?.value);
  return isAuthenticated ? <AdminPanel /> : <AdminLogin />;
}
