import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { jobsAPI, applicationsAPI, reviewsAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { formatSalary, getFullUrl } from '../lib/utils';
import CompanyAvatar from '../components/CompanyAvatar';
import SaveJobButton from '../components/SaveJobButton';
import ShareButton from '../components/ShareButton';
import { useToast } from '../context/ToastContext';

const defaultCover = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80';

export default function JobDetailPage() {
 const { id } = useParams();
 const { user } = useAuth();
 const navigate = useNavigate();
 const toast = useToast();
 const fileInputRef = useRef(null);

 const [job, setJob] = useState(null);
 const [reviews, setReviews] = useState([]);
 const [loading, setLoading] = useState(true);
 const [applying, setApplying] = useState(false);
 const [applied, setApplied] = useState(false);
 const [coverLetter, setCoverLetter] = useState('');
 const [showApplyForm, setShowApplyForm] = useState(false);
 const [msg, setMsg] = useState({ type: '', text: '' });
 const [rating, setRating] = useState(5);
 const [comment, setComment] = useState('');

 // ===== File Upload State =====
 const [resumeFile, setResumeFile] = useState(null);
 const [fileError, setFileError] = useState('');

 useEffect(() => {
 jobsAPI.getJobById(id).then(r => { if (r.data.success) setJob(r.data.data); }).finally(() => setLoading(false));
 reviewsAPI.getJobReviews(id).then(r => { if (r.data.success) setReviews(r.data.data || []); }).catch(() => {});
 }, [id]);

 // ===== Handle File Select =====
 const handleFileChange = (e) => {
 const file = e.target.files[0];
 setFileError('');

 if (!file) {
 setResumeFile(null);
 return;
 }

 // ກວດສອບປະເພດໄຟລ໌
 const allowedTypes = [
 'application/pdf',
 'application/msword',
 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
 'image/jpeg',
 'image/png',
 ];
 if (!allowedTypes.includes(file.type)) {
 setFileError('ຮອງຮັບສະເພາະໄຟລ໌ PDF, DOC, DOCX, JPG, PNG ເທົ່ານັ້ນ');
 setResumeFile(null);
 e.target.value = '';
 return;
 }

 // ກວດສອບຂະໜາດ (ສູງສຸດ 10MB)
 const maxSize = 10 * 1024 * 1024;
 if (file.size > maxSize) {
 setFileError('ໄຟລ໌ໃຫຍ່ເກີນໄປ (ສູງສຸດ 10MB)');
 setResumeFile(null);
 e.target.value = '';
 return;
 }

 setResumeFile(file);
 };

 // ===== Remove File =====
 const removeFile = () => {
 setResumeFile(null);
 setFileError('');
 if (fileInputRef.current) fileInputRef.current.value = '';
 };

 // ===== Format File Size =====
 const formatFileSize = (bytes) => {
 if (bytes < 1024) return bytes + ' B';
 if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
 return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
 };

 // ===== Get File Icon =====
 const getFileIcon = (type) => {
 if (type === 'application/pdf') return '';
 if (type?.includes('word')) return '';
 if (type?.includes('image')) return '';
 return '';
 };

 // ===== Handle Apply with File Upload =====
 const handleApply = async () => {
 if (!user) { navigate('/login'); return; }
 setApplying(true);
 setMsg({ type: '', text: '' });

 try {
 // ສ້າງ FormData ເພື່ອສົ່ງໄຟລ໌
 const formData = new FormData();
 if (coverLetter) formData.append('cover_letter', coverLetter);
 if (resumeFile) formData.append('resume_file', resumeFile);

 const res = await applicationsAPI.applyJob(id, formData);
 if (res.data.success) {
 setApplied(true);
 setShowApplyForm(false);
 setMsg({ type: 'success', text: 'ສະໝັກວຽກສຳເລັດ! ບໍລິສັດຈະຕິດຕໍ່ກັບທ່ານ.' });
 }
 } catch (err) {
 setMsg({ type: 'error', text: err.response?.data?.message || 'ບໍ່ສາມາດສະໝັກໄດ້' });
 } finally {
 setApplying(false);
 }
 };

 const handleReview = async (e) => {
 e.preventDefault();
 if (!user) { navigate('/login'); return; }
 try {
 const res = await reviewsAPI.createReview(id, { rating, comment });
 if (res.data.success) {
 setComment('');
 reviewsAPI.getJobReviews(id).then(r => { if (r.data.success) setReviews(r.data.data || []); });
 }
 } catch (err) {
 setMsg({ type: 'error', text: err.response?.data?.message || 'ບໍ່ສາມາດສົ່ງ review ໄດ້' });
 }
 };

 if (loading) return <div className="flex justify-center py-32"><div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;
 if (!job) return <div className="text-center py-32"><div className="text-5xl mb-4"></div><h2 className="text-xl font-bold">ບໍ່ພົບວຽກ</h2><Link to="/jobs" className="text-blue-600 mt-4 inline-block">← ກັບຄືນ</Link></div>;

 return (
 <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
 <Link to="/jobs" className="text-blue-600 text-sm mb-4 inline-block hover:underline">← ກັບຄືນ</Link>

 {msg.text && (
 <div className={`mb-4 px-4 py-3 rounded-xl text-sm ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
 {msg.type === 'success' ? '' : ''} {msg.text}
 </div>
 )}

 {/* Job Detail Card */}
 <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
 {/* Cover Image - ສະອາດ ບໍ່ມີ logo ບັງ */}
 <div className="relative h-48 md:h-64 bg-gradient-to-br from-blue-400 to-indigo-600 overflow-hidden">
 <img
 src={job.company_cover ? getFullUrl(job.company_cover) : defaultCover}
 alt={job.company_name}
 loading="lazy"
 className="w-full h-full object-cover"
 onError={(e) => { e.target.src = defaultCover; }}
 />
 </div>

 {/* Logo Card + Stats Row */}
 <div className="relative px-6 -mt-10 flex items-end justify-between gap-3 flex-wrap">
 <Link to={`/users/${job.company_id}`} className="w-20 h-20 bg-white rounded-2xl shadow-md border border-gray-100 p-2 shrink-0 hover:border-blue-300 hover:shadow-lg transition-all" title="ເບິ່ງ profile ບໍລິສັດ">
 <CompanyAvatar
 logo={job.company_logo}
 name={job.company_name}
 size="sm"
 className="!w-full !h-full !rounded-xl shadow-none"
 />
 </Link>
 <div className="flex items-center gap-3 pb-2">
 <div className="flex items-center gap-3 text-xs text-gray-500">
 <span className="flex items-center gap-1">
 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
 {job.views_count} ຄັ້ງ
 </span>
 <span>•</span>
 <span><span className="font-semibold text-gray-700">{job.applicant_count || 0}</span> ສະໝັກແລ້ວ</span>
 </div>
 <SaveJobButton jobId={job.id} variant="button" />
 <ShareButton url={`/jobs/${job.id}`} title={job.title} />
 </div>
 </div>

 {/* Content */}
 <div className="px-6 pt-4 pb-6">
 {/* Title + Company + Tags */}
 <div className="mb-6">
 <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{job.title}</h1>
 <Link to={`/users/${job.company_id}`} className="text-gray-500 mt-1 flex items-center gap-2 hover:text-blue-600 w-fit group/link">
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16M9 7h6M9 11h6M9 15h6"/></svg>
 <span className="group-hover/link:underline">{job.company_name}</span>
 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-0 group-hover/link:opacity-100 transition-opacity"><path d="M7 17L17 7M7 7h10v10"/></svg>
 </Link>
 <div className="flex gap-2 mt-3 flex-wrap">
 <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold border border-blue-100">{job.job_type}</span>
 <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-semibold border border-green-100">
 {job.status === 'approved' ? 'ກຳລັງຮັບສະໝັກ' : job.status}
 </span>
 {job.category_name && (
 <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold border border-purple-100">{job.category_name}</span>
 )}
 </div>
 </div>

 {/* Info Grid */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
 {[
 ['ເງິນເດືອນ', formatSalary(job.salary_min, job.salary_max, job.salary_type), 'text-blue-700'],
 ['ສະຖານທີ່', job.location, 'text-gray-800'],
 ['ເວລາ', job.work_hours || '-', 'text-gray-800'],
 ['ວັນ', job.work_days || '-', 'text-gray-800'],
 ['ຮັບ', `${job.positions} ຕຳແໜ່ງ`, 'text-gray-800'],
 ].map(([l, v, color], i) => (
 <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
 <div className="text-[10px] text-gray-500 uppercase tracking-wide">{l}</div>
 <div className={`font-bold text-sm mt-1 ${color}`}>{v}</div>
 </div>
 ))}
 </div>

 {/* Description */}
 <div className="mb-6">
 <h3 className="font-bold text-gray-800 mb-2 text-base">ລາຍລະອຽດ</h3>
 <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{job.description}</p>
 </div>
 {job.requirements && (
 <div className="mb-6">
 <h3 className="font-bold text-gray-800 mb-2 text-base">ຄຸນສົມບັດ</h3>
 <p className="text-gray-600 text-sm whitespace-pre-line leading-relaxed">{job.requirements}</p>
 </div>
 )}

 {/* ===== Apply Section ===== */}
 <div className="border-t pt-6">
 {user?.role === 'applicant' ? (
 applied ? (
 <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl font-semibold text-sm">
 ທ່ານໄດ້ສະໝັກວຽກນີ້ແລ້ວ
 </div>
 ) : showApplyForm ? (
 <div className="space-y-5">
 <h3 className="font-bold text-lg text-gray-800"> ສະໝັກວຽກ</h3>

 {/* ===== CV / Resume Upload ===== */}
 <div>
 <label className="text-sm font-semibold text-gray-700 block mb-2">
 ອັບໂຫຼດ CV / Resume
 </label>

 {!resumeFile ? (
 // Upload Area
 <div
 onClick={() => fileInputRef.current?.click()}
 className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
 >
 <div className="text-4xl mb-3 group-hover:scale-110 transition-transform"></div>
 <p className="text-sm font-semibold text-gray-700">
 ກົດເພື່ອເລືອກໄຟລ໌ ຫຼື ລາກມາວາງ
 </p>
 <p className="text-xs text-gray-400 mt-2">
 ຮອງຮັບ: PDF, DOC, DOCX, JPG, PNG (ສູງສຸດ 10MB)
 </p>
 </div>
 ) : (
 // File Preview
 <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
 <div className="flex items-center gap-3">
 <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl border shadow-sm">
 {getFileIcon(resumeFile.type)}
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-semibold text-gray-800 truncate">
 {resumeFile.name}
 </p>
 <p className="text-xs text-gray-500 mt-0.5">
 {formatFileSize(resumeFile.size)}
 </p>
 </div>
 <button
 type="button"
 onClick={removeFile}
 className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-200 transition-all text-sm shrink-0"
 >
 
 </button>
 </div>
 {/* Progress bar (ສະແດງວ່າໄຟລ໌ພ້ອມແລ້ວ) */}
 <div className="mt-3 h-1.5 bg-gray-200 rounded-full overflow-hidden">
 <div className="h-full bg-green-500 rounded-full w-full transition-all"></div>
 </div>
 <p className="text-xs text-green-600 mt-1 font-medium"> ພ້ອມສົ່ງ</p>
 </div>
 )}

 {/* Hidden file input */}
 <input
 ref={fileInputRef}
 type="file"
 onChange={handleFileChange}
 accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
 className="hidden"
 />

 {/* File Error */}
 {fileError && (
 <p className="text-red-500 text-xs mt-2"> {fileError}</p>
 )}

 {/* Change file button */}
 {resumeFile && (
 <button
 type="button"
 onClick={() => fileInputRef.current?.click()}
 className="text-xs text-blue-600 font-medium mt-2 hover:underline"
 >
 ປ່ຽນໄຟລ໌
 </button>
 )}
 </div>

 {/* Cover Letter */}
 <div>
 <label className="text-sm font-semibold text-gray-700 block mb-2">
 ຂຽນຂໍ້ຄວາມເຖິງນາຍຈ້າງ <span className="text-gray-400 font-normal">(ບໍ່ບັງຄັບ)</span>
 </label>
 <textarea
 value={coverLetter}
 onChange={(e) => setCoverLetter(e.target.value)}
 placeholder="ແນະນຳຕົວເອງ, ປະສົບການ, ເຫດຜົນທີ່ສົນໃຈວຽກນີ້..."
 rows={4}
 className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none transition-all"
 />
 </div>

 {/* Buttons */}
 <div className="flex gap-3">
 <button
 onClick={handleApply}
 disabled={applying}
 className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2"
 >
 {applying ? (
 <>
 <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
 ກຳລັງສົ່ງ...
 </>
 ) : (
 <> ຢືນຢັນສະໝັກ</>
 )}
 </button>
 <button
 onClick={() => { setShowApplyForm(false); removeFile(); setCoverLetter(''); }}
 className="px-6 py-3 rounded-xl border border-gray-200 text-sm hover:bg-gray-50 font-medium transition-all"
 >
 ຍົກເລີກ
 </button>
 </div>
 </div>
 ) : (
 <button
 onClick={() => setShowApplyForm(true)}
 className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30"
 >
 ສະໝັກວຽກນີ້
 </button>
 )
 ) : !user ? (
 <Link to="/login" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/30">
 ເຂົ້າສູ່ລະບົບເພື່ອສະໝັກ
 </Link>
 ) : null}
 </div>
 </div>
 </div>

 {/* Reviews */}
 <div className="bg-white rounded-2xl p-6 shadow-sm border">
 <h3 className="font-bold text-lg mb-4"> Reviews ({reviews.length})</h3>
 {reviews.length > 0 ? (
 <div className="space-y-3 mb-6">
 {reviews.map((r) => (
 <div key={r.id} className="bg-gray-50 rounded-xl p-4">
 <div className="flex items-center justify-between mb-1">
 <span className="font-medium text-sm">{r.user_name}</span>
 <span className="text-yellow-500 text-sm">{''.repeat(r.rating)}</span>
 </div>
 {r.comment && <p className="text-gray-600 text-sm">{r.comment}</p>}
 </div>
 ))}
 </div>
 ) : (
 <p className="text-gray-500 text-sm mb-6">ຍັງບໍ່ມີ review</p>
 )}
 {user && (
 <form onSubmit={handleReview} className="border-t pt-4">
 <h4 className="font-semibold text-sm mb-3">ຂຽນ Review</h4>
 <div className="flex gap-1 mb-3">
 {[1, 2, 3, 4, 5].map((s) => (
 <button key={s} type="button" onClick={() => setRating(s)}
 className={`text-2xl ${s <= rating ? 'text-yellow-400' : 'text-gray-300'} hover:scale-110 transition-transform`}>
 
 </button>
 ))}
 </div>
 <textarea value={comment} onChange={(e) => setComment(e.target.value)}
 placeholder="ຄຳຄິດເຫັນ..." rows={2}
 className="w-full px-4 py-2 border rounded-xl text-sm outline-none mb-3 resize-none" />
 <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700">
 ສົ່ງ Review
 </button>
 </form>
 )}
 </div>
 </div>
 );
}