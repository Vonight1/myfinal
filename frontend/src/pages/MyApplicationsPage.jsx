import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { applicationsAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import { statusColor, statusLabel } from '../lib/utils';
import { PageLoader, ListItemSkeleton } from '../components/Skeleton';

export default function MyApplicationsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | pending | accepted | rejected

  const handleCancel = async (app) => {
    const ok = await confirm({
      title: 'ຍົກເລີກການສະໝັກ?',
      message: `ທ່ານແນ່ໃຈບໍ່ວ່າຈະຍົກເລີກການສະໝັກວຽກ "${app.job_title}"?`,
      confirmText: 'ຍົກເລີກການສະໝັກ',
      cancelText: 'ບໍ່',
      variant: 'warning',
    });
    if (!ok) return;
    try {
      const res = await applicationsAPI.cancelApplication(app.id);
      if (res.data.success) {
        toast.success('ຍົກເລີກສຳເລັດ');
        setApplications(applications.filter(a => a.id !== app.id));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'ບໍ່ສາມາດຍົກເລີກໄດ້');
    }
  };

  useEffect(() => {
    if (!authLoading && !user) { navigate('/login'); return; }
    if (!authLoading && user?.role !== 'applicant') {
      toast.warning('ສະເພາະຜູ້ຊອກວຽກເທົ່ານັ້ນ');
      navigate('/');
      return;
    }
    if (user?.role === 'applicant') {
      setLoading(true);
      applicationsAPI.getMyApplications()
        .then(r => { if (r.data.success) setApplications(r.data.data || []); })
        .catch(() => toast.error('ບໍ່ສາມາດໂຫຼດໄດ້'))
        .finally(() => setLoading(false));
    }
  }, [user, authLoading]);

  if (authLoading) return <PageLoader />;

  // Filter applications
  const filtered = filter === 'all' ? applications : applications.filter(a => a.status === filter);

  // Stats
  const stats = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    reviewed: applications.filter(a => a.status === 'reviewed').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  const filterTabs = [
    { key: 'all', label: 'ທັງໝົດ', count: stats.all, color: 'bg-gray-100 text-gray-700' },
    { key: 'pending', label: 'ລໍຖ້າ', count: stats.pending, color: 'bg-yellow-100 text-yellow-700' },
    { key: 'accepted', label: 'ຮັບແລ້ວ', count: stats.accepted, color: 'bg-green-100 text-green-700' },
    { key: 'rejected', label: 'ປະຕິເສດ', count: stats.rejected, color: 'bg-red-100 text-red-700' },
  ];

  return (
    <div className="bg-gradient-to-b from-blue-50/50 to-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">ວຽກທີ່ສະໝັກ</h1>
            <p className="text-sm text-gray-500 mt-0.5">ປະຫວັດການສະໝັກວຽກທັງໝົດຂອງເຈົ້າ</p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                filter === tab.key
                  ? 'bg-blue-50 border-blue-300 shadow-md'
                  : 'bg-white border-gray-200 hover:border-blue-200'
              }`}
            >
              <div className={`text-2xl font-bold ${filter === tab.key ? 'text-blue-700' : 'text-gray-800'}`}>
                {tab.count}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{tab.label}</div>
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({length: 4}).map((_,i) => <ListItemSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-700">
              {filter === 'all' ? 'ຍັງບໍ່ໄດ້ສະໝັກວຽກ' : `ບໍ່ມີວຽກສະຖານະ "${filterTabs.find(t => t.key === filter)?.label}"`}
            </h3>
            <p className="text-sm text-gray-400 mt-2">ໄປເບິ່ງວຽກໃໝ່ໆ ແລ້ວສະໝັກກັນເລີຍ</p>
            <Link to="/jobs" className="mt-5 inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all">
              ໄປຊອກວຽກ →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(app => (
              <div key={app.id} className="bg-white rounded-2xl p-5 border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <Link to={`/jobs/${app.job_id}`} className="font-bold text-gray-800 hover:text-blue-600 hover:underline text-base block">
                      {app.job_title}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">
                      {app.company_id ? (
                        <Link to={`/users/${app.company_id}`} className="hover:text-blue-600 hover:underline font-medium">
                          {app.company_name}
                        </Link>
                      ) : (
                        <span className="font-medium">{app.company_name}</span>
                      )}
                      <span className="mx-1.5 text-gray-300">•</span>
                      <span className="inline-flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {app.location}
                      </span>
                    </p>
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      ສະໝັກເມື່ອ: {new Date(app.applied_at).toLocaleDateString('lo-LA', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${statusColor[app.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                      {statusLabel[app.status] || app.status}
                    </span>
                    <Link
                      to={`/jobs/${app.job_id}`}
                      className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-medium transition-all"
                    >
                      ເບິ່ງວຽກ →
                    </Link>
                    {app.status === 'pending' && (
                      <button
                        onClick={() => handleCancel(app)}
                        className="text-xs bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 font-medium transition-all"
                      >
                        ຍົກເລີກ
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
