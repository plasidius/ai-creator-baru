import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function AdminDashboard() {
  const { data: users } = await supabase
    .from('profiles')
    .select('id, email, full_name, package, created_at')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6">👤 Admin Dashboard</h1>
      <p className="text-gray-500 mb-4">
        Total user: <strong>{users?.length || 0}</strong>
      </p>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Nama</th>
              <th className="px-6 py-3 text-left">Paket</th>
              <th className="px-6 py-3 text-left">Bergabung</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users?.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">{user.full_name || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    user.package === 'Premium' ? 'bg-yellow-100 text-yellow-700' :
                    user.package === 'Pro' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {user.package || 'Free'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-400">
                  {new Date(user.created_at).toLocaleDateString('id-ID')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}