import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [role, setRole] = useState('applicant');
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', company_name: '', company_address: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'ກະລຸນາປ້ອນຊື່';
    if (!form.email.trim()) e.email = 'ກະລຸນາປ້ອນອີເມວ';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'ຮູບແບບອີເມວບໍ່ຖືກຕ້ອງ';
    if (form.phone && !/^0\d{9,10}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'ເບີໂທບໍ່ຖືກຕ້ອງ';
    if (!form.password) e.password = 'ກະລຸນາປ້ອນລະຫັດຜ່ານ';
    else if (form.password.length < 6) e.password = 'ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວ';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'ລະຫັດຜ່ານບໍ່ກົງກັນ';
    if (role === 'company' && !form.company_name.trim()) e.company_name = 'ກະລຸນາປ້ອນຊື່ບໍລິສັດ';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(false);
    if (!validate()) return;
    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = form;
      const result = await register({ ...submitData, role });
      if (result.success) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(result.message || 'ບໍ່ສາມາດສະໝັກໄດ້');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດ');
    } finally { setLoading(false); }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3.5 border rounded-xl text-sm outline-none transition-all ${
      errors[field]
        ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
        : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
    }`;

  return (
    <div className="min-h-screen flex">
      {/* ===== ຊ້າຍ: Branding ===== */}
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
          <h1 className="text-5xl font-black mb-4 text-center leading-tight">PartTime Job</h1>
          <p className="text-xl text-blue-200 text-center max-w-md mb-8">
            ເລີ່ມຕົ້ນການຊອກຫາວຽກ Part-time ທີ່ເໝາະສົມກັບທ່ານ
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-lg mb-3">ເປັນຫຍັງຕ້ອງເລືອກເຮົາ?</h3>
            {['ວຽກ Part-time ຫຼາກຫຼາຍ', 'ຟຣີ! ບໍ່ເສຍຄ່າ', 'ໃຊ້ງານງ່າຍ ສະດວກ'].map((item, i) => (
              <div key={i} className="flex items-center gap-2 mt-2">
                <span className="text-green-400">✓</span>
                <span className="text-blue-100 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== ຂວາ: Form Register ===== */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-lg">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-6">
            <div className="text-5xl mb-3">💼</div>
            <h1 className="text-2xl font-bold text-blue-800">PartTime Job</h1>
          </div>

          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-lg border border-gray-100">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800">ສະໝັກສະມາຊິກ</h2>
              <p className="text-gray-500 mt-2">ສ້າງບັນຊີເພື່ອເລີ່ມຕົ້ນ</p>
            </div>

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-4">
                ✅ ສະໝັກສຳເລັດ! ກຳລັງໄປໜ້າເຂົ້າສູ່ລະບົບ...
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
                ❌ {error}
              </div>
            )}

            {/* Role Toggle */}
            <div className="flex gap-3 mb-6">
              {[['applicant', '🔍 ຊອກວຽກ'], ['company', '🏢 ປະກາດວຽກ']].map(([r, label]) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 py-3.5 rounded-xl text-sm font-bold border-2 transition-all ${
                    role === r
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ຊື່ */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  ຊື່ ແລະ ນາມສະກຸນ <span className="text-red-500">*</span>
                </label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="ເຊັ່ນ: ສົມສັກ ແກ້ວມະນີ" className={inputClass('name')} />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* ອີເມວ */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  ອີເມວ <span className="text-red-500">*</span>
                </label>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="example@email.com" className={inputClass('email')} />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* ເບີໂທ */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">ເບີໂທ</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="020 99887766" className={inputClass('phone')} />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              {/* ລະຫັດຜ່ານ */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  ລະຫັດຜ່ານ <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="ຢ່າງໜ້ອຍ 6 ຕົວ" className={`${inputClass('password')} pr-12`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg">
                    {showPassword }
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                {form.password && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div key={level} className={`h-1.5 flex-1 rounded-full ${form.password.length >= level * 3 ? (form.password.length >= 12 ? 'bg-green-500' : form.password.length >= 8 ? 'bg-yellow-500' : 'bg-red-400') : 'bg-gray-200'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {form.password.length < 6 ? 'ອ່ອນເກີນໄປ' : form.password.length < 8 ? 'ພໍໃຊ້ໄດ້' : form.password.length < 12 ? 'ດີ' : 'ແຂງແຮງ'}
                    </p>
                  </div>
                )}
              </div>

              {/* ຢືນຢັນລະຫັດ */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  ຢືນຢັນລະຫັດຜ່ານ <span className="text-red-500">*</span>
                </label>
                <input name="confirmPassword" type={showPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={handleChange} placeholder="ປ້ອນລະຫັດຜ່ານອີກຄັ້ງ"
                  className={`w-full px-4 py-3.5 border rounded-xl text-sm outline-none transition-all ${
                    errors.confirmPassword ? 'border-red-400 focus:ring-red-100' :
                    form.confirmPassword && form.password === form.confirmPassword ? 'border-green-400 focus:ring-green-100' :
                    'border-gray-200 focus:ring-blue-100'
                  } focus:ring-2`}
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                {form.confirmPassword && !errors.confirmPassword && form.password === form.confirmPassword && (
                  <p className="text-green-500 text-xs mt-1">✓ ລະຫັດຜ່ານກົງກັນ</p>
                )}
              </div>

              {/* Company Fields */}
              {role === 'company' && (
                <div className="space-y-4 pt-4 border-t border-dashed border-gray-300">
                  <p className="text-sm font-bold text-gray-600">🏢 ຂໍ້ມູນບໍລິສັດ</p>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">
                      ຊື່ບໍລິສັດ <span className="text-red-500">*</span>
                    </label>
                    <input name="company_name" value={form.company_name} onChange={handleChange} placeholder="ບໍລິສັດ ລາວ ເທັກ ຈຳກັດ" className={inputClass('company_name')} />
                    {errors.company_name && <p className="text-red-500 text-xs mt-1">{errors.company_name}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">ທີ່ຢູ່ບໍລິສັດ</label>
                    <input name="company_address" value={form.company_address} onChange={handleChange} placeholder="ຖະໜົນລ້ານຊ້າງ, ວຽງຈັນ" className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || success}
                className="w-full bg-blue-700 text-white py-3.5 rounded-xl font-bold text-base hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-700/30 mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ກຳລັງສະໝັກ...
                  </span>
                ) : success ? '✅ ສະໝັກສຳເລັດ!' : 'ສະໝັກສະມາຊິກ'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-500">
                ມີບັນຊີແລ້ວ?{' '}
                <Link to="/login" className="text-blue-600 font-bold hover:underline">ເຂົ້າສູ່ລະບົບ</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}