import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { adminAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import { statusColor, statusLabel } from '../lib/utils';
import { useDebounce } from '../lib/hooks';
import { exportToCSV, formatDateCSV, formatBoolCSV } from '../lib/csvExport';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { BarChart, DonutChart, StatCard, LineChart } from '../components/Charts';
import AdminSidebar, { AdminIcons } from '../components/AdminSidebar';
import { PageLoader } from '../components/Skeleton';

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();
  const confirm = useConfirm();
  // ອ່ານ tab ຈາກ URL (?tab=profile)
  const initialTab = searchParams.get('tab') || 'dashboard';
  const [tab, setTab] = useState(initialTab);

  // ປ່ຽນ tab → update URL
  const handleSelectTab = (newTab) => {
    setTab(newTab);
    if (newTab === 'dashboard') {
      setSearchParams({});
    } else {
      setSearchParams({ tab: newTab });
    }
  };

  // Sync tab ກັບ URL ເມື່ອ user ກົດ back/forward browser
  useEffect(() => {
    const urlTab = searchParams.get('tab') || 'dashboard';
    if (urlTab !== tab) setTab(urlTab);
  }, [searchParams]);

  // ===== Data states =====
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

  // ===== Filter states =====
  const [userType, setUserType] = useState('applicant');
  const [searchUsers, setSearchUsers] = useState('');
  const [searchJobs, setSearchJobs] = useState('');
  const [jobStatusFilter, setJobStatusFilter] = useState('all');
  const [searchReviews, setSearchReviews] = useState('');
  const [complaintStatusFilter, setComplaintStatusFilter] = useState('all');

  const debouncedSearchUsers = useDebounce(searchUsers, 300);
  const debouncedSearchJobs = useDebounce(searchJobs, 300);
  const debouncedSearchReviews = useDebounce(searchReviews, 300);

  // ===== Modal states =====
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [catForm, setCatForm] = useState({ name: '', description: '', icon: '' });
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notifForm, setNotifForm] = useState({ title: '', message: '', type: 'info', target: 'all' });
  const [showPwModal, setShowPwModal] = useState(false);
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm: '' });

  // ===== Auth check + Load dashboard =====
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) { navigate('/login'); return; }
    if (user?.role === 'admin') {
      Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getAllJobs(),
        adminAPI.getComplaints(),
      ]).then(([dR, jR, cR]) => {
        if (dR.data.success) setStats(dR.data.data);
        if (jR.data.success) setJobs(jR.data.data || []);
        if (cR.data.success) setComplaints(cR.data.data || []);
      }).finally(() => setLoading(false));
    }
  }, [user, authLoading]);

  // ===== Tab data loaders =====
  useEffect(() => {
    if (tab === 'users') adminAPI.getUsers(userType).then(r => { if (r.data.success) setUsers(r.data.data || []); });
    else if (tab === 'jobs') adminAPI.getAllJobs().then(r => { if (r.data.success) setJobs(r.data.data || []); });
    else if (tab === 'reviews') adminAPI.getReviews().then(r => { if (r.data.success) setReviews(r.data.data || []); });
    else if (tab === 'categories') loadCategories();
    else if (tab === 'notifications') adminAPI.getAllNotifications().then(r => { if (r.data.success) setNotifications(r.data.data || []); });
    else if (tab === 'complaints') adminAPI.getComplaints().then(r => { if (r.data.success) setComplaints(r.data.data || []); });
    else if (tab === 'settings') adminAPI.getSettings().then(r => { if (r.data.success) setSettings(r.data.data || []); });
    else if (tab === 'login-logs') adminAPI.getLoginLogs(100).then(r => { if (r.data.success) setLogs(r.data.data || []); });
  }, [tab, userType]);

  const loadCategories = async () => {
    const res = await fetch('/api/categories').then(r => r.json());
    if (res.success) setCategories(res.data || []);
  };

  // ===== Computed values =====
  const filteredUsers = useMemo(() => {
    if (!debouncedSearchUsers) return users;
    const s = debouncedSearchUsers.toLowerCase();
    return users.filter(u =>
      u.name?.toLowerCase().includes(s) ||
      u.email?.toLowerCase().includes(s) ||
      u.company_name?.toLowerCase().includes(s) ||
      u.phone?.includes(s)
    );
  }, [users, debouncedSearchUsers]);

  const filteredJobs = useMemo(() => {
    let r = jobs;
    if (jobStatusFilter !== 'all') r = r.filter(j => j.status === jobStatusFilter);
    if (debouncedSearchJobs) {
      const s = debouncedSearchJobs.toLowerCase();
      r = r.filter(j => j.title?.toLowerCase().includes(s) || j.company_name?.toLowerCase().includes(s));
    }
    return r;
  }, [jobs, jobStatusFilter, debouncedSearchJobs]);

  const filteredReviews = useMemo(() => {
    if (!debouncedSearchReviews) return reviews;
    const s = debouncedSearchReviews.toLowerCase();
    return reviews.filter(r =>
      r.user_name?.toLowerCase().includes(s) ||
      r.job_title?.toLowerCase().includes(s) ||
      r.comment?.toLowerCase().includes(s)
    );
  }, [reviews, debouncedSearchReviews]);

  const filteredComplaints = useMemo(() => {
    if (complaintStatusFilter === 'all') return complaints;
    return complaints.filter(c => c.status === complaintStatusFilter);
  }, [complaints, complaintStatusFilter]);

  // ===== Counts for sidebar badges =====
  const pendingJobsCount = useMemo(() => jobs.filter(j => j.status === 'pending').length, [jobs]);
  const pendingComplaintsCount = useMemo(() => complaints.filter(c => c.status === 'pending').length, [complaints]);

  // ===== Actions =====
  const banUser = async (id, ban) => {
    try {
      await adminAPI.banUser(id, ban);
      toast.success(ban ? 'ລະງັບຜູ້ໃຊ້ສຳເລັດ' : 'ປົດລະງັບແລ້ວ');
      adminAPI.getUsers(userType).then(r => { if (r.data.success) setUsers(r.data.data || []); });
    } catch { toast.error('ບໍ່ສຳເລັດ'); }
  };

  const verifyCompany = async (id, verify) => {
    try {
      await adminAPI.verifyCompany(id, verify);
      toast.success(verify ? 'ຢືນຢັນບໍລິສັດສຳເລັດ' : 'ຍົກເລີກການຢືນຢັນແລ້ວ');
      adminAPI.getUsers(userType).then(r => { if (r.data.success) setUsers(r.data.data || []); });
    } catch { toast.error('ບໍ່ສຳເລັດ'); }
  };

  const verifyJob = async (id, status) => {
    try {
      await adminAPI.verifyJob(id, status);
      toast.success('ປ່ຽນສະຖານະວຽກສຳເລັດ');
      adminAPI.getAllJobs().then(r => { if (r.data.success) setJobs(r.data.data || []); });
    } catch { toast.error('ບໍ່ສຳເລັດ'); }
  };

  const openCatModal = (cat) => {
    if (cat) { setEditingCat(cat); setCatForm({ name: cat.name, description: cat.description || '', icon: cat.icon || '' }); }
    else { setEditingCat(null); setCatForm({ name: '', description: '', icon: '' }); }
    setShowCatModal(true);
  };
  const saveCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingCat) await adminAPI.updateCategory(editingCat.id, catForm);
      else await adminAPI.createCategory(catForm);
      toast.success(editingCat ? 'ແກ້ໄຂສຳເລັດ' : 'ເພີ່ມສຳເລັດ');
      setShowCatModal(false); loadCategories();
    } catch { toast.error('ບໍ່ສຳເລັດ'); }
  };
  const deleteCat = async (cat) => {
    const ok = await confirm({ title: 'ລົບໝວດໝູ່?', message: `ລົບ "${cat.name}"?`, confirmText: 'ລົບ', variant: 'danger' });
    if (!ok) return;
    try { await adminAPI.deleteCategory(cat.id); toast.success('ລົບສຳເລັດ'); loadCategories(); }
    catch (err) { toast.error(err.response?.data?.message || 'ລົບບໍ່ໄດ້'); }
  };

  const sendNotif = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.sendNotification(notifForm);
      setShowNotifModal(false);
      setNotifForm({ title: '', message: '', type: 'info', target: 'all' });
      adminAPI.getAllNotifications().then(r => { if (r.data.success) setNotifications(r.data.data || []); });
      toast.success('ສົ່ງແຈ້ງເຕືອນສຳເລັດ');
    } catch { toast.error('ສົ່ງບໍ່ໄດ້'); }
  };

  const handleComplaint = async (id, status) => {
    try {
      await adminAPI.updateComplaint(id, { status, admin_note: '' });
      toast.success('ປ່ຽນສະຖານະສຳເລັດ');
      adminAPI.getComplaints().then(r => { if (r.data.success) setComplaints(r.data.data || []); });
    } catch { toast.error('ບໍ່ສຳເລັດ'); }
  };

  const saveSetting = async (id, value) => {
    try {
      await adminAPI.updateSetting(id, value);
      toast.success('ບັນທຶກສຳເລັດ');
      adminAPI.getSettings().then(r => { if (r.data.success) setSettings(r.data.data || []); });
    } catch { toast.error('ບໍ່ສຳເລັດ'); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm) { toast.error('ລະຫັດໃໝ່ບໍ່ກົງກັນ'); return; }
    try {
      await adminAPI.changePassword({ old_password: pwForm.old_password, new_password: pwForm.new_password });
      setShowPwModal(false);
      setPwForm({ old_password: '', new_password: '', confirm: '' });
      toast.success('ປ່ຽນລະຫັດສຳເລັດ');
    } catch (err) { toast.error(err.response?.data?.message || 'ບໍ່ສຳເລັດ'); }
  };

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const [sR, uR, jR] = await Promise.all([adminAPI.getDashboard(), adminAPI.getUsers(), adminAPI.getAllJobs()]);
      const s = sR.data.data, u = uR.data.data || [], j = jR.data.data || [];
      const doc = new jsPDF();
      const now = new Date();
      const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
      let y = 15;
      doc.setFontSize(20); doc.setTextColor(37, 99, 235); doc.text('PartTime Job Laos', 105, y, { align: 'center' }); y += 8;
      doc.setFontSize(14); doc.setTextColor(0); doc.text(`Report - ${dateStr}`, 105, y, { align: 'center' }); y += 12;
      doc.autoTable({
        startY: y, head: [['Metric', 'Total']], body: [
          ['Total Users', String(s.total_users || 0)],
          ['Companies', String(s.total_companies || 0)],
          ['Total Jobs', String(s.total_jobs || 0)],
          ['Pending Jobs', String(s.pending_jobs || 0)],
          ['Applications', String(s.total_applications || 0)],
          ['New Today', String(s.new_users_today || 0)],
        ],
        headStyles: { fillColor: [37, 99, 235] }, styles: { fontSize: 11 }
      });
      doc.save(`Report_${dateStr.replace(/\//g, '-')}.pdf`);
      toast.success('PDF ສຳເລັດ');
    } catch { toast.error('ສ້າງລາຍງານບໍ່ໄດ້'); }
    finally { setGenerating(false); }
  };

  // ===== Export functions =====
  const exportUsers = () => exportToCSV(users, 'users', [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'ຊື່' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'ເບີໂທ' },
    { key: 'role', label: 'Role' },
    { key: 'company_name', label: 'ບໍລິສັດ' },
    { key: 'verified_company', label: 'Verified', format: formatBoolCSV },
    { key: 'is_banned', label: 'Banned', format: formatBoolCSV },
    { key: 'created_at', label: 'ສະໝັກເມື່ອ', format: formatDateCSV },
  ]);

  const exportJobs = () => exportToCSV(jobs, 'jobs', [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'ຊື່ວຽກ' },
    { key: 'company_name', label: 'ບໍລິສັດ' },
    { key: 'location', label: 'ສະຖານທີ່' },
    { key: 'job_type', label: 'ປະເພດ' },
    { key: 'status', label: 'ສະຖານະ' },
    { key: 'applicant_count', label: 'ຜູ້ສະໝັກ' },
    { key: 'created_at', label: 'ປະກາດເມື່ອ', format: formatDateCSV },
  ]);

  // ===== Sidebar config =====
  const sidebarGroups = [
    {
      title: 'Overview',
      items: [
        { key: 'dashboard', label: 'Dashboard', icon: AdminIcons.Dashboard },
        { key: 'login-logs', label: 'Login Logs', icon: AdminIcons.Lock },
      ],
    },
    {
      title: 'People',
      items: [
        { key: 'users', label: 'ຜູ້ໃຊ້', icon: AdminIcons.Users },
      ],
    },
    {
      title: 'Content',
      items: [
        { key: 'jobs', label: 'ວຽກ', icon: AdminIcons.Briefcase, badge: pendingJobsCount, badgeColor: 'red' },
        { key: 'categories', label: 'ໝວດໝູ່', icon: AdminIcons.Category },
        { key: 'reviews', label: 'Reviews', icon: AdminIcons.Star },
      ],
    },
    {
      title: 'Comms',
      items: [
        { key: 'notifications', label: 'ແຈ້ງເຕືອນ', icon: AdminIcons.Bell },
        { key: 'complaints', label: 'ການຮ້ອງຮຽນ', icon: AdminIcons.Flag, badge: pendingComplaintsCount, badgeColor: 'red' },
      ],
    },
    {
      title: 'System',
      items: [
        { key: 'settings', label: 'ຕັ້ງຄ່າ', icon: AdminIcons.Settings },
        { key: 'profile', label: 'ໂປຣໄຟລ໌', icon: AdminIcons.User },
      ],
    },
  ];

  const pageTitle = {
    'dashboard': { title: 'Dashboard', sub: 'ສະຖິຕິພາບລວມ' },
    'login-logs': { title: 'Login Logs', sub: 'ປະຫວັດການເຂົ້າສູ່ລະບົບ (100 ລ່າສຸດ)' },
    'users': { title: 'ຈັດການຜູ້ໃຊ້', sub: 'ຜູ້ໃຊ້ທັງໝົດໃນລະບົບ' },
    'jobs': { title: 'ຈັດການວຽກ', sub: 'ອະນຸມັດ / ປະຕິເສດ ປະກາດວຽກ' },
    'categories': { title: 'ໝວດໝູ່ວຽກ', sub: 'CRUD ໝວດໝູ່' },
    'reviews': { title: 'Reviews', sub: 'ກວດສອບ / ລົບ reviews' },
    'notifications': { title: 'ແຈ້ງເຕືອນ', sub: 'ສົ່ງ broadcast notification' },
    'complaints': { title: 'ການຮ້ອງຮຽນ', sub: 'ຈັດການ complaints' },
    'settings': { title: 'ຕັ້ງຄ່າເວັບໄຊ', sub: 'Site configurations' },
    'profile': { title: 'ໂປຣໄຟລ໌ Admin', sub: 'ຈັດການບັນຊີຂອງທ່ານ' },
  }[tab] || { title: 'Admin', sub: '' };

  if (authLoading || loading) return <PageLoader />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Top header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">ຈັດການລະບົບທັງໝົດ</p>
        </div>
        <button onClick={generatePDF} disabled={generating}
          className="bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50 shadow-lg shadow-red-600/20 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          {generating ? 'ກຳລັງສ້າງ...' : 'Export PDF'}
        </button>
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-6">
        {/* Sidebar */}
        <AdminSidebar groups={sidebarGroups} activeKey={tab} onSelect={handleSelectTab} />

        {/* Main content */}
        <main>
          {/* Page header */}
          <div className="mb-5">
            <h2 className="text-xl font-bold text-gray-800">{pageTitle.title}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{pageTitle.sub}</p>
          </div>

          {/* ===== Dashboard ===== */}
          {tab === 'dashboard' && stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <StatCard label="ຜູ້ໃຊ້" value={stats.total_users} color="blue" />
                <StatCard label="ບໍລິສັດ" value={stats.total_companies} color="purple" />
                <StatCard label="ວຽກ" value={stats.total_jobs} color="green" />
                <StatCard label="ສະໝັກ" value={stats.total_applications} color="orange" />
                <StatCard label="ໃໝ່ມື້ນີ້" value={stats.new_users_today} color="pink" />
              </div>

              <div className="grid lg:grid-cols-2 gap-5">
                <DonutChart
                  title="ສັດສ່ວນຜູ້ໃຊ້"
                  data={[
                    { label: 'ຜູ້ຊອກວຽກ', value: (stats.total_users || 0) - (stats.total_companies || 0) },
                    { label: 'ບໍລິສັດ', value: stats.total_companies || 0 },
                  ]}
                />
                <BarChart
                  title="ສະຖານະວຽກ"
                  color="#10b981"
                  data={[
                    { label: 'ອະນຸມັດ', value: (stats.total_jobs || 0) - (stats.pending_jobs || 0) },
                    { label: 'ລໍຖ້າ', value: stats.pending_jobs || 0 },
                  ]}
                />
                {stats.top_companies && stats.top_companies.length > 0 && (
                  <BarChart
                    title="Top 5 ບໍລິສັດ"
                    color="#8b5cf6"
                    data={stats.top_companies.slice(0, 5).map(c => ({
                      label: c.company_name?.substring(0, 10) || 'N/A',
                      value: c.job_count || 0,
                    }))}
                  />
                )}
                <LineChart
                  title="ການເຄື່ອນໄຫວ"
                  color="#2563eb"
                  data={[
                    { label: 'Users', value: stats.total_users || 0 },
                    { label: 'Companies', value: stats.total_companies || 0 },
                    { label: 'Jobs', value: stats.total_jobs || 0 },
                    { label: 'Apps', value: stats.total_applications || 0 },
                  ]}
                />
              </div>
            </div>
          )}

          {/* ===== Login Logs ===== */}
          {tab === 'login-logs' && (
            <div>
              {logs.length === 0 ? (
                <EmptyState text="ບໍ່ມີ login logs" />
              ) : (
                <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {['User', 'IP Address', 'User Agent', 'Status', 'Time'].map(h => (
                          <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((l) => (
                        <tr key={l.id} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{l.user_name || `ID #${l.user_id}`}</td>
                          <td className="px-4 py-3 text-gray-600 font-mono text-xs">{l.ip_address || '-'}</td>
                          <td className="px-4 py-3 text-gray-500 text-xs truncate max-w-xs" title={l.user_agent}>{l.user_agent || '-'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${l.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {l.success ? 'Success' : 'Failed'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{new Date(l.created_at).toLocaleString('lo-LA')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ===== Users ===== */}
          {tab === 'users' && (
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex gap-2">
                  <button onClick={() => setUserType('applicant')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium ${userType === 'applicant' ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' : 'bg-white text-gray-500 border-2 border-gray-200'}`}>
                    ຜູ້ຊອກວຽກ ({users.filter(u => u.role === 'applicant').length})
                  </button>
                  <button onClick={() => setUserType('company')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium ${userType === 'company' ? 'bg-purple-100 text-purple-700 border-2 border-purple-300' : 'bg-white text-gray-500 border-2 border-gray-200'}`}>
                    ບໍລິສັດ ({users.filter(u => u.role === 'company').length})
                  </button>
                </div>
                <div className="flex-1 min-w-[200px] relative">
                  <SearchIcon />
                  <input value={searchUsers} onChange={e => setSearchUsers(e.target.value)}
                    placeholder="ຄົ້ນຫາຊື່, email, ເບີໂທ..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" />
                </div>
                <button onClick={exportUsers} className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-xl text-sm font-medium hover:bg-green-100">
                  📥 Export CSV
                </button>
              </div>

              <p className="text-sm text-gray-500 mb-3">ພົບ {filteredUsers.length} ຄົນ</p>

              {filteredUsers.length === 0 ? <EmptyState text="ບໍ່ມີຂໍ້ມູນ" /> : (
                <div className="space-y-2">
                  {filteredUsers.map(u => (
                    <div key={u.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all">
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-base font-bold shrink-0 ${u.role === 'company' ? 'bg-gradient-to-br from-purple-500 to-purple-700' : 'bg-gradient-to-br from-blue-500 to-blue-700'}`}>
                          {u.name?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-gray-800">{u.name}</h3>
                            {u.verified_company && (
                              <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded inline-flex items-center gap-0.5" title="Verified Company">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l3.09 6.26L22 7.27l-5 4.87 1.18 6.88L12 15.77l-6.18 3.25L7 12.14 2 7.27l6.91-1.01L12 0z"/></svg>
                                Verified
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${u.is_banned ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                              {u.is_banned ? 'ຖືກລະງັບ' : 'ໃຊ້ງານ'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{u.email} {u.phone && `• ${u.phone}`}</p>
                          {u.company_name && <p className="text-xs text-purple-600 mt-0.5">🏢 {u.company_name}</p>}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => setSelectedUser(u)} className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-200">ເບິ່ງ</button>
                          {u.role === 'company' && (
                            <button onClick={() => verifyCompany(u.id, !u.verified_company)}
                              className={`text-xs px-3 py-1.5 rounded-lg font-medium ${u.verified_company ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                              title={u.verified_company ? 'ຍົກເລີກ verify' : 'Verify'}>
                              {u.verified_company ? '✓ ຍົກເລີກ' : '✓ Verify'}
                            </button>
                          )}
                          <button onClick={() => banUser(u.id, !u.is_banned)}
                            className={`text-xs px-3 py-1.5 rounded-lg text-white font-medium ${u.is_banned ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                            {u.is_banned ? 'ປົດລະງັບ' : 'ລະງັບ'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== Jobs ===== */}
          {tab === 'jobs' && (
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex gap-2 flex-wrap">
                  {[
                    { k: 'all', l: 'ທັງໝົດ', c: jobs.length },
                    { k: 'pending', l: 'ລໍຖ້າ', c: jobs.filter(j => j.status === 'pending').length },
                    { k: 'approved', l: 'ອະນຸມັດ', c: jobs.filter(j => j.status === 'approved').length },
                    { k: 'rejected', l: 'ປະຕິເສດ', c: jobs.filter(j => j.status === 'rejected').length },
                    { k: 'closed', l: 'ປິດ', c: jobs.filter(j => j.status === 'closed').length },
                  ].map(f => (
                    <button key={f.k} onClick={() => setJobStatusFilter(f.k)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border ${jobStatusFilter === f.k ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                      {f.l} ({f.c})
                    </button>
                  ))}
                </div>
                <div className="flex-1 min-w-[200px] relative">
                  <SearchIcon />
                  <input value={searchJobs} onChange={e => setSearchJobs(e.target.value)}
                    placeholder="ຄົ້ນຫາວຽກ ຫຼື ບໍລິສັດ..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" />
                </div>
                <button onClick={exportJobs} className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-xl text-sm font-medium hover:bg-green-100">
                  📥 Export CSV
                </button>
              </div>

              <p className="text-sm text-gray-500 mb-3">ພົບ {filteredJobs.length} ວຽກ</p>

              {filteredJobs.length === 0 ? <EmptyState text="ບໍ່ມີຂໍ້ມູນ" /> : (
                <div className="space-y-2">
                  {filteredJobs.map(j => (
                    <div key={j.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all">
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="w-11 h-11 bg-gradient-to-br from-green-100 to-green-50 rounded-xl flex items-center justify-center font-bold text-green-700 shrink-0">{j.company_name?.[0] || 'J'}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-gray-800">{j.title}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColor[j.status] || 'bg-gray-100'}`}>{statusLabel[j.status] || j.status}</span>
                          </div>
                          <p className="text-sm text-gray-500">{j.company_name || '-'} • {j.location || '-'}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{j.applicant_count || 0} ສະໝັກ</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => setSelectedJob(j)} className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-200">ເບິ່ງ</button>
                          {j.status === 'pending' && (
                            <>
                              <button onClick={() => verifyJob(j.id, 'approved')} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-green-700">ອະນຸມັດ</button>
                              <button onClick={() => verifyJob(j.id, 'rejected')} className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-red-700">ປະຕິເສດ</button>
                            </>
                          )}
                          {j.status === 'approved' && <button onClick={() => verifyJob(j.id, 'closed')} className="text-xs bg-gray-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-gray-700">ປິດ</button>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== Categories ===== */}
          {tab === 'categories' && (
            <div>
              <div className="flex justify-between mb-4">
                <p className="text-sm text-gray-500">ໝວດໝູ່ທັງໝົດ ({categories.length})</p>
                <button onClick={() => openCatModal(null)} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700">+ ເພີ່ມໝວດໝູ່</button>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {categories.map(c => (
                  <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between hover:shadow-md transition-all">
                    <div>
                      <h3 className="font-bold text-gray-800">{c.name}</h3>
                      <p className="text-xs text-gray-500">{c.description || '-'}</p>
                      <p className="text-xs text-blue-600 mt-1 font-medium">{c.job_count || 0} ວຽກ</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openCatModal(c)} className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-200">ແກ້</button>
                      <button onClick={() => deleteCat(c)} className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg font-medium hover:bg-red-200">ລົບ</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== Reviews ===== */}
          {tab === 'reviews' && (
            <div>
              <div className="relative mb-4">
                <SearchIcon />
                <input value={searchReviews} onChange={e => setSearchReviews(e.target.value)}
                  placeholder="ຄົ້ນຫາ user, vacancy, comment..."
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 max-w-md" />
              </div>
              {filteredReviews.length === 0 ? <EmptyState text="ບໍ່ມີ reviews" /> :
                <div className="space-y-2">
                  {filteredReviews.map(r => (
                    <div key={r.id} className="bg-white rounded-xl p-4 border border-gray-200 flex items-center justify-between hover:shadow-md transition-all">
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-800">{r.user_name} → {r.job_title}</div>
                        <div className="text-yellow-500 text-sm my-1">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                        {r.comment && <p className="text-sm text-gray-500">{r.comment}</p>}
                      </div>
                      <button onClick={async () => {
                        const ok = await confirm({ title: 'ລົບ Review?', confirmText: 'ລົບ', variant: 'danger' });
                        if (!ok) return;
                        try { await adminAPI.deleteReview(r.id); toast.success('ລົບສຳເລັດ'); adminAPI.getReviews().then(res => { if (res.data.success) setReviews(res.data.data || []); }); }
                        catch { toast.error('ລົບບໍ່ໄດ້'); }
                      }}
                        className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200 font-medium ml-3">ລົບ</button>
                    </div>
                  ))}
                </div>
              }
            </div>
          )}

          {/* ===== Notifications ===== */}
          {tab === 'notifications' && (
            <div>
              <div className="flex justify-between mb-4">
                <p className="text-sm text-gray-500">ປະຫວັດການແຈ້ງເຕືອນ</p>
                <button onClick={() => setShowNotifModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700">+ ສົ່ງແຈ້ງເຕືອນ</button>
              </div>
              {notifications.length === 0 ? <EmptyState text="ບໍ່ມີຂໍ້ມູນ" /> : (
                <div className="space-y-2">
                  {notifications.map(n => (
                    <div key={n.id} className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-sm">{n.title}</h3>
                        <span className="text-xs text-gray-400">{new Date(n.created_at).toLocaleString('lo-LA')}</span>
                      </div>
                      <p className="text-sm text-gray-600">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">ສົ່ງເຖິງ: {n.user_name || 'ທຸກຄົນ'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== Complaints ===== */}
          {tab === 'complaints' && (
            <div>
              <div className="flex gap-2 mb-4 flex-wrap">
                {[
                  { k: 'all', l: 'ທັງໝົດ', c: complaints.length },
                  { k: 'pending', l: 'ລໍຖ້າ', c: complaints.filter(c => c.status === 'pending').length },
                  { k: 'resolved', l: 'ແກ້ໄຂແລ້ວ', c: complaints.filter(c => c.status === 'resolved').length },
                  { k: 'dismissed', l: 'ປະຕິເສດ', c: complaints.filter(c => c.status === 'dismissed').length },
                ].map(f => (
                  <button key={f.k} onClick={() => setComplaintStatusFilter(f.k)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border ${complaintStatusFilter === f.k ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                    {f.l} ({f.c})
                  </button>
                ))}
              </div>
              {filteredComplaints.length === 0 ? <EmptyState text="ບໍ່ມີຂໍ້ມູນ" /> : (
                <div className="space-y-3">
                  {filteredComplaints.map(c => (
                    <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-4">
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
                          <button onClick={() => handleComplaint(c.id, 'resolved')} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-green-700">ແກ້ໄຂແລ້ວ</button>
                          <button onClick={() => handleComplaint(c.id, 'dismissed')} className="text-xs bg-gray-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-gray-700">ປະຕິເສດ</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== Settings ===== */}
          {tab === 'settings' && (
            <div className="space-y-3">
              {settings.map(s => (
                <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                      <p className="text-sm font-semibold text-gray-800">{s.description}</p>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">{s.key}</p>
                    </div>
                    <input defaultValue={s.value}
                      onBlur={(e) => { if (e.target.value !== s.value) saveSetting(s.id, e.target.value); }}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm w-64 outline-none focus:border-blue-400" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ===== Profile ===== */}
          {tab === 'profile' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 max-w-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center text-white text-3xl font-bold">{user?.name?.[0]}</div>
                <div>
                  <h2 className="text-xl font-bold">{user?.name}</h2>
                  <p className="text-gray-500 text-sm">{user?.email}</p>
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full mt-1 inline-block">Admin</span>
                </div>
              </div>
              <button onClick={() => setShowPwModal(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700">ປ່ຽນລະຫັດຜ່ານ</button>
            </div>
          )}
        </main>
      </div>

      {/* ===== Modals ===== */}
      {showCatModal && (
        <Modal onClose={() => setShowCatModal(false)}>
          <form onSubmit={saveCategory} className="p-6">
            <h3 className="font-bold text-lg mb-4">{editingCat ? 'ແກ້ໄຂໝວດໝູ່' : 'ເພີ່ມໝວດໝູ່'}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold block mb-1">ຊື່ໝວດໝູ່ *</label>
                <input value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="text-sm font-semibold block mb-1">ຄຳອະທິບາຍ</label>
                <input value={catForm.description} onChange={e => setCatForm({ ...catForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700">ບັນທຶກ</button>
              <button type="button" onClick={() => setShowCatModal(false)} className="flex-1 border border-gray-200 py-2.5 rounded-xl hover:bg-gray-50">ຍົກເລີກ</button>
            </div>
          </form>
        </Modal>
      )}

      {showNotifModal && (
        <Modal onClose={() => setShowNotifModal(false)}>
          <form onSubmit={sendNotif} className="p-6">
            <h3 className="font-bold text-lg mb-4">ສົ່ງແຈ້ງເຕືອນ</h3>
            <div className="space-y-3">
              <select value={notifForm.target} onChange={e => setNotifForm({ ...notifForm, target: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400">
                <option value="all">ສົ່ງເຖິງທຸກຄົນ</option>
                <option value="applicants">ສະເພາະຜູ້ຊອກວຽກ</option>
                <option value="companies">ສະເພາະບໍລິສັດ</option>
              </select>
              <input value={notifForm.title} onChange={e => setNotifForm({ ...notifForm, title: e.target.value })} required
                placeholder="ຫົວຂໍ້" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" />
              <textarea value={notifForm.message} onChange={e => setNotifForm({ ...notifForm, message: e.target.value })} required
                placeholder="ຂໍ້ຄວາມ" rows={4} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 resize-none" />
            </div>
            <div className="flex gap-3 mt-4">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700">ສົ່ງ</button>
              <button type="button" onClick={() => setShowNotifModal(false)} className="flex-1 border border-gray-200 py-2.5 rounded-xl hover:bg-gray-50">ຍົກເລີກ</button>
            </div>
          </form>
        </Modal>
      )}

      {showPwModal && (
        <Modal onClose={() => setShowPwModal(false)}>
          <form onSubmit={changePassword} className="p-6">
            <h3 className="font-bold text-lg mb-4">ປ່ຽນລະຫັດຜ່ານ</h3>
            <div className="space-y-3">
              <input type="password" value={pwForm.old_password} onChange={e => setPwForm({ ...pwForm, old_password: e.target.value })} required
                placeholder="ລະຫັດເກົ່າ" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" />
              <input type="password" value={pwForm.new_password} onChange={e => setPwForm({ ...pwForm, new_password: e.target.value })} required
                placeholder="ລະຫັດໃໝ່ (ຢ່າງໜ້ອຍ 8 ຕົວ)" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" />
              <input type="password" value={pwForm.confirm} onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} required
                placeholder="ຢືນຢັນລະຫັດໃໝ່" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" />
            </div>
            <div className="flex gap-3 mt-4">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700">ປ່ຽນລະຫັດ</button>
              <button type="button" onClick={() => setShowPwModal(false)} className="flex-1 border border-gray-200 py-2.5 rounded-xl hover:bg-gray-50">ຍົກເລີກ</button>
            </div>
          </form>
        </Modal>
      )}

      {selectedUser && (
        <Modal onClose={() => setSelectedUser(null)}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">ຂໍ້ມູນຜູ້ໃຊ້</h3>
              <button onClick={() => setSelectedUser(null)} className="w-8 h-8 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center justify-center" aria-label="ປິດ">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold ${selectedUser.role === 'company' ? 'bg-gradient-to-br from-purple-500 to-purple-700' : 'bg-gradient-to-br from-blue-500 to-blue-700'}`}>{selectedUser.name?.[0]}</div>
              <div>
                <h2 className="text-xl font-bold">{selectedUser.name}</h2>
                <p className="text-gray-500 text-sm">{selectedUser.email}</p>
                {selectedUser.verified_company && <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded mt-1 inline-block">✓ Verified</span>}
              </div>
            </div>
            <div className="space-y-2">
              {[
                ['ເບີໂທ', selectedUser.phone || '-'],
                ['ບົດບາດ', selectedUser.role === 'company' ? 'ບໍລິສັດ' : 'ຜູ້ຊອກວຽກ'],
                ...(selectedUser.role === 'company'
                  ? [['ບໍລິສັດ', selectedUser.company_name || '-']]
                  : [])
              ].map(([l, v], i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-gray-500">{l}</div>
                  <div className="text-sm font-medium mt-1">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {selectedJob && (
        <Modal onClose={() => setSelectedJob(null)}>
          <div className="p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">ລາຍລະອຽດວຽກ</h3>
              <button onClick={() => setSelectedJob(null)} className="w-8 h-8 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center justify-center" aria-label="ປິດ">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <h2 className="text-xl font-bold mb-2">{selectedJob.title}</h2>
            <p className="text-sm text-gray-500 mb-3">{selectedJob.company_name} • {selectedJob.location}</p>
            <div className="space-y-3">
              {selectedJob.description && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-gray-500 mb-1">ລາຍລະອຽດ</div>
                  <p className="text-sm whitespace-pre-line">{selectedJob.description}</p>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ===== Helper Components =====
function EmptyState({ text }) {
  return (
    <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 text-gray-500">
      <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
      </div>
      <p className="text-sm">{text}</p>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
    </svg>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-slide-up">
        {children}
      </div>
    </div>
  );
}
