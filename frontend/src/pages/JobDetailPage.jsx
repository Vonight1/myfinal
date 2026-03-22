import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { jobsAPI, applicationsAPI, reviewsAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { formatSalary } from '../lib/utils';

export default function JobDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
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

  useEffect(() => {
    jobsAPI.getJobById(id).then(r => { if (r.data.success) setJob(r.data.data); }).finally(() => setLoading(false));
    reviewsAPI.getJobReviews(id).then(r => { if (r.data.success) setReviews(r.data.data || []); }).catch(() => {});
  }, [id]);

  const handleApply = async () => {
    if (!user) { navigate('/login'); return; }
    setApplying(true); setMsg({ type: '', text: '' });
    try {
      const res = await applicationsAPI.applyJob(id, { cover_letter: coverLetter });
      if (res.data.success) { setApplied(true); setShowApplyForm(false); setMsg({ type: 'success', text: 'ສະໝັກວຽກສຳເລັດ!' }); }
    } catch (err) { setMsg({ type: 'error', text: err.response?.data?.message || 'ບໍ່ສາມາດສະໝັກໄດ້' }); }
    finally { setApplying(false); }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    try {
      const res = await reviewsAPI.createReview(id, { rating, comment });
      if (res.data.success) { setComment(''); reviewsAPI.getJobReviews(id).then(r => { if (r.data.success) setReviews(r.data.data || []); }); }
    } catch (err) { setMsg({ type: 'error', text: err.response?.data?.message || 'ບໍ່ສາມາດສົ່ງ review ໄດ້' }); }
  };

  if (loading) return <div className="flex justify-center py-32"><div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;
  if (!job) return <div className="text-center py-32"><div className="text-5xl mb-4">😔</div><h2 className="text-xl font-bold">ບໍ່ພົບວຽກ</h2><Link to="/jobs" className="text-blue-600 mt-4 inline-block">← ກັບຄືນ</Link></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/jobs" className="text-blue-600 text-sm mb-4 inline-block hover:underline">← ກັບຄືນ</Link>
      {msg.text && <div className={`mb-4 px-4 py-3 rounded-xl text-sm ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{msg.text}</div>}

      <div className="bg-white rounded-2xl p-6 shadow-sm border mb-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl">💼</div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{job.title}</h1>
            <p className="text-gray-500">{job.company_name}</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">{job.job_type}</span>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">{job.status === 'approved' ? 'ກຳລັງຮັບ' : job.status}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[[' ເງິນເດືອນ', formatSalary(job.salary_min, job.salary_max, job.salary_type)], [' ສະຖານທີ່', job.location], [' ເວລາ', job.work_hours || '-'], [' ວັນ', job.work_days || '-'], [' ຮັບ', `${job.positions} ຕຳແໜ່ງ`], [' ເບິ່ງ', `${job.views_count} ຄັ້ງ`]].map(([l, v], i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-3"><div className="text-xs text-gray-500">{l}</div><div className="font-semibold text-sm mt-1">{v}</div></div>
          ))}
        </div>

        <div className="mb-6">
          <h3 className="font-bold mb-2">📋 ລາຍລະອຽດ</h3>
          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{job.description}</p>
        </div>
        {job.requirements && <div className="mb-6"><h3 className="font-bold mb-2">✅ ຄຸນສົມບັດ</h3><p className="text-gray-600 text-sm whitespace-pre-line">{job.requirements}</p></div>}

        <div className="border-t pt-4">
          {user?.role === 'applicant' ? (
            applied ? <div className="bg-green-100 text-green-700 px-6 py-3 rounded-xl font-semibold text-sm inline-block">✅ ສະໝັກແລ້ວ</div> :
            showApplyForm ? (
              <div className="space-y-3">
                <textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="ຂຽນຂໍ້ຄວາມເຖິງນາຍຈ້າງ (ບໍ່ບັງຄັບ)..." rows={4} className="w-full px-4 py-3 border rounded-xl text-sm outline-none resize-none" />
                <div className="flex gap-3">
                  <button onClick={handleApply} disabled={applying} className="bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-800 disabled:opacity-50">{applying ? 'ກຳລັງສົ່ງ...' : '📤 ຢືນຢັນສະໝັກ'}</button>
                  <button onClick={() => setShowApplyForm(false)} className="px-6 py-2.5 rounded-xl border text-sm hover:bg-gray-50">ຍົກເລີກ</button>
                </div>
              </div>
            ) : <button onClick={() => setShowApplyForm(true)} className="bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-800"> ສະໝັກວຽກນີ້</button>
          ) : !user ? <Link to="/login" className="inline-block bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-800">ເຂົ້າສູ່ລະບົບເພື່ອສະໝັກ</Link> : null}
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <h3 className="font-bold text-lg mb-4">⭐ Reviews ({reviews.length})</h3>
        {reviews.length > 0 ? (
          <div className="space-y-3 mb-6">{reviews.map((r) => (
            <div key={r.id} className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1"><span className="font-medium text-sm">{r.user_name}</span><span className="text-yellow-500 text-sm">{'⭐'.repeat(r.rating)}</span></div>
              {r.comment && <p className="text-gray-600 text-sm">{r.comment}</p>}
            </div>
          ))}</div>
        ) : <p className="text-gray-500 text-sm mb-6">ຍັງບໍ່ມີ review</p>}
        {user && (
          <form onSubmit={handleReview} className="border-t pt-4">
            <h4 className="font-semibold text-sm mb-3">ຂຽນ Review</h4>
            <div className="flex gap-1 mb-3">{[1,2,3,4,5].map((s) => <button key={s} type="button" onClick={() => setRating(s)} className={`text-2xl ${s <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>)}</div>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="ຄຳຄິດເຫັນ..." rows={2} className="w-full px-4 py-2 border rounded-xl text-sm outline-none mb-3 resize-none" />
            <button type="submit" className="bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-800">ສົ່ງ Review</button>
          </form>
        )}
      </div>
    </div>
  );
}