import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { statusColor, statusLabel } from '../lib/utils';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [settings, setSettings] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Modal states
  const [userType, setUserType] = useState('applicant');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [catForm, setCatForm] = useState({ name: '', description: '', icon: '' });
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notifForm, setNotifForm] = useState({ title: '', message: '', type: 'info', target: 'all' });
  const [showPwModal, setShowPwModal] = useState(false);
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm: '' });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) { navigate('/login'); return; }
    if (user?.role === 'admin') {
      adminAPI.getDashboard().then(r => { if (r.data.success) setStats(r.data.data); }).finally(() => setLoading(false));
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (tab === 'users') adminAPI.getUsers(userType).then(r => { if (r.data.success) setUsers(r.data.data || []); });
    else if (tab === 'jobs') adminAPI.getAllJobs().then(r => { if (r.data.success) setJobs(r.data.data || []); });
    else if (tab === 'reviews') adminAPI.getReviews().then(r => { if (r.data.success) setReviews(r.data.data || []); });
    else if (tab === 'categories') loadCategories();
    else if (tab === 'notifications') adminAPI.getAllNotifications().then(r => { if (r.data.success) setNotifications(r.data.data || []); });
    else if (tab === 'complaints') adminAPI.getComplaints().then(r => { if (r.data.success) setComplaints(r.data.data || []); });
    else if (tab === 'settings') adminAPI.getSettings().then(r => { if (r.data.success) setSettings(r.data.data || []); });
  }, [tab, userType]);

  const loadCategories = async () => {
    // Use public endpoint
    const res = await fetch('/api/categories').then(r => r.json());
    if (res.success) setCategories(res.data || []);
  };

  const banUser = async (id, ban) => {
    await adminAPI.banUser(id, ban);
    adminAPI.getUsers(userType).then(r => { if (r.data.success) setUsers(r.data.data || []); });
  };
  const verifyJob = async (id, status) => {
    await adminAPI.verifyJob(id, status);
    adminAPI.getAllJobs().then(r => { if (r.data.success) setJobs(r.data.data || []); });
  };

  // ===== Category CRUD =====
  const openCatModal = (cat) => {
    if (cat) { setEditingCat(cat); setCatForm({ name: cat.name, description: cat.description || '', icon: cat.icon || '' }); }
    else { setEditingCat(null); setCatForm({ name: '', description: '', icon: '' }); }
    setShowCatModal(true);
  };
  const saveCategory = async (e) => {
    e.preventDefault();
    if (editingCat) await adminAPI.updateCategory(editingCat.id, catForm);
    else await adminAPI.createCategory(catForm);
    setShowCatModal(false); loadCategories();
  };
  const deleteCat = async (id) => {
    if (!confirm('ລຶບໝວດໝູ່ນີ້?')) return;
    try { await adminAPI.deleteCategory(id); loadCategories(); }
    catch (err) { alert(err.response?.data?.message || 'ລຶບບໍ່ໄດ້'); }
  };

  // ===== Notification =====
  const sendNotif = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.sendNotification(notifForm);
      setShowNotifModal(false);
      setNotifForm({ title: '', message: '', type: 'info', target: 'all' });
      adminAPI.getAllNotifications().then(r => { if (r.data.success) setNotifications(r.data.data || []); });
      alert('ສົ່ງສຳເລັດ!');
    } catch { alert('ສົ່ງບໍ່ໄດ້'); }
  };

  // ===== Complaint =====
  const handleComplaint = async (id, status, note = '') => {
    await adminAPI.updateComplaint(id, { status, admin_note: note });
    adminAPI.getComplaints().then(r => { if (r.data.success) setComplaints(r.data.data || []); });
  };

  // ===== Settings =====
  const saveSetting = async (id, value) => {
    await adminAPI.updateSetting(id, value);
    adminAPI.getSettings().then(r => { if (r.data.success) setSettings(r.data.data || []); });
  };

  // ===== Change Password =====
  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm) { alert('ລະຫັດໃໝ່ບໍ່ກົງກັນ'); return; }
    try {
      await adminAPI.changePassword({ old_password: pwForm.old_password, new_password: pwForm.new_password });
      setShowPwModal(false);
      setPwForm({ old_password: '', new_password: '', confirm: '' });
      alert('ປ່ຽນລະຫັດສຳເລັດ!');
    } catch (err) { alert(err.response?.data?.message || 'ບໍ່ສຳເລັດ'); }
  };

  // ===== PDF =====
  const generatePDF = async () => {
    setGenerating(true);
    try {
      const [sR, uR, jR] = await Promise.all([adminAPI.getDashboard(), adminAPI.getUsers(), adminAPI.getAllJobs()]);
      const s = sR.data.data, u = uR.data.data || [], j = jR.data.data || [];
      const doc = new jsPDF();
      const now = new Date();
      const dateStr = `${now.getDate().toString().padStart(2,'0')}/${(now.getMonth()+1).toString().padStart(2,'0')}/${now.getFullYear()}`;
      let y = 15;
      doc.setFontSize(20); doc.setTextColor(37,99,235); doc.text('PartTime Job Laos', 105, y, {align:'center'}); y+=8;
      doc.setFontSize(14); doc.setTextColor(0); doc.text('Report Statistics', 105, y, {align:'center'}); y+=12;
      doc.autoTable({ startY: y, head:[['Item','Total']], body:[
        ['Total Users', String(s.total_users)], ['Companies', String(s.total_companies)],
        ['Total Jobs', String(s.total_jobs)], ['Applications', String(s.total_applications)],
      ], headStyles:{fillColor:[37,99,235]}, styles:{fontSize:11}});
      doc.save(`Report_${dateStr.replace(/\//g,'-')}.pdf`);
    } catch { alert('ສ້າງລາຍງານບໍ່ໄດ້'); }
    finally { setGenerating(false); }
  };

  const allTabs = [
    ['dashboard', 'ສະຖິຕິ'],
    ['users', 'ຜູ້ໃຊ້'],
    ['jobs', 'ວຽກ'],
    ['categories', 'ໝວດໝູ່'],
    ['notifications', 'ແຈ້ງເຕືອນ'],
    ['complaints', 'ການຮ້ອງຮຽນ'],
    ['reviews', 'Reviews'],
    ['settings', 'ຕັ້ງຄ່າ'],
    ['profile', 'ໂປຣໄຟລ໌'],
  ];

  if (authLoading || loading) return <div className="flex justify-center py-32"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button onClick={generatePDF} disabled={generating}
          className="bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50 shadow-lg shadow-red-600/30 flex items-center gap-2">
          {generating ? 'ກຳລັງສ້າງ...' : 'ສ້າງລາຍງານ PDF'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {allTabs.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${tab === k ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {l}
          </button>
        ))}
      </div>

      {/* Dashboard */}
      {tab === 'dashboard' && stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            ['ຜູ້ໃຊ້ທັງໝົດ', stats.total_users, 'bg-blue-50 text-blue-700', () => { setTab('users'); setUserType('applicant'); }],
            ['ບໍລິສັດ', stats.total_companies, 'bg-purple-50 text-purple-700', () => { setTab('users'); setUserType('company'); }],
            ['ວຽກທັງໝົດ', stats.total_jobs, 'bg-green-50 text-green-700', () => setTab('jobs')],
            ['ການສະໝັກ', stats.total_applications, 'bg-orange-50 text-orange-700', null],
            ['ໃໝ່ມື້ນີ້', stats.new_users_today, 'bg-pink-50 text-pink-700', () => setTab('users')],
          ].map(([label, val, cls, onClick], i) => (
            <button key={i} onClick={onClick || undefined}
              className={`${cls} rounded-2xl p-5 text-left transition-all ${onClick ? 'hover:shadow-lg hover:scale-[1.02] cursor-pointer' : 'cursor-default'}`}>
              <div className="text-3xl font-bold">{val}</div>
              <div className="text-xs opacity-70 mt-1">{label}</div>
            </button>
          ))}
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div>
          <div className="flex gap-2 mb-4">
            <button onClick={() => setUserType('applicant')}
              className={`px-4 py-2 rounded-xl text-sm font-medium ${userType === 'applicant' ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' : 'bg-gray-50 text-gray-500 border-2 border-transparent'}`}>
              ຜູ້ຊອກວຽກ ({users.filter(u => u.role === 'applicant').length})
            </button>
            <button onClick={() => setUserType('company')}
              className={`px-4 py-2 rounded-xl text-sm font-medium ${userType === 'company' ? 'bg-purple-100 text-purple-700 border-2 border-purple-300' : 'bg-gray-50 text-gray-500 border-2 border-transparent'}`}>
              ບໍລິສັດ ({users.filter(u => u.role === 'company').length})
            </button>
          </div>
          {users.length === 0 ? <div className="text-center py-16 bg-white rounded-2xl border text-gray-500">ບໍ່ມີຂໍ້ມູນ</div> : (
            <div className="space-y-3">
              {users.map(u => (
                <div key={u.id} className="bg-white rounded-2xl border p-4 hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0 ${u.role === 'company' ? 'bg-gradient-to-br from-purple-500 to-purple-700' : 'bg-gradient-to-br from-blue-500 to-blue-700'}`}>
                      {u.name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2"><h3 className="font-bold">{u.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${u.is_banned ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{u.is_banned ? 'ຖືກລະງັບ' : 'ໃຊ້ງານ'}</span>
                      </div>
                      <p className="text-sm text-gray-500">{u.email}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => setSelectedUser(u)} className="text-xs bg-blue-100 text-blue-700 px-3 py-2 rounded-lg font-medium">ເບິ່ງ</button>
                      <button onClick={() => banUser(u.id, !u.is_banned)} className={`text-xs px-3 py-2 rounded-lg text-white font-medium ${u.is_banned ? 'bg-green-600' : 'bg-red-600'}`}>{u.is_banned ? 'ປົດລະງັບ' : 'ລະງັບ'}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Jobs */}
      {tab === 'jobs' && (
        <div className="space-y-3">
          {jobs.length === 0 ? <div className="text-center py-16 bg-white rounded-2xl border text-gray-500">ບໍ່ມີຂໍ້ມູນ</div> : jobs.map(j => (
            <div key={j.id} className="bg-white rounded-2xl border p-4 hover:shadow-md">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-50 rounded-xl flex items-center justify-center font-bold text-green-700 shrink-0">{j.company_name?.[0] || 'J'}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><h3 className="font-bold">{j.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColor[j.status] || 'bg-gray-100'}`}>{statusLabel[j.status] || j.status}</span>
                  </div>
                  <p className="text-sm text-gray-500">{j.company_name || '-'}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setSelectedJob(j)} className="text-xs bg-blue-100 text-blue-700 px-3 py-2 rounded-lg font-medium">ເບິ່ງ</button>
                  {j.status === 'pending' && (<>
                    <button onClick={() => verifyJob(j.id, 'approved')} className="text-xs bg-green-600 text-white px-3 py-2 rounded-lg font-medium">ອະນຸມັດ</button>
                    <button onClick={() => verifyJob(j.id, 'rejected')} className="text-xs bg-red-600 text-white px-3 py-2 rounded-lg font-medium">ປະຕິເສດ</button>
                  </>)}
                  {j.status === 'approved' && <button onClick={() => verifyJob(j.id, 'closed')} className="text-xs bg-gray-600 text-white px-3 py-2 rounded-lg font-medium">ປິດ</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Categories */}
      {tab === 'categories' && (
        <div>
          <div className="flex justify-between mb-4">
            <p className="text-sm text-gray-500">ຈັດການໝວດໝູ່ວຽກ ({categories.length})</p>
            <button onClick={() => openCatModal(null)} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700">+ ເພີ່ມໝວດໝູ່</button>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {categories.map(c => (
              <div key={c.id} className="bg-white rounded-xl border p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold">{c.name}</h3>
                  <p className="text-xs text-gray-500">{c.description || '-'}</p>
                  <p className="text-xs text-blue-600 mt-1">{c.job_count || 0} ວຽກ</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openCatModal(c)} className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-medium">ແກ້</button>
                  <button onClick={() => deleteCat(c.id)} className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg font-medium">ລຶບ</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notifications */}
      {tab === 'notifications' && (
        <div>
          <div className="flex justify-between mb-4">
            <p className="text-sm text-gray-500">ປະຫວັດການແຈ້ງເຕືອນ</p>
            <button onClick={() => setShowNotifModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700">+ ສົ່ງແຈ້ງເຕືອນ</button>
          </div>
          {notifications.length === 0 ? <div className="text-center py-16 bg-white rounded-2xl border text-gray-500">ບໍ່ມີຂໍ້ມູນ</div> : (
            <div className="space-y-2">
              {notifications.map(n => (
                <div key={n.id} className="bg-white rounded-xl border p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-sm">{n.title}</h3>
                    <span className="text-xs text-gray-400">{new Date(n.created_at).toLocaleString('lo-LA')}</span>
                  </div>
                  <p className="text-sm text-gray-600">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">ສົ່ງເຖິງ: {n.user_name || '-'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Complaints */}
      {tab === 'complaints' && (
        <div>
          <p className="text-sm text-gray-500 mb-4">ການຮ້ອງຮຽນ/ລາຍງານປັນຫາ</p>
          {complaints.length === 0 ? <div className="text-center py-16 bg-white rounded-2xl border text-gray-500">ບໍ່ມີຂໍ້ມູນ</div> : (
            <div className="space-y-3">
              {complaints.map(c => (
                <div key={c.id} className="bg-white rounded-xl border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-sm">{c.reason}</h3>
                      <p className="text-xs text-gray-500">ໂດຍ: {c.reporter_name || '-'} • {c.target_type} #{c.target_id}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${c.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : c.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{c.status}</span>
                  </div>
                  {c.description && <p className="text-sm text-gray-600 mb-2">{c.description}</p>}
                  {c.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleComplaint(c.id, 'resolved')} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg">ແກ້ໄຂແລ້ວ</button>
                      <button onClick={() => handleComplaint(c.id, 'dismissed')} className="text-xs bg-gray-600 text-white px-3 py-1.5 rounded-lg">ປະຕິເສດ</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reviews */}
      {tab === 'reviews' && (
        <div className="space-y-3">
          {reviews.length === 0 ? <div className="text-center py-16 text-gray-500">ບໍ່ມີ reviews</div> : reviews.map(r => (
            <div key={r.id} className="bg-white rounded-xl p-4 border flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">{r.user_name} → {r.job_title}</div>
                <div className="text-yellow-500 text-sm">{'★'.repeat(r.rating)}</div>
                {r.comment && <p className="text-sm text-gray-500 mt-1">{r.comment}</p>}
              </div>
              <button onClick={async () => { if (confirm('ລຶບ?')) { await adminAPI.deleteReview(r.id); adminAPI.getReviews().then(res => { if (res.data.success) setReviews(res.data.data || []); }); } }}
                className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg">ລຶບ</button>
            </div>
          ))}
        </div>
      )}

      {/* Settings */}
      {tab === 'settings' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">ຕັ້ງຄ່າເວັບໄຊ</p>
          {settings.map(s => (
            <div key={s.id} className="bg-white rounded-xl border p-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-xs text-gray-500">{s.description}</p>
                  <p className="text-xs text-gray-400">{s.key}</p>
                </div>
                <input
                  defaultValue={s.value}
                  onBlur={(e) => { if (e.target.value !== s.value) saveSetting(s.id, e.target.value); }}
                  className="px-3 py-2 border rounded-lg text-sm w-64 outline-none focus:border-blue-400"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Profile */}
      {tab === 'profile' && (
        <div className="bg-white rounded-2xl border p-6 max-w-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center text-white text-3xl font-bold">{user?.name?.[0]}</div>
            <div>
              <h2 className="text-xl font-bold">{user?.name}</h2>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full mt-1 inline-block">Admin</span>
            </div>
          </div>
          <div className="space-y-3 mb-6">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs text-gray-500">ອີເມວ</div>
              <div className="text-sm font-medium mt-1">{user?.email}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs text-gray-500">ບົດບາດ</div>
              <div className="text-sm font-medium mt-1">Administrator</div>
            </div>
          </div>
          <button onClick={() => setShowPwModal(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700">ປ່ຽນລະຫັດຜ່ານ</button>
        </div>
      )}

      {/* ===== Category Modal ===== */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCatModal(false)} />
          <form onSubmit={saveCategory} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-lg mb-4">{editingCat ? 'ແກ້ໄຂໝວດໝູ່' : 'ເພີ່ມໝວດໝູ່'}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold block mb-1">ຊື່ໝວດໝູ່ *</label>
                <input value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} required
                  className="w-full px-4 py-2.5 border rounded-xl text-sm outline-none" />
              </div>
              <div>
                <label className="text-sm font-semibold block mb-1">ຄຳອະທິບາຍ</label>
                <input value={catForm.description} onChange={e => setCatForm({...catForm, description: e.target.value})}
                  className="w-full px-4 py-2.5 border rounded-xl text-sm outline-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold">ບັນທຶກ</button>
              <button type="button" onClick={() => setShowCatModal(false)} className="flex-1 border py-2.5 rounded-xl">ຍົກເລີກ</button>
            </div>
          </form>
        </div>
      )}

      {/* ===== Notification Modal ===== */}
      {showNotifModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowNotifModal(false)} />
          <form onSubmit={sendNotif} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-lg mb-4">ສົ່ງແຈ້ງເຕືອນ</h3>
            <div className="space-y-3">
              <select value={notifForm.target} onChange={e => setNotifForm({...notifForm, target: e.target.value})}
                className="w-full px-4 py-2.5 border rounded-xl text-sm outline-none">
                <option value="all">ສົ່ງເຖິງທຸກຄົນ</option>
                <option value="applicants">ສະເພາະຜູ້ຊອກວຽກ</option>
                <option value="companies">ສະເພາະບໍລິສັດ</option>
              </select>
              <input value={notifForm.title} onChange={e => setNotifForm({...notifForm, title: e.target.value})} required
                placeholder="ຫົວຂໍ້" className="w-full px-4 py-2.5 border rounded-xl text-sm outline-none" />
              <textarea value={notifForm.message} onChange={e => setNotifForm({...notifForm, message: e.target.value})} required
                placeholder="ຂໍ້ຄວາມ" rows={4} className="w-full px-4 py-2.5 border rounded-xl text-sm outline-none resize-none" />
            </div>
            <div className="flex gap-3 mt-4">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold">ສົ່ງ</button>
              <button type="button" onClick={() => setShowNotifModal(false)} className="flex-1 border py-2.5 rounded-xl">ຍົກເລີກ</button>
            </div>
          </form>
        </div>
      )}

      {/* ===== Change Password Modal ===== */}
      {showPwModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPwModal(false)} />
          <form onSubmit={changePassword} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-lg mb-4">ປ່ຽນລະຫັດຜ່ານ</h3>
            <div className="space-y-3">
              <input type="password" value={pwForm.old_password} onChange={e => setPwForm({...pwForm, old_password: e.target.value})} required
                placeholder="ລະຫັດເກົ່າ" className="w-full px-4 py-2.5 border rounded-xl text-sm outline-none" />
              <input type="password" value={pwForm.new_password} onChange={e => setPwForm({...pwForm, new_password: e.target.value})} required
                placeholder="ລະຫັດໃໝ່ (ຢ່າງໜ້ອຍ 6 ຕົວ)" className="w-full px-4 py-2.5 border rounded-xl text-sm outline-none" />
              <input type="password" value={pwForm.confirm} onChange={e => setPwForm({...pwForm, confirm: e.target.value})} required
                placeholder="ຢືນຢັນລະຫັດໃໝ່" className="w-full px-4 py-2.5 border rounded-xl text-sm outline-none" />
            </div>
            <div className="flex gap-3 mt-4">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold">ປ່ຽນລະຫັດ</button>
              <button type="button" onClick={() => setShowPwModal(false)} className="flex-1 border py-2.5 rounded-xl">ຍົກເລີກ</button>
            </div>
          </form>
        </div>
      )}

      {/* User Profile Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedUser(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">ຂໍ້ມູນຜູ້ໃຊ້</h3>
              <button onClick={() => setSelectedUser(null)} className="w-8 h-8 bg-gray-100 rounded-lg">✕</button>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold ${selectedUser.role === 'company' ? 'bg-gradient-to-br from-purple-500 to-purple-700' : 'bg-gradient-to-br from-blue-500 to-blue-700'}`}>{selectedUser.name?.[0]}</div>
              <div>
                <h2 className="text-xl font-bold">{selectedUser.name}</h2>
                <p className="text-gray-500 text-sm">{selectedUser.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              {[['ເບີໂທ', selectedUser.phone || '-'], ['ບົດບາດ', selectedUser.role === 'company' ? 'ບໍລິສັດ' : 'ຜູ້ຊອກວຽກ'],
                ...(selectedUser.role === 'company' ? [['ບໍລິສັດ', selectedUser.company_name || '-'], ['ທີ່ຢູ່', selectedUser.company_address || '-']] : [['ການສຶກສາ', selectedUser.education || '-'], ['ທັກສະ', selectedUser.skills || '-']])
              ].map(([l, v], i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-gray-500">{l}</div>
                  <div className="text-sm font-medium mt-1">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedJob(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">ລາຍລະອຽດວຽກ</h3>
              <button onClick={() => setSelectedJob(null)} className="w-8 h-8 bg-gray-100 rounded-lg">✕</button>
            </div>
            <h2 className="text-xl font-bold mb-2">{selectedJob.title}</h2>
            <p className="text-gray-500 mb-4">{selectedJob.company_name}</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[['ສະຖານທີ່', selectedJob.location], ['ປະເພດ', selectedJob.job_type], ['ໝວດໝູ່', selectedJob.category_name || '-'], ['ສະຖານະ', statusLabel[selectedJob.status]]].map(([l, v], i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3"><div className="text-xs text-gray-500">{l}</div><div className="text-sm font-medium mt-1">{v}</div></div>
              ))}
            </div>
            {selectedJob.description && <div className="mb-4"><h4 className="font-bold text-sm mb-2">ລາຍລະອຽດ</h4><div className="bg-gray-50 rounded-xl p-3 text-sm whitespace-pre-line">{selectedJob.description}</div></div>}
            {selectedJob.status === 'pending' && (
              <div className="flex gap-2">
                <button onClick={() => { verifyJob(selectedJob.id, 'approved'); setSelectedJob(null); }} className="flex-1 bg-green-600 text-white py-2.5 rounded-xl font-bold">ອະນຸມັດ</button>
                <button onClick={() => { verifyJob(selectedJob.id, 'rejected'); setSelectedJob(null); }} className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-bold">ປະຕິເສດ</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}