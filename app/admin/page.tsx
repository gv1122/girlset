import { isAdmin, getDashboardData } from "@/app/admin/actions";
import AdminLogin from "@/app/admin/AdminLogin";
import AdminPanel from "@/app/admin/AdminPanel";

export default async function AdminPage() {
  const authed = await isAdmin();
  if (!authed) return <AdminLogin />;

  const data = await getDashboardData();
  return <AdminPanel initialData={data} />;
}
