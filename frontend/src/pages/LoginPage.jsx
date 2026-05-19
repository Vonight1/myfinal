import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        if (result.user.role === 'admin') navigate('/admin');
        else if (result.user.role === 'company') navigate('/company');
        else navigate('/jobs');
      } else {
        setError(result.message || 'ອີເມວ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດ ກະລຸນາລອງໃໝ່');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 top-0 flex">
      {/* ===== ຊ້າຍ: Branding ===== */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute w-2 h-2 bg-white rounded-full animate-pulse"
              style={{ left: `${Math.random()*100}%`, top: `${Math.random()*100}%`, animationDelay: `${i*0.3}s` }} />
          ))}
        </div>
        <div className="relative z-10 text-center text-white px-12">
          {/* SVG Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <svg width="56" height="56" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="36" height="36" rx="10" fill="rgba(255,255,255,0.15)" />
              <path d="M10 18.5L14.5 13L19 18.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14.5 13V24" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M19 14H25C25.5523 14 26 14.4477 26 15V23C26 23.5523 25.5523 24 25 24H19" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="22.5" cy="19" r="1.5" fill="white"/>
            </svg>
            <span className="text-3xl font-extrabold tracking-tight">
              <span className="text-white">Part</span><span className="text-blue-300">Time</span>
            </span>
          </div>
          <p className="text-lg text-blue-200 mb-10 max-w-sm mx-auto">
            ແພລດຟອມອັນດັບ 1 ສຳລັບຊອກຫາວຽກ Part-time ໃນ ສປປ ລາວ
          </p>
          <div className="flex justify-center gap-10">
            {[['200+', 'ວຽກ'], ['50+', 'ບໍລິສັດ'], ['1,000+', 'ຜູ້ໃຊ້']].map(([n, l], i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-black text-yellow-400">{n}</div>
                <div className="text-sm text-blue-200 mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== ຂວາ: Form ===== */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
            <svg width="40" height="40" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="36" height="36" rx="10" fill="url(#lg1)" />
              <path d="M10 18.5L14.5 13L19 18.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14.5 13V24" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M19 14H25C25.5523 14 26 14.4477 26 15V23C26 23.5523 25.5523 24 25 24H19" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="22.5" cy="19" r="1.5" fill="white"/>
              <defs><linearGradient id="lg1" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse"><stop stopColor="#2563EB"/><stop offset="1" stopColor="#1D4ED8"/></linearGradient></defs>
            </svg>
            <span className="text-2xl font-extrabold"><span className="text-blue-600">Part</span><span className="text-gray-800">Time</span></span>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">ເຂົ້າສູ່ລະບົບ</h2>
            <p className="text-gray-500 text-sm mb-8">ຍິນດີຕ້ອນຮັບກັບຄືນ! ກະລຸນາປ້ອນຂໍ້ມູນຂອງທ່ານ</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">ອີເມວ</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required
                  placeholder="example@email.com"
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">ລະຫັດຜ່ານ</label>
                <div className="relative">
                  <input value={password} onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? 'text' : 'password'} required placeholder="ລະຫັດຜ່ານ"
                    className="w-full px-4 py-3.5 pr-12 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm font-medium">
                    {showPassword ? 'ເຊື່ອງ' : 'ສະແດງ'}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-lg shadow-blue-600/30">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ກຳລັງເຂົ້າສູ່ລະບົບ...
                  </span>
                ) : 'ເຂົ້າສູ່ລະບົບ'}
              </button>
            </form>

            <p className="text-center mt-8 text-sm text-gray-500">
              ຍັງບໍ່ມີບັນຊີ? <Link to="/register" className="text-blue-600 font-bold hover:underline">ສະໝັກສະມາຊິກ</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}