import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Spinner, PageLoader } from '../components/Skeleton';

export default function ChangePasswordPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading]);

  if (authLoading) return <PageLoader />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword.length < 8) {
      toast.error('ລະຫັດໃໝ່ຕ້ອງມີຢ່າງໜ້ອຍ 8 ຕົວ');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error('ລະຫັດໃໝ່ບໍ່ກົງກັນ');
      return;
    }
    if (form.oldPassword === form.newPassword) {
      toast.error('ລະຫັດໃໝ່ຕ້ອງຕ່າງຈາກລະຫັດເກົ່າ');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.changePassword(form.oldPassword, form.newPassword);
      if (res.data.success) {
        toast.success('ປ່ຽນລະຫັດຜ່ານສຳເລັດ');
        setForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => navigate(-1), 1200);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'ບໍ່ສາມາດປ່ຽນລະຫັດໄດ້');
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const strength = (() => {
    const pw = form.newPassword;
    if (!pw) return null;
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score; // 0-5
  })();

  const strengthInfo = [
    { label: 'ອ່ອນຫຼາຍ', color: 'bg-red-500', text: 'text-red-600', width: '20%' },
    { label: 'ອ່ອນ', color: 'bg-orange-500', text: 'text-orange-600', width: '40%' },
    { label: 'ປານກາງ', color: 'bg-yellow-500', text: 'text-yellow-600', width: '60%' },
    { label: 'ດີ', color: 'bg-green-500', text: 'text-green-600', width: '80%' },
    { label: 'ດີຫຼາຍ', color: 'bg-green-600', text: 'text-green-700', width: '100%' },
  ];

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">ປ່ຽນລະຫັດຜ່ານ</h1>
          <p className="text-sm text-gray-500 mt-2">ໃສ່ລະຫັດເກົ່າ + ລະຫັດໃໝ່</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Old password */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">ລະຫັດຜ່ານປະຈຸບັນ</label>
            <div className="relative">
              <input
                type={showOld ? 'text' : 'password'}
                value={form.oldPassword}
                onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
                required
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              <button type="button" onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="ສະແດງ/ຊ່ອນ">
                {showOld ? <EyeOffIcon/> : <EyeIcon/>}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">ລະຫັດຜ່ານໃໝ່</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                required
                minLength={8}
                placeholder="ຢ່າງໜ້ອຍ 8 ຕົວ"
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="ສະແດງ/ຊ່ອນ">
                {showNew ? <EyeOffIcon/> : <EyeIcon/>}
              </button>
            </div>
            {/* Strength meter */}
            {strength !== null && form.newPassword && (
              <div className="mt-2">
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${strengthInfo[Math.max(0, strength - 1)]?.color || 'bg-red-500'}`}
                    style={{ width: strengthInfo[Math.max(0, strength - 1)]?.width || '20%' }}
                  />
                </div>
                <p className={`text-xs mt-1 font-medium ${strengthInfo[Math.max(0, strength - 1)]?.text}`}>
                  {strengthInfo[Math.max(0, strength - 1)]?.label}
                </p>
              </div>
            )}
          </div>

          {/* Confirm */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">ຢືນຢັນລະຫັດໃໝ່</label>
            <input
              type={showNew ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
            {form.confirmPassword && form.newPassword !== form.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">ລະຫັດໃໝ່ບໍ່ກົງກັນ</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || form.newPassword.length < 8 || form.newPassword !== form.confirmPassword}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
          >
            {loading ? <><Spinner size="sm"/> ກຳລັງປ່ຽນ...</> : 'ປ່ຽນລະຫັດຜ່ານ'}
          </button>

          <div className="text-center text-sm pt-2">
            <Link to={-1} onClick={(e) => { e.preventDefault(); navigate(-1); }} className="text-gray-500 hover:underline">
              ← ກັບຄືນ
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}
