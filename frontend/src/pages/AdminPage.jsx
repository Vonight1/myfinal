import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { statusColor, statusLabel } from '../lib/utils';

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) { navigate('/login'); return; }
    if (user?.role === 'admin') adminAPI.getDashboard().then(r => { if (r.data.success) setStats(r.data.data); }).finally(() => setLoading(false));
  }, [user, authLoading]);

  useEffect(() => {
    if (tab === 'users') adminAPI.getUsers().then(r => { if (r.data.success) setUsers(r.data.data || []); });
    else if (tab === 'jobs') adminAPI.getAllJobs().then(r => { if (r.data.success) setJobs(r.data.data || []); });
    else if (tab === 'reviews') adminAPI.getReviews().then(r => { if (r.data.success) setReviews(r.data.data || []); });
  }, [tab]);

  const banUser = async (id, ban) => { await adminAPI.banUser(id, ban); adminAPI.getUsers().then(r => { if (r.data.success) setUsers(r.data.data || []); }); };
  const verifyJob = async (id, status) => { await adminAPI.verifyJob(id, status); adminAPI.getAllJobs().then(r => { if (r.data.success) setJobs(r.data.data || []); }); adminAPI.getDashboard().then(r => { if (r.data.success) setStats(r.data.data); }); };
  const deleteReview = async (id) => { if (!confirm('ລຶບ review ນີ້?')) return; await adminAPI.deleteReview(id); adminAPI.getReviews().then(r => { if (r.data.success) setReviews(r.data.data || []); }); };

  if (authLoading || loading) return <div className="flex justify-center py-32"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">⚙️ Admin Dashboard</h1>
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[['dashboard', '📊 ສະຖິຕິ'], ['users', '👥 ຜູ້ໃຊ້'], ['jobs', '📋 ວຽກ'], ['reviews', '⭐ Reviews']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${tab === k ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{l}</button>
        ))}
      </div>

      {tab === 'dashboard' && stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[['👥', 'ຜູ້ໃຊ້ທັງໝົດ', stats.total_users, 'bg-blue-50 text-blue-700'], ['🏢', 'ບໍລິສັດ', stats.total_companies, 'bg-purple-50 text-purple-700'], ['📋', 'ວຽກທັງໝົດ', stats.total_jobs, 'bg-green-50 text-green-700'], ['📤', 'ການສະໝັກ', stats.total_applications, 'bg-orange-50 text-orange-700'], ['⏳', 'ລໍອະນຸມັດ', stats.pending_jobs, 'bg-yellow-50 text-yellow-700'], ['🆕', 'ໃໝ່ມື້ນີ້', stats.new_users_today, 'bg-pink-50 text-pink-700']].map(([icon, label, val, cls], i) => (
            <div key={i} className={`${cls} rounded-2xl p-5`}><div className="text-2xl mb-1">{icon}</div><div className="text-3xl font-bold">{val}</div><div className="text-xs opacity-70 mt-1">{label}</div></div>
          ))}
        </div>
      )}

      {tab === 'users' && (
        <div className="bg-white rounded-2xl border overflow-x-auto">
          <table className="w-full text-sm"><thead className="bg-gray-50"><tr>{['ຊື່', 'ອີເມວ', 'ບົດບາດ', 'ສະຖານະ', 'ຈັດການ'].map(h => <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600">{h}</th>)}</tr></thead>
            <tbody>{users.map(u => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{u.name}</td><td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs ${u.role === 'company' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{u.role === 'company' ? 'ບໍລິສັດ' : 'ຜູ້ຊອກວຽກ'}</span></td>
                <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs ${u.is_banned ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{u.is_banned ? 'ຖືກລະງັບ' : 'ໃຊ້ງານ'}</span></td>
                <td className="px-4 py-3"><button onClick={() => banUser(u.id, !u.is_banned)} className={`text-xs px-3 py-1.5 rounded-lg text-white ${u.is_banned ? 'bg-green-600' : 'bg-red-600'}`}>{u.is_banned ? 'ປົດລະງັບ' : 'ລະງັບ'}</button></td>
              </tr>
            ))}{users.length === 0 && <tr><td colSpan={5} className="text-center py-10 text-gray-500">ບໍ່ມີຂໍ້ມູນ</td></tr>}</tbody></table>
        </div>
      )}

      {tab === 'jobs' && (
        <div className="bg-white rounded-2xl border overflow-x-auto">
          <table className="w-full text-sm"><thead className="bg-gray-50"><tr>{['ຊື່ວຽກ', 'ບໍລິສັດ', 'ສະຖານະ', 'ຈັດການ'].map(h => <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600">{h}</th>)}</tr></thead>
            <tbody>{jobs.map(j => (
              <tr key={j.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{j.title}</td><td className="px-4 py-3 text-gray-500">{j.company_name || '-'}</td>
                <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs ${statusColor[j.status] || 'bg-gray-100'}`}>{statusLabel[j.status] || j.status}</span></td>
                <td className="px-4 py-3"><div className="flex gap-2">
                  {j.status === 'pending' && <><button onClick={() => verifyJob(j.id, 'approved')} className="text-xs bg-green-600 text-white px-3 py-1 rounded-lg">ອະນຸມັດ</button><button onClick={() => verifyJob(j.id, 'rejected')} className="text-xs bg-red-600 text-white px-3 py-1 rounded-lg">ປະຕິເສດ</button></>}
                  {j.status === 'approved' && <button onClick={() => verifyJob(j.id, 'closed')} className="text-xs bg-gray-600 text-white px-3 py-1 rounded-lg">ປິດ</button>}
                </div></td>
              </tr>
            ))}{jobs.length === 0 && <tr><td colSpan={4} className="text-center py-10 text-gray-500">ບໍ່ມີຂໍ້ມູນ</td></tr>}</tbody></table>
        </div>
      )}

      {tab === 'reviews' && (
        <div className="space-y-3">
          {reviews.length === 0 ? <div className="text-center py-16 text-gray-500">ບໍ່ມີ reviews</div> : reviews.map(r => (
            <div key={r.id} className="bg-white rounded-xl p-4 border flex items-center justify-between">
              <div><div className="font-medium text-sm">{r.user_name} → {r.job_title}</div><div className="text-yellow-500 text-sm">{'⭐'.repeat(r.rating)}</div>{r.comment && <p className="text-sm text-gray-500 mt-1">{r.comment}</p>}</div>
              <button onClick={() => deleteReview(r.id)} className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200 shrink-0">🗑️ ລຶບ</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}