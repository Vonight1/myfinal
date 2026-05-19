import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationsAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { statusColor, statusLabel } from '../lib/utils';

export default function ProfilePage() {
 const { user, loading: authLoading, updateProfile } = useAuth();
 const navigate = useNavigate();
 const [tab, setTab] = useState('profile');
 const [applications, setApplications] = useState([]);
 const [editing, setEditing] = useState(false);
 const [saving, setSaving] = useState(false);
 const [msg, setMsg] = useState('');
 const [form, setForm] = useState({ name: '', phone: '', skills: '', education: '' });

 useEffect(() => {
 if (!authLoading && !user) { navigate('/login'); return; }
 if (user) {
 setForm({ name: user.name || '', phone: user.phone || '', skills: user.skills || '', education: user.education || '' });
 if (user.role === 'applicant') applicationsAPI.getMyApplications().then(r => { if (r.data.success) setApplications(r.data.data || []); });
 }
 }, [user, authLoading]);

 const handleSave = async (e) => {
 e.preventDefault(); setSaving(true);
 try { const res = await updateProfile(form); if (res.success) { setMsg('ບັນທຶກສຳເລັດ'); setEditing(false); } }
 catch { setMsg('ເກີດຂໍ້ຜິດພາດ'); } finally { setSaving(false); }
 };

 if (authLoading) return <div className="flex justify-center py-32"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;

 return (
 <div className="max-w-4xl mx-auto px-4 py-8">
 <h1 className="text-2xl font-bold mb-6"> ໂປຣໄຟລ໌</h1>
 {user?.role === 'applicant' && (
 <div className="flex gap-2 mb-6">
 {[['profile', ' ຂໍ້ມູນ'], ['applications', ' ວຽກທີ່ສະໝັກ']].map(([k, l]) => (
 <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 rounded-xl text-sm font-medium ${tab === k ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-600'}`}>{l}</button>
 ))}
 </div>
 )}
 {msg && <div className="mb-4 px-4 py-3 rounded-xl text-sm bg-green-50 text-green-700 border border-green-200"> {msg}</div>}

 {tab === 'profile' && (
 <div className="bg-white rounded-2xl p-6 border">
 <div className="flex items-center gap-4 mb-6">
 <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl">{user?.name?.[0]}</div>
 <div>
 <h2 className="text-xl font-bold">{user?.name}</h2>
 <p className="text-gray-500 text-sm">{user?.email}</p>
 <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full mt-1 inline-block">{user?.role === 'company' ? 'ບໍລິສັດ' : user?.role === 'admin' ? 'Admin' : 'ຜູ້ຊອກວຽກ'}</span>
 </div>
 </div>
 {editing ? (
 <form onSubmit={handleSave} className="space-y-4">
 <div><label className="text-sm text-gray-600 block mb-1">ຊື່</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2.5 border rounded-xl text-sm outline-none" /></div>
 <div><label className="text-sm text-gray-600 block mb-1">ເບີໂທ</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-4 py-2.5 border rounded-xl text-sm outline-none" /></div>
 {user?.role === 'applicant' && <>
 <div><label className="text-sm text-gray-600 block mb-1">ທັກສະ</label><textarea value={form.skills} onChange={e => setForm({...form, skills: e.target.value})} rows={3} className="w-full px-4 py-2.5 border rounded-xl text-sm outline-none resize-none" /></div>
 <div><label className="text-sm text-gray-600 block mb-1">ການສຶກສາ</label><input value={form.education} onChange={e => setForm({...form, education: e.target.value})} className="w-full px-4 py-2.5 border rounded-xl text-sm outline-none" /></div>
 </>}
 <div className="flex gap-3">
 <button type="submit" disabled={saving} className="bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold disabled:opacity-50">{saving ? 'ກຳລັງບັນທຶກ...' : ' ບັນທຶກ'}</button>
 <button type="button" onClick={() => setEditing(false)} className="px-6 py-2.5 border rounded-xl text-sm">ຍົກເລີກ</button>
 </div>
 </form>
 ) : (
 <div>
 <div className="grid grid-cols-2 gap-4 mb-6">
 <div className="bg-gray-50 rounded-xl p-3"><div className="text-xs text-gray-500"> ເບີໂທ</div><div className="text-sm font-medium mt-1">{user?.phone || '-'}</div></div>
 {user?.role === 'applicant' && <>
 <div className="bg-gray-50 rounded-xl p-3"><div className="text-xs text-gray-500"> ການສຶກສາ</div><div className="text-sm font-medium mt-1">{user?.education || '-'}</div></div>
 <div className="bg-gray-50 rounded-xl p-3 col-span-2"><div className="text-xs text-gray-500"> ທັກສະ</div><div className="text-sm font-medium mt-1">{user?.skills || '-'}</div></div>
 </>}
 </div>
 <button onClick={() => setEditing(true)} className="bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-800"> ແກ້ໄຂ</button>
 </div>
 )}
 </div>
 )}

 {tab === 'applications' && (
 <div className="space-y-3">
 {applications.length === 0 ? <div className="text-center py-16 bg-white rounded-2xl border text-gray-500"><div className="text-4xl mb-3"></div><p>ຍັງບໍ່ໄດ້ສະໝັກວຽກ</p></div> :
 applications.map(app => (
 <div key={app.id} className="bg-white rounded-2xl p-5 border">
 <div className="flex items-center justify-between">
 <div>
 <h3 className="font-bold text-gray-800">{app.job_title}</h3>
 <p className="text-sm text-gray-500">{app.company_name} • {app.location}</p>
 <p className="text-xs text-gray-400 mt-1">ສະໝັກ: {new Date(app.applied_at).toLocaleDateString('lo-LA')}</p>
 </div>
 <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${statusColor[app.status] || 'bg-gray-100'}`}>{statusLabel[app.status] || app.status}</span>
 </div>
 </div>
 ))
 }
 </div>
 )}
 </div>
 );
}