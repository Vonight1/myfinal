import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobsAPI, applicationsAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { statusColor, statusLabel } from '../lib/utils';

export default function CompanyPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('jobs');
  const [myJobs, setMyJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [msg, setMsg] = useState('');
  const [jobForm, setJobForm] = useState({ title: '', description: '', requirements: '', category_id: '', salary_min: '', salary_max: '', salary_type: 'monthly', location: '', job_type: 'part-time', work_days: '', work_hours: '', positions: 1, deadline: '' });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'company')) { navigate('/login'); return; }
    if (user) { jobsAPI.getMyJobs().then(r => { if (r.data.success) setMyJobs(r.data.data || []); }).finally(() => setLoading(false)); jobsAPI.getCategories().then(r => { if (r.data.success) setCategories(r.data.data || []); }); }
  }, [user, authLoading]);

  const loadApplicants = async (jobId) => {
    setSelectedJobId(jobId); setTab('applicants');
    const res = await applicationsAPI.getJobApplicants(jobId);
    if (res.data.success) setApplicants(res.data.data || []);
  };

  const handlePostJob = async (e) => {
    e.preventDefault(); setPosting(true); setMsg('');
    try {
      const payload = { ...jobForm, category_id: jobForm.category_id ? Number(jobForm.category_id) : null, salary_min: jobForm.salary_min ? Number(jobForm.salary_min) : null, salary_max: jobForm.salary_max ? Number(jobForm.salary_max) : null, positions: Number(jobForm.positions) || 1 };
      const res = await jobsAPI.createJob(payload);
      if (res.data.success) { setMsg('ປະກາດວຽກສຳເລັດ! ລໍຖ້າ Admin ອະນຸມັດ.'); setJobForm({ title: '', description: '', requirements: '', category_id: '', salary_min: '', salary_max: '', salary_type: 'monthly', location: '', job_type: 'part-time', work_days: '', work_hours: '', positions: 1, deadline: '' }); jobsAPI.getMyJobs().then(r => { if (r.data.success) setMyJobs(r.data.data || []); }); setTab('jobs'); }
    } catch (err) { setMsg(err.response?.data?.message || 'ບໍ່ສາມາດປະກາດໄດ້'); }
    finally { setPosting(false); }
  };

  const updateAppStatus = async (appId, status) => {
    await applicationsAPI.updateStatus(appId, status);
    loadApplicants(selectedJobId);
  };

  const h = (e) => setJobForm({ ...jobForm, [e.target.name]: e.target.value });

  if (authLoading || loading) return <div className="flex justify-center py-32"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">📊 Dashboard ບໍລິສັດ</h1>
        <button onClick={() => setTab('post')} className="bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-800">+ ປະກາດວຽກໃໝ່</button>
      </div>
      {msg && <div className="mb-4 px-4 py-3 rounded-xl text-sm bg-green-50 text-green-700 border border-green-200">✅ {msg}</div>}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[['📋', 'ວຽກທັງໝົດ', myJobs.length, 'bg-blue-50'], ['✅', 'ອະນຸມັດ', myJobs.filter(j => j.status === 'approved').length, 'bg-green-50'], ['👥', 'ຜູ້ສະໝັກ', myJobs.reduce((a, j) => a + (j.applicant_count || 0), 0), 'bg-purple-50'], ['⏳', 'ລໍຖ້າ', myJobs.filter(j => j.status === 'pending').length, 'bg-yellow-50']].map(([icon, label, val, bg], i) => (
          <div key={i} className={`${bg} rounded-2xl p-5`}><div className="text-2xl mb-1">{icon}</div><div className="text-2xl font-bold">{val}</div><div className="text-xs text-gray-500">{label}</div></div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        {[['jobs', '📋 ວຽກຂອງຂ້ອຍ'], ['post', '➕ ປະກາດວຽກ'], ['applicants', '👥 ຜູ້ສະໝັກ']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 rounded-xl text-sm font-medium ${tab === k ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{l}</button>
        ))}
      </div>

      {tab === 'jobs' && (
        <div className="bg-white rounded-2xl border overflow-x-auto">
          {myJobs.length === 0 ? <div className="text-center py-16 text-gray-500"><p>ຍັງບໍ່ໄດ້ປະກາດວຽກ</p></div> : (
            <table className="w-full text-sm"><thead className="bg-gray-50"><tr>{['ຊື່ວຽກ', 'ໝວດໝູ່', 'ສະຖານະ', 'ຜູ້ສະໝັກ', ''].map(h => <th key={h} className="text-left px-5 py-3 font-semibold text-gray-600">{h}</th>)}</tr></thead>
              <tbody>{myJobs.map(j => (
                <tr key={j.id} className="border-t hover:bg-blue-50">
                  <td className="px-5 py-3 font-medium">{j.title}</td>
                  <td className="px-5 py-3 text-gray-500">{j.category_name || '-'}</td>
                  <td className="px-5 py-3"><span className={`px-2 py-1 rounded-full text-xs ${statusColor[j.status] || 'bg-gray-100'}`}>{statusLabel[j.status] || j.status}</span></td>
                  <td className="px-5 py-3">{j.applicant_count || 0} ຄົນ</td>
                  <td className="px-5 py-3"><button onClick={() => loadApplicants(j.id)} className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200">👁️ ເບິ່ງ</button></td>
                </tr>
              ))}</tbody></table>
          )}
        </div>
      )}

      {tab === 'post' && (
        <form onSubmit={handlePostJob} className="bg-white rounded-2xl p-6 border">
          <h3 className="font-bold text-lg mb-4">ປະກາດວຽກໃໝ່</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="text-sm text-gray-600 mb-1 block">ຊື່ຕຳແໜ່ງ *</label><input name="title" value={jobForm.title} onChange={h} required className="w-full px-4 py-2.5 border rounded-xl text-sm outline-none focus:border-blue-400" /></div>
            <div><label className="text-sm text-gray-600 mb-1 block">ໝວດໝູ່</label><select name="category_id" value={jobForm.category_id} onChange={h} className="w-full px-4 py-2.5 border rounded-xl text-sm outline-none"><option value="">ເລືອກໝວດໝູ່</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div><label className="text-sm text-gray-600 mb-1 block">ເງິນ (ຕ່ຳສຸດ)</label><input name="salary_min" type="number" value={jobForm.salary_min} onChange={h} className="w-full px-4 py-2.5 border rounded-xl text-sm outline-none" /></div>
            <div><label className="text-sm text-gray-600 mb-1 block">ເງິນ (ສູງສຸດ)</label><input name="salary_max" type="number" value={jobForm.salary_max} onChange={h} className="w-full px-4 py-2.5 border rounded-xl text-sm outline-none" /></div>
            <div><label className="text-sm text-gray-600 mb-1 block">ສະຖານທີ່ *</label><input name="location" value={jobForm.location} onChange={h} required className="w-full px-4 py-2.5 border rounded-xl text-sm outline-none" placeholder="ວຽງຈັນ" /></div>
            <div><label className="text-sm text-gray-600 mb-1 block">ເວລາ</label><input name="work_hours" value={jobForm.work_hours} onChange={h} className="w-full px-4 py-2.5 border rounded-xl text-sm outline-none" placeholder="09:00-17:00" /></div>
            <div className="md:col-span-2"><label className="text-sm text-gray-600 mb-1 block">ລາຍລະອຽດ *</label><textarea name="description" value={jobForm.description} onChange={h} required rows={4} className="w-full px-4 py-2.5 border rounded-xl text-sm outline-none resize-none" /></div>
            <div className="md:col-span-2"><label className="text-sm text-gray-600 mb-1 block">ຄຸນສົມບັດ</label><textarea name="requirements" value={jobForm.requirements} onChange={h} rows={3} className="w-full px-4 py-2.5 border rounded-xl text-sm outline-none resize-none" /></div>
          </div>
          <button type="submit" disabled={posting} className="mt-4 bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-800 disabled:opacity-50">{posting ? 'ກຳລັງປະກາດ...' : '📤 ປະກາດວຽກ'}</button>
        </form>
      )}

      {tab === 'applicants' && (
        <div className="bg-white rounded-2xl border overflow-x-auto">
          {applicants.length === 0 ? <div className="text-center py-16 text-gray-500">ຍັງບໍ່ມີຜູ້ສະໝັກ</div> : (
            <table className="w-full text-sm"><thead className="bg-gray-50"><tr>{['ຊື່', 'ອີເມວ', 'ໂທ', 'ສະຖານະ', 'ຈັດການ'].map(h => <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600">{h}</th>)}</tr></thead>
              <tbody>{applicants.map(a => (
                <tr key={a.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{a.name}</td>
                  <td className="px-4 py-3 text-gray-500">{a.email}</td>
                  <td className="px-4 py-3 text-gray-500">{a.phone || '-'}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs ${statusColor[a.status] || ''}`}>{statusLabel[a.status] || a.status}</span></td>
                  <td className="px-4 py-3"><div className="flex gap-2"><button onClick={() => updateAppStatus(a.id, 'accepted')} className="text-xs bg-green-600 text-white px-3 py-1 rounded-lg">ຮັບ</button><button onClick={() => updateAppStatus(a.id, 'rejected')} className="text-xs bg-red-600 text-white px-3 py-1 rounded-lg">ປະຕິເສດ</button></div></td>
                </tr>
              ))}</tbody></table>
          )}
        </div>
      )}
    </div>
  );
}