import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function CompanyProfilePage() {
  const { user, loading: authLoading, updateProfile } = useAuth();
  const navigate = useNavigate();
  const logoInputRef = useRef(null);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [logoUrl, setLogoUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const coverInputRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    company_name: '',
    company_industry: '',
    company_website: '',
    company_address: '',
    company_description: '',
  });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'company')) {
      navigate('/login');
      return;
    }
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        company_name: user.company_name || '',
        company_industry: user.company_industry || '',
        company_website: user.company_website || '',
        company_address: user.company_address || '',
        company_description: user.company_description || '',
      });
      setLogoUrl(user.company_logo || '');
      setCoverUrl(user.company_cover || '');
    }
  }, [user, authLoading]);

  // ===== Save Profile =====
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      const res = await updateProfile(form);
      if (res.success) {
        setMsg({ type: 'success', text: 'ບັນທຶກສຳເລັດ' });
        setEditing(false);
      } else {
        setMsg({ type: 'error', text: res.message || 'ບໍ່ສຳເລັດ' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດ' });
    } finally {
      setSaving(false);
    }
  };

  // ===== Cover Upload =====
  const handleCoverChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setMsg({ type: 'error', text: 'ຮອງຮັບສະເພາະ JPG, PNG, WEBP' }); return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMsg({ type: 'error', text: 'ໄຟລ໌ໃຫຍ່ເກີນ 10MB' }); return;
    }
    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append('cover', file);
      const res = await authAPI.uploadCover(formData);
      if (res.data.success) {
        setCoverUrl(res.data.data.company_cover);
        setMsg({ type: 'success', text: 'ອັບໂຫຼດຮູບປະກອບສຳເລັດ' });
        window.location.reload();
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'ອັບໂຫຼດບໍ່ໄດ້' });
    } finally {
      setUploadingCover(false);
      e.target.value = '';
    }
  };

  // ===== Logo Upload =====
  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // ກວດປະເພດ
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setMsg({ type: 'error', text: 'ຮອງຮັບສະເພາະ JPG, PNG, WEBP' });
      return;
    }
    // ກວດຂະໜາດ
    if (file.size > 5 * 1024 * 1024) {
      setMsg({ type: 'error', text: 'ໄຟລ໌ໃຫຍ່ເກີນ 5MB' });
      return;
    }

    setUploadingLogo(true);
    setMsg({ type: '', text: '' });
    try {
      const formData = new FormData();
      formData.append('logo', file);
      const res = await authAPI.uploadLogo(formData);
      if (res.data.success) {
        setLogoUrl(res.data.data.company_logo);
        setMsg({ type: 'success', text: 'ອັບໂຫຼດໂລໂກສຳເລັດ' });
        // Refresh user data
        window.location.reload();
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'ອັບໂຫຼດບໍ່ໄດ້' });
    } finally {
      setUploadingLogo(false);
      e.target.value = '';
    }
  };

  if (authLoading) {
    return <div className="flex justify-center py-32"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;
  }

  const apiBase = 'http://localhost:8080';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">ໂປຣໄຟລ໌ບໍລິສັດ</h1>
        {!editing && (
          <button onClick={() => setEditing(true)}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-lg shadow-blue-600/30">
            ແກ້ໄຂໂປຣໄຟລ໌
          </button>
        )}
      </div>

      {/* Message */}
      {msg.text && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm ${
          msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {msg.text}
        </div>
      )}

      {/* ===== Cover + Logo Hero ===== */}
      <div className="bg-white rounded-2xl mb-6 overflow-hidden border shadow-md">
        {/* Cover Image */}
        <div className="relative h-48 md:h-64 bg-gradient-to-br from-blue-600 to-indigo-700 group">
          {coverUrl ? (
            <img src={`${apiBase}${coverUrl}`} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 opacity-10">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="absolute w-3 h-3 bg-white rounded-full"
                  style={{ left: `${Math.random()*100}%`, top: `${Math.random()*100}%` }} />
              ))}
            </div>
          )}

          {/* Upload Cover Button */}
          <button
            onClick={() => coverInputRef.current?.click()}
            disabled={uploadingCover}
            className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold shadow-lg hover:bg-white transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {uploadingCover ? (
              <><span className="w-4 h-4 border-2 border-gray-400 border-t-gray-700 rounded-full animate-spin"></span> ກຳລັງອັບໂຫຼດ...</>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 15l4-4 4 4 6-6 4 4" />
                  <path d="M21 5v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
                ປ່ຽນຮູບປະກອບ
              </>
            )}
          </button>
          <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCoverChange} className="hidden" />
        </div>

        {/* Logo + Name (overlapping cover) */}
        <div className="px-6 pb-6 -mt-12 relative">
          <div className="flex items-end gap-4">
            <div className="relative">
              <div className="w-24 h-24 md:w-28 md:h-28 bg-white rounded-2xl flex items-center justify-center overflow-hidden shadow-2xl ring-4 ring-white">
                {logoUrl ? (
                  <img src={`${apiBase}${logoUrl}`} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-4xl md:text-5xl font-bold text-blue-600">
                    {user?.company_name?.[0] || user?.name?.[0] || 'C'}
                  </div>
                )}
              </div>
              <button
                onClick={() => logoInputRef.current?.click()}
                disabled={uploadingLogo}
                className="absolute -bottom-1 -right-1 bg-yellow-400 text-blue-900 rounded-full w-9 h-9 flex items-center justify-center font-bold shadow-lg hover:bg-yellow-300 transition-all disabled:opacity-50"
                title="ປ່ຽນໂລໂກ"
              >
                {uploadingLogo ? (
                  <span className="w-4 h-4 border-2 border-blue-900/30 border-t-blue-900 rounded-full animate-spin"></span>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M3 15l4-4 4 4 6-6 4 4" />
                    <path d="M21 5v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                )}
              </button>
              <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleLogoChange} className="hidden" />
            </div>

            <div className="flex-1 min-w-0 pb-2">
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 truncate">{user?.company_name || 'ບໍລິສັດ'}</h2>
              <p className="text-gray-500 text-sm">{user?.company_industry || 'ບໍ່ໄດ້ລະບຸປະເພດທຸລະກິດ'}</p>
              <div className="flex gap-2 mt-2">
                <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">ບໍລິສັດ</span>
                {user?.is_banned ? (
                  <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full">ຖືກລະງັບ</span>
                ) : (
                  <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">ໃຊ້ງານ</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Profile Info ===== */}
      {!editing ? (
        // View Mode
        <div className="bg-white rounded-2xl border p-6">
          <h3 className="font-bold text-lg mb-4 text-gray-800">ຂໍ້ມູນບໍລິສັດ</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              ['ຊື່ບໍລິສັດ', user?.company_name || 'ບໍ່ໄດ້ລະບຸ'],
              ['ປະເພດທຸລະກິດ', user?.company_industry || 'ບໍ່ໄດ້ລະບຸ'],
              ['ເບີໂທ', user?.phone || 'ບໍ່ໄດ້ລະບຸ'],
              ['ອີເມວ', user?.email || '-'],
              ['ເວັບໄຊ', user?.company_website ? (
                <a href={user.company_website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{user.company_website}</a>
              ) : 'ບໍ່ໄດ້ລະບຸ'],
              ['ຊື່ຜູ້ຕິດຕໍ່', user?.name || '-'],
            ].map(([label, value], i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs text-gray-500 mb-1">{label}</div>
                <div className="text-sm font-medium text-gray-800">{value}</div>
              </div>
            ))}
            <div className="bg-gray-50 rounded-xl p-4 md:col-span-2">
              <div className="text-xs text-gray-500 mb-1">ທີ່ຢູ່ບໍລິສັດ</div>
              <div className="text-sm font-medium text-gray-800">{user?.company_address || 'ບໍ່ໄດ້ລະບຸ'}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 md:col-span-2">
              <div className="text-xs text-gray-500 mb-2">ລາຍລະອຽດບໍລິສັດ</div>
              <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {user?.company_description || 'ບໍ່ໄດ້ລະບຸ'}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Edit Mode
        <form onSubmit={handleSave} className="bg-white rounded-2xl border p-6">
          <h3 className="font-bold text-lg mb-4 text-gray-800">ແກ້ໄຂຂໍ້ມູນບໍລິສັດ</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">ຊື່ບໍລິສັດ <span className="text-red-500">*</span></label>
              <input value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})} required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">ປະເພດທຸລະກິດ</label>
              <input value={form.company_industry} onChange={e => setForm({...form, company_industry: e.target.value})}
                placeholder="ເຊັ່ນ: ເຕັກໂນໂລຊີ, ການເງິນ, ການສຶກສາ"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">ເບີໂທ</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                placeholder="020 99887766"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">ເວັບໄຊ</label>
              <input value={form.company_website} onChange={e => setForm({...form, company_website: e.target.value})}
                placeholder="https://example.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">ຊື່ຜູ້ຕິດຕໍ່</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">ທີ່ຢູ່ບໍລິສັດ</label>
              <input value={form.company_address} onChange={e => setForm({...form, company_address: e.target.value})}
                placeholder="ຖະໜົນ, ບ້ານ, ເມືອງ, ແຂວງ"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">ລາຍລະອຽດບໍລິສັດ</label>
              <textarea value={form.company_description} onChange={e => setForm({...form, company_description: e.target.value})}
                rows={5} placeholder="ອະທິບາຍກ່ຽວກັບບໍລິສັດ, ສິນຄ້າ, ບໍລິການ..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none" />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6 pt-4 border-t">
            <button type="submit" disabled={saving}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-600/30 flex items-center gap-2">
              {saving ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> ກຳລັງບັນທຶກ...</>
              ) : 'ບັນທຶກ'}
            </button>
            <button type="button" onClick={() => setEditing(false)}
              className="px-6 py-3 rounded-xl border text-sm hover:bg-gray-50 font-medium">
              ຍົກເລີກ
            </button>
          </div>
        </form>
      )}
    </div>
  );
}