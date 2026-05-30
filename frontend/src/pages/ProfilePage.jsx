import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PageLoader, Spinner } from '../components/Skeleton';

export default function ProfilePage() {
  const { user, loading: authLoading, updateProfile } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', skills: '', education: '' });

  useEffect(() => {
    if (!authLoading && !user) { navigate('/login'); return; }
    // Company → redirect ໄປ /company/profile (ໃຊ້ profile ດຽວ)
    if (!authLoading && user?.role === 'company') { navigate('/company/profile', { replace: true }); return; }
    // Admin → redirect ໄປ /admin
    if (!authLoading && user?.role === 'admin') { navigate('/admin', { replace: true }); return; }
    if (user) {
      setForm({ name: user.name || '', phone: user.phone || '', skills: user.skills || '', education: user.education || '' });
    }
  }, [user, authLoading]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateProfile(form);
      if (res.success) {
        toast.success('ບັນທຶກໂປຣໄຟລ໌ສຳເລັດ');
        setEditing(false);
      }
    } catch {
      toast.error('ເກີດຂໍ້ຜິດພາດ');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) return <PageLoader />;

  return (
    <div className="bg-gradient-to-b from-blue-50/50 to-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">ໂປຣໄຟລ໌</h1>
              <p className="text-sm text-gray-500 mt-0.5">ຂໍ້ມູນສ່ວນຕົວຂອງເຈົ້າ</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to="/change-password"
              className="bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-all flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              ປ່ຽນລະຫັດ
            </Link>
            {user?.role === 'applicant' && (
              <Link
                to="/my-applications"
                className="bg-blue-50 text-blue-700 border border-blue-200 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-all flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                ວຽກທີ່ສະໝັກ →
              </Link>
            )}
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* Header section ມີ avatar */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 h-24 md:h-28" />

          <div className="px-6 -mt-12 pb-6">
            <div className="flex items-end justify-between gap-3 flex-wrap mb-4">
              <div className="w-24 h-24 bg-white rounded-2xl shadow-md border-4 border-white flex items-center justify-center text-3xl font-bold text-blue-700">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  ແກ້ໄຂ
                </button>
              )}
            </div>

            {/* Name + Role */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">{user?.name}</h2>
              <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                {user?.email}
              </p>
              <span className="mt-2 inline-block text-xs bg-blue-100 text-blue-700 font-semibold px-3 py-1 rounded-full border border-blue-200">
                ຜູ້ຊອກວຽກ
              </span>
            </div>

            {editing ? (
              /* ===== Edit Form ===== */
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">ຊື່</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">ເບີໂທ</label>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">ການສຶກສາ</label>
                  <input
                    value={form.education}
                    onChange={(e) => setForm({ ...form, education: e.target.value })}
                    placeholder="ເຊັ່ນ: ປຣິນຍາຕີ ວິສະວະກຳຄອມພິວເຕີ"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">ທັກສະ (Skills)</label>
                  <textarea
                    value={form.skills}
                    onChange={(e) => setForm({ ...form, skills: e.target.value })}
                    rows={3}
                    placeholder="ເຊັ່ນ: JavaScript, React, Node.js, SQL"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">ແຍກດ້ວຍຈຸດ (,) ຫຼື ບັນທັດໃໝ່</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
                  >
                    {saving ? <><Spinner size="sm"/> ກຳລັງບັນທຶກ...</> : 'ບັນທຶກ'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    ຍົກເລີກ
                  </button>
                </div>
              </form>
            ) : (
              /* ===== View Mode ===== */
              <div className="space-y-3">
                <InfoCard
                  iconColor="bg-green-100 text-green-600"
                  icon="M3 5a2 2 0 012-2h3.28a1 1 0 01.95.68l1.5 4.49a1 1 0 01-.5 1.21l-2.26 1.13a11 11 0 005.52 5.52l1.13-2.26a1 1 0 011.21-.5l4.49 1.5a1 1 0 01.68.95V19a2 2 0 01-2 2h-1C9.72 21 3 14.28 3 6V5z"
                  label="ເບີໂທ"
                  value={user?.phone || 'ຍັງບໍ່ໄດ້ໃສ່'}
                />
                <InfoCard
                  iconColor="bg-purple-100 text-purple-600"
                  icon="M22 10v6M2 10l10-5 10 5-10 5z"
                  label="ການສຶກສາ"
                  value={user?.education || 'ຍັງບໍ່ໄດ້ໃສ່'}
                />

                {/* Skills - tags */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    </div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">ທັກສະ (Skills)</p>
                  </div>
                  {user?.skills ? (
                    <div className="flex flex-wrap gap-2">
                      {user.skills.split(/[,;\n]/).filter(s => s.trim()).map((skill, i) => (
                        <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium border border-blue-100">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">ຍັງບໍ່ໄດ້ໃສ່</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, iconColor, label, value }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg ${iconColor} flex items-center justify-center shrink-0`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d={icon}/></svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">{label}</p>
        <p className="text-sm font-semibold text-gray-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}
