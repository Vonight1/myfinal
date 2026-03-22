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
    <div className="min-h-screen flex">
      {/* ===== ຊ້າຍ: ຮູບພາບ / Branding ===== */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 text-white">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center text-6xl mb-8 shadow-2xl">
            💼
          </div>
          <h1 className="text-5xl font-black mb-4 text-center leading-tight">
            PartTime Job
          </h1>
          <p className="text-xl text-blue-200 text-center max-w-md mb-8">
            ແພລດຟອມອັນດັບ 1 ສຳລັບຊອກຫາວຽກ Part-time ໃນ ສປປ ລາວ
          </p>
          <div className="flex gap-8 mt-4">
            {[['200+', 'ວຽກ'], ['50+', 'ບໍລິສັດ'], ['1,000+', 'ຜູ້ໃຊ້']].map(([n, l], i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-black text-yellow-400">{n}</div>
                <div className="text-sm text-blue-200">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== ຂວາ: Form Login ===== */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="text-5xl mb-3">💼</div>
            <h1 className="text-2xl font-bold text-blue-800">PartTime Job</h1>
          </div>

          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-lg border border-gray-100">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800">ເຂົ້າສູ່ລະບົບ</h2>
              <p className="text-gray-500 mt-2">ຍິນດີຕ້ອນຮັບກັບຄືນ! ກະລຸນາປ້ອນຂໍ້ມູນຂອງທ່ານ</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">
                ❌ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">ອີເມວ</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  placeholder="example@email.com"
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">ລະຫັດຜ່ານ</label>
                <div className="relative">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3.5 pr-12 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-700 text-white py-3.5 rounded-xl font-bold text-base hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-700/30"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ກຳລັງເຂົ້າສູ່ລະບົບ...
                  </span>
                ) : (
                  'ເຂົ້າສູ່ລະບົບ'
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-500">
                ຍັງບໍ່ມີບັນຊີ?{' '}
                <Link to="/register" className="text-blue-600 font-bold hover:underline">
                  ສະໝັກສະມາຊິກ
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}