import { isAdmin, getDashboardData } from '@/lib/adminActions';
import AdminLogin from '@/app/admin/AdminLogin';
import AdminPanel from '@/app/admin/AdminPanel';

const AdminPage = async () => {
  const authed = await isAdmin();
  if (!authed) return <AdminLogin />;

  const data = await getDashboardData();
  return <AdminPanel initialData={data} />;
};

export default AdminPage;
