import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { Spinner, PageLoader } from '../components/Skeleton';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const token = searchParams.get('token');

  const [validating, setValidating] = useState(true);
  const [validToken, setValidToken] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenError('ບໍ່ມີ token ໃນ URL');
      setValidating(false);
      return;
    }
    authAPI.validateResetToken(token)
      .then(r => {
        if (r.data.success) setValidToken(true);
      })
      .catch(err => setTokenError(err.response?.data?.message || 'Token ບໍ່ຖືກຕ້ອງ'))
      .finally(() => setValidating(false));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ກວດສອບ
    if (password.length < 8) {
      toast.error('ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 8 ຕົວ');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('ລະຫັດຜ່ານບໍ່ກົງກັນ');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.resetPassword(token, password);
      if (res.data.success) {
        toast.success('ປ່ຽນລະຫັດຜ່ານສຳເລັດ! ກະລຸນາ login ໃໝ່');
        setTimeout(() => navigate('/login'), 1500);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'ບໍ່ສາມາດປ່ຽນລະຫັດໄດ້');
    } finally {
      setLoading(false);
    }
  };

  if (validating) return <PageLoader />;

  if (!validToken) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Token ບໍ່ຖືກຕ້ອງ</h2>
          <p className="text-sm text-gray-500 mb-6">{tokenError}</p>
          <Link to="/forgot-password" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700">
            ຮ້ອງຂໍ link ໃໝ່
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">ປ່ຽນລະຫັດຜ່ານໃໝ່</h1>
          <p className="text-sm text-gray-500 mt-2">ໃສ່ລະຫັດຜ່ານໃໝ່ຂອງເຈົ້າ</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">ລະຫັດຜ່ານໃໝ່</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="ຢ່າງໜ້ອຍ 8 ຕົວ"
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="ສະແດງ/ຊ່ອນລະຫັດ"
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                )}
              </button>
            </div>
            {password && password.length < 8 && (
              <p className="text-xs text-red-500 mt-1">ລະຫັດຜ່ານສັ້ນເກີນໄປ</p>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">ຢືນຢັນລະຫັດຜ່ານ</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="ໃສ່ລະຫັດອີກຄັ້ງ"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-red-500 mt-1">ລະຫັດຜ່ານບໍ່ກົງກັນ</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || password.length < 8 || password !== confirmPassword}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
          >
            {loading ? <><Spinner size="sm" /> ກຳລັງປ່ຽນ...</> : 'ປ່ຽນລະຫັດຜ່ານ'}
          </button>
        </form>
      </div>
    </div>
  );
}
