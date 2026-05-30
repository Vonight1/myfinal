import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { Spinner } from '../components/Skeleton';

export default function ForgotPasswordPage() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState(''); // ສຳລັບ dev mode

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.forgotPassword(email);
      if (res.data.success) {
        setSent(true);
        toast.success('ສົ່ງ link ຣີເຊັດສຳເລັດ');
        // Dev mode: ສະແດງ link ໂດຍກົງ
        if (res.data.data?.reset_link) {
          setDevLink(res.data.data.reset_link);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8 w-full max-w-md">
        {!sent ? (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">ລືມລະຫັດຜ່ານ?</h1>
              <p className="text-sm text-gray-500 mt-2">ໃສ່ email ຂອງເຈົ້າ ເຮົາຈະສົ່ງ link ຣີເຊັດໃຫ້</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
              >
                {loading ? <><Spinner size="sm" /> ກຳລັງສົ່ງ...</> : 'ສົ່ງ link ຣີເຊັດ'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <Link to="/login" className="text-blue-600 font-semibold hover:underline">
                ← ກັບໄປໜ້າເຂົ້າສູ່ລະບົບ
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">ສົ່ງສຳເລັດ!</h2>
            <p className="text-sm text-gray-500 mb-4">
              ຖ້າ email ນີ້ມີໃນລະບົບ ເຮົາໄດ້ສົ່ງ link ຣີເຊັດໃຫ້ແລ້ວ
            </p>

            {devLink && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4 text-left">
                <p className="text-xs font-semibold text-yellow-800 mb-2">⚠️ Dev Mode - Link ຣີເຊັດ:</p>
                <a href={devLink} className="text-xs text-blue-600 break-all hover:underline block">
                  {devLink}
                </a>
                <p className="text-xs text-yellow-700 mt-2">
                  (ໃນ production link ນີ້ຈະຖືກສົ່ງທາງ email ບໍ່ສະແດງຢູ່ນີ້)
                </p>
              </div>
            )}

            <Link to="/login" className="text-blue-600 font-semibold hover:underline text-sm">
              ກັບໄປໜ້າເຂົ້າສູ່ລະບົບ →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
