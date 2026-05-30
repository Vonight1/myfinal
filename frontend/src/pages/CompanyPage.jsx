import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jobsAPI, applicationsAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import { statusColor, statusLabel } from '../lib/utils';

export default function CompanyPage() {
 const { user, loading: authLoading } = useAuth();
 const navigate = useNavigate();
 const toast = useToast();
 const confirm = useConfirm();
 const [tab, setTab] = useState('jobs');
 const [editingJob, setEditingJob] = useState(null);
 const [myJobs, setMyJobs] = useState([]);
 const [categories, setCategories] = useState([]);
 const [applicants, setApplicants] = useState([]);
 const [selectedJobId, setSelectedJobId] = useState(null);
 const [loading, setLoading] = useState(true);
 const [posting, setPosting] = useState(false);
 const [msg, setMsg] = useState('');

 // ===== Modal State =====
 const [showModal, setShowModal] = useState(false);
 const [jobForm, setJobForm] = useState({
 title: '', description: '', requirements: '', category_id: '',
 salary_min: '', salary_max: '', salary_type: 'monthly',
 location: '', job_type: 'part-time', work_days: '', work_hours: '',
 positions: 1, deadline: '',
 });

 useEffect(() => {
 if (!authLoading && (!user || user.role !== 'company')) { navigate('/login'); return; }
 if (user) {
 jobsAPI.getMyJobs().then(r => { if (r.data.success) setMyJobs(r.data.data || []); }).finally(() => setLoading(false));
 jobsAPI.getCategories().then(r => { if (r.data.success) setCategories(r.data.data || []); });
 }
 }, [user, authLoading]);

 const loadApplicants = async (jobId) => {
 setSelectedJobId(jobId);
 setTab('applicants');
 const res = await applicationsAPI.getJobApplicants(jobId);
 if (res.data.success) setApplicants(res.data.data || []);
 };

 const handlePostJob = async (e) => {
 e.preventDefault();
 setPosting(true);
 try {
 const payload = {
 ...jobForm,
 category_id: jobForm.category_id ? Number(jobForm.category_id) : null,
 salary_min: jobForm.salary_min ? Number(jobForm.salary_min) : null,
 salary_max: jobForm.salary_max ? Number(jobForm.salary_max) : null,
 positions: Number(jobForm.positions) || 1,
 };
 // ຖ້າ editing → update, ຖ້າບໍ່ → create
 const res = editingJob
 ? await jobsAPI.updateJob(editingJob.id, payload)
 : await jobsAPI.createJob(payload);
 if (res.data.success) {
 toast.success(editingJob ? 'ແກ້ໄຂສຳເລັດ!' : 'ປະກາດວຽກສຳເລັດ! ລໍຖ້າ Admin ອະນຸມັດ.');
 setShowModal(false);
 setEditingJob(null);
 resetForm();
 jobsAPI.getMyJobs().then(r => { if (r.data.success) setMyJobs(r.data.data || []); });
 }
 } catch (err) {
 toast.error(err.response?.data?.message || 'ບໍ່ສາມາດປະກາດໄດ້');
 } finally {
 setPosting(false);
 }
 };

 const openEditJob = (job) => {
 setEditingJob(job);
 setJobForm({
 title: job.title || '',
 description: job.description || '',
 requirements: job.requirements || '',
 category_id: job.category_id || '',
 salary_min: job.salary_min || '',
 salary_max: job.salary_max || '',
 salary_type: job.salary_type || 'monthly',
 location: job.location || '',
 job_type: job.job_type || 'part-time',
 work_days: job.work_days || '',
 work_hours: job.work_hours || '',
 positions: job.positions || 1,
 deadline: job.deadline || '',
 });
 setShowModal(true);
 };

 const handleDeleteJob = async (job) => {
 const ok = await confirm({
 title: 'ລົບວຽກນີ້?',
 message: `ທ່ານແນ່ໃຈບໍ່ວ່າຈະລົບ "${job.title}"? ການກະທຳນີ້ບໍ່ສາມາດກັບຄືນໄດ້ (ການສະໝັກ, reviews ກໍ່ຈະຖືກລົບ)`,
 confirmText: 'ລົບເລີຍ',
 cancelText: 'ຍົກເລີກ',
 variant: 'danger',
 });
 if (!ok) return;
 try {
 const res = await jobsAPI.deleteJob(job.id);
 if (res.data.success) {
 toast.success('ລົບວຽກສຳເລັດ');
 jobsAPI.getMyJobs().then(r => { if (r.data.success) setMyJobs(r.data.data || []); });
 }
 } catch (err) {
 toast.error(err.response?.data?.message || 'ບໍ່ສາມາດລົບໄດ້');
 }
 };

 const resetForm = () => {
 setJobForm({
 title: '', description: '', requirements: '', category_id: '',
 salary_min: '', salary_max: '', salary_type: 'monthly',
 location: '', job_type: 'part-time', work_days: '', work_hours: '',
 positions: 1, deadline: '',
 });
 };

 const updateAppStatus = async (appId, status) => {
 await applicationsAPI.updateStatus(appId, status);
 loadApplicants(selectedJobId);
 };

 const h = (e) => setJobForm({ ...jobForm, [e.target.name]: e.target.value });

 if (authLoading || loading) return <div className="flex justify-center py-32"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;

 return (
 <div className="max-w-6xl mx-auto px-4 py-8">
 {/* Header */}
 <div className="flex items-center justify-between mb-6">
 <h1 className="text-2xl font-bold"> Dashboard ບໍລິສັດ</h1>
 <button
 onClick={() => { resetForm(); setShowModal(true); }}
 className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all"
 >
 + ປະກາດວຽກໃໝ່
 </button>
 </div>

 {msg && (
 <div className="mb-4 px-4 py-3 rounded-xl text-sm bg-green-50 text-green-700 border border-green-200">
 {msg}
 </div>
 )}

 {/* Stats */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
 {[
 ['', 'ວຽກທັງໝົດ', myJobs.length, 'bg-blue-50'],
 ['', 'ອະນຸມັດ', myJobs.filter(j => j.status === 'approved').length, 'bg-green-50'],
 ['', 'ຜູ້ສະໝັກ', myJobs.reduce((a, j) => a + (j.applicant_count || 0), 0), 'bg-purple-50'],
 ['', 'ລໍຖ້າ', myJobs.filter(j => j.status === 'pending').length, 'bg-yellow-50'],
 ].map(([icon, label, val, bg], i) => (
 <div key={i} className={`${bg} rounded-2xl p-5`}>
 <div className="text-2xl mb-1">{icon}</div>
 <div className="text-2xl font-bold">{val}</div>
 <div className="text-xs text-gray-500">{label}</div>
 </div>
 ))}
 </div>

 {/* Tabs (ມີແຕ່ 2 tab) */}
 <div className="flex gap-2 mb-4">
 {[['jobs', ' ວຽກຂອງຂ້ອຍ'], ['applicants', ' ຜູ້ສະໝັກ']].map(([k, l]) => (
 <button key={k} onClick={() => setTab(k)}
 className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === k ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
 {l}
 </button>
 ))}
 </div>

 {/* Jobs Tab */}
 {tab === 'jobs' && (
 <div className="bg-white rounded-2xl border overflow-x-auto">
 {myJobs.length === 0 ? (
 <div className="text-center py-16 text-gray-500">
 <div className="text-4xl mb-3"></div>
 <p>ຍັງບໍ່ໄດ້ປະກາດວຽກ</p>
 <button onClick={() => setShowModal(true)} className="mt-3 text-blue-600 font-semibold hover:underline">
 ປະກາດວຽກທຳອິດ →
 </button>
 </div>
 ) : (
 <table className="w-full text-sm">
 <thead className="bg-gray-50">
 <tr>
 {['ຊື່ວຽກ', 'ໝວດໝູ່', 'ສະຖານະ', 'ຜູ້ສະໝັກ', ''].map(h => (
 <th key={h} className="text-left px-5 py-3 font-semibold text-gray-600">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {myJobs.map(j => (
 <tr key={j.id} className="border-t hover:bg-blue-50">
 <td className="px-5 py-3 font-medium">{j.title}</td>
 <td className="px-5 py-3 text-gray-500">{j.category_name || '-'}</td>
 <td className="px-5 py-3">
 <span className={`px-2 py-1 rounded-full text-xs ${statusColor[j.status] || 'bg-gray-100'}`}>
 {statusLabel[j.status] || j.status}
 </span>
 </td>
 <td className="px-5 py-3">{j.applicant_count || 0} ຄົນ</td>
 <td className="px-5 py-3">
 <div className="flex gap-1.5">
 <button onClick={() => loadApplicants(j.id)}
 className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200 font-medium" title="ເບິ່ງຜູ້ສະໝັກ">
 ເບິ່ງ
 </button>
 <button onClick={() => openEditJob(j)}
 className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-lg hover:bg-yellow-200 font-medium" title="ແກ້ໄຂວຽກ">
 ແກ້ໄຂ
 </button>
 <button onClick={() => handleDeleteJob(j)}
 className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200 font-medium" title="ລົບວຽກ">
 ລົບ
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 )}
 </div>
 )}

 {/* Applicants Tab */}
 {tab === 'applicants' && (
 <div>
 {applicants.length === 0 ? (
 <div className="bg-white rounded-2xl border text-center py-16 text-gray-500">
 <div className="text-4xl mb-3"></div>
 <p>ກະລຸນາເລືອກວຽກຈາກ tab "ວຽກຂອງຂ້ອຍ" ເພື່ອເບິ່ງຜູ້ສະໝັກ</p>
 </div>
 ) : (
 <div className="space-y-4">
 {applicants.map(a => (
 <div key={a.id} className="bg-white rounded-2xl border p-5 hover:shadow-md transition-all">
 <div className="flex items-start gap-4">
 <Link to={`/users/${a.applicant_id || a.id}`} className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0 hover:ring-4 hover:ring-blue-100 transition-all">
 {a.name?.[0]}
 </Link>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-3 mb-1">
 <Link to={`/users/${a.applicant_id || a.id}`} className="font-bold text-gray-800 hover:text-blue-600 hover:underline">{a.name}</Link>
 <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[a.status] || 'bg-gray-100'}`}>
 {statusLabel[a.status] || a.status}
 </span>
 </div>
 <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
 <span> {a.email}</span>
 <span> {a.phone || '-'}</span>
 {a.education && <span> {a.education}</span>}
 </div>
 {a.skills && <p className="text-xs text-gray-400 mt-1"> {a.skills}</p>}
 {a.cover_letter && (
 <div className="mt-3 bg-gray-50 rounded-xl p-3">
 <p className="text-xs font-semibold text-gray-600 mb-1"> ຂໍ້ຄວາມ:</p>
 <p className="text-sm text-gray-600">{a.cover_letter}</p>
 </div>
 )}
 {a.resume_file ? (
 <div className="mt-3 border border-blue-200 bg-blue-50 rounded-xl p-3">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-xl border shadow-sm">
 {a.resume_file.endsWith('.pdf') ? '' : a.resume_file.match(/\.docx?$/i) ? '' : a.resume_file.match(/\.(jpg|jpeg|png)$/i) ? '' : ''}
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-semibold text-blue-800">CV / Resume</p>
 <p className="text-xs text-blue-600 truncate">{a.resume_file.split('/').pop()}</p>
 </div>
 <div className="flex gap-2 shrink-0">
 <a href={`http://localhost:8080${a.resume_file}`} target="_blank" rel="noopener noreferrer"
 className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 font-medium">
 ເບິ່ງ
 </a>
 <a href={`http://localhost:8080${a.resume_file}`} download
 className="text-xs bg-white text-blue-700 border border-blue-300 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-medium">
 ໂຫຼດ
 </a>
 </div>
 </div>
 </div>
 ) : (
 <div className="mt-3 bg-gray-50 rounded-xl p-3 text-center">
 <p className="text-xs text-gray-400"> ບໍ່ໄດ້ແນບ CV / Resume</p>
 </div>
 )}
 </div>
 <div className="flex flex-col gap-2 shrink-0">
 {a.status === 'pending' ? (
 <>
 <button onClick={() => updateAppStatus(a.id, 'accepted')} className="text-xs bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium"> ຮັບ</button>
 <button onClick={() => updateAppStatus(a.id, 'rejected')} className="text-xs bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium"> ປະຕິເສດ</button>
 </>
 ) : (
 <div className={`text-xs font-bold px-4 py-2 rounded-lg text-center ${
 a.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
 }`}>
 {a.status === 'accepted' ? ' ຮັບແລ້ວ' : ' ປະຕິເສດແລ້ວ'}
 </div>
 )}
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 )}

 {/* ===== Modal ປະກາດວຽກ ===== */}
 {showModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 {/* Backdrop */}
 <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />

 {/* Modal Content */}
 <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
 {/* Header */}
 <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
 <h3 className="font-bold text-xl text-gray-800">
 {editingJob ? 'ແກ້ໄຂວຽກ' : 'ປະກາດວຽກໃໝ່'}
 </h3>
 <button onClick={() => { setShowModal(false); setEditingJob(null); }}
 className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 text-gray-500"
 aria-label="ປິດ">
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 18L18 6M6 6l12 12"/></svg>
 </button>
 </div>

 {/* Form */}
 <form onSubmit={handlePostJob} className="p-6">
 <div className="grid md:grid-cols-2 gap-4">
 <div>
 <label className="text-sm font-semibold text-gray-700 block mb-1.5">ຊື່ຕຳແໜ່ງ <span className="text-red-500">*</span></label>
 <input name="title" value={jobForm.title} onChange={h} required placeholder="ເຊັ່ນ: ພະນັກງານຮ້ານກາເຟ"
 className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
 </div>
 <div>
 <label className="text-sm font-semibold text-gray-700 block mb-1.5">ໝວດໝູ່</label>
 <select name="category_id" value={jobForm.category_id} onChange={h}
 className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500">
 <option value="">ເລືອກໝວດໝູ່</option>
 {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
 </select>
 </div>
 <div>
 <label className="text-sm font-semibold text-gray-700 block mb-1.5">ເງິນ (ຕ່ຳສຸດ)</label>
 <input name="salary_min" type="number" value={jobForm.salary_min} onChange={h} placeholder="0"
 className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500" />
 </div>
 <div>
 <label className="text-sm font-semibold text-gray-700 block mb-1.5">ເງິນ (ສູງສຸດ)</label>
 <input name="salary_max" type="number" value={jobForm.salary_max} onChange={h} placeholder="0"
 className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500" />
 </div>
 <div>
 <label className="text-sm font-semibold text-gray-700 block mb-1.5">ປະເພດເງິນ</label>
 <select name="salary_type" value={jobForm.salary_type} onChange={h}
 className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500">
 <option value="monthly">ລາຍເດືອນ</option>
 <option value="daily">ລາຍວັນ</option>
 <option value="hourly">ລາຍຊົ່ວໂມງ</option>
 <option value="negotiable">ຕາມຕົກລົງ</option>
 </select>
 </div>
 <div>
 <label className="text-sm font-semibold text-gray-700 block mb-1.5">ສະຖານທີ່ <span className="text-red-500">*</span></label>
 <input name="location" value={jobForm.location} onChange={h} required placeholder="ນະຄອນຫຼວງວຽງຈັນ"
 className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500" />
 </div>
 <div>
 <label className="text-sm font-semibold text-gray-700 block mb-1.5">ເວລາເຮັດວຽກ</label>
 <input name="work_hours" value={jobForm.work_hours} onChange={h} placeholder="09:00-17:00"
 className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500" />
 </div>
 <div>
 <label className="text-sm font-semibold text-gray-700 block mb-1.5">ວັນເຮັດວຽກ</label>
 <input name="work_days" value={jobForm.work_days} onChange={h} placeholder="ຈັນ-ສຸກ"
 className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500" />
 </div>
 <div>
 <label className="text-sm font-semibold text-gray-700 block mb-1.5">ຈຳນວນຮັບ</label>
 <input name="positions" type="number" value={jobForm.positions} onChange={h} min="1"
 className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500" />
 </div>
 <div className="md:col-span-2">
 <label className="text-sm font-semibold text-gray-700 block mb-1.5">ລາຍລະອຽດ <span className="text-red-500">*</span></label>
 <textarea name="description" value={jobForm.description} onChange={h} required rows={4} placeholder="ອະທິບາຍກ່ຽວກັບໜ້າວຽກ..."
 className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 resize-none" />
 </div>
 <div className="md:col-span-2">
 <label className="text-sm font-semibold text-gray-700 block mb-1.5">ຄຸນສົມບັດທີ່ຕ້ອງການ</label>
 <textarea name="requirements" value={jobForm.requirements} onChange={h} rows={3} placeholder="ຄຸນສົມບັດ, ປະສົບການ..."
 className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 resize-none" />
 </div>
 </div>

 {/* Footer Buttons */}
 <div className="flex gap-3 mt-6 pt-4 border-t">
 <button type="submit" disabled={posting}
 className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2">
 {posting ? (
 <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> ກຳລັງບັນທຶກ...</>
 ) : (
 <>{editingJob ? 'ບັນທຶກການແກ້ໄຂ' : 'ປະກາດວຽກ'}</>
 )}
 </button>
 <button type="button" onClick={() => { setShowModal(false); setEditingJob(null); }}
 className="px-6 py-3 rounded-xl border border-gray-200 text-sm hover:bg-gray-50 font-medium transition-all">
 ຍົກເລີກ
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 );
}