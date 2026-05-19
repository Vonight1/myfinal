import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { jobsAPI } from '../lib/api';
import { formatSalary, categoryIcons } from '../lib/utils';

// ===== ຟັງຊັນ ຄິດໄລ່ ມື້ທີ່ຜ່ານມາ =====
function timeAgo(dateStr) {
 const now = new Date();
 const posted = new Date(dateStr);
 const diffMs = now - posted;
 const diffMins = Math.floor(diffMs / (1000 * 60));
 const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
 const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

 if (diffMins < 1) return 'ຫາກໍ່ໂພສ';
 if (diffMins < 60) return `${diffMins} ນາທີກ່ອນ`;
 if (diffHours < 24) return `${diffHours} ຊົ່ວໂມງກ່ອນ`;
 if (diffDays === 1) return 'ມື້ວານນີ້';
 if (diffDays <= 5) return `${diffDays} ມື້ກ່ອນ`;
 return formatDate(dateStr);
}

// ===== ຟັງຊັນ format ວັນທີ =====
function formatDate(dateStr) {
 const d = new Date(dateStr);
 const day = d.getDate().toString().padStart(2, '0');
 const months = ['ມ.ກ.', 'ກ.ພ.', 'ມີ.ນ.', 'ເມ.ສ.', 'ພ.ພ.', 'ມິ.ຖ.', 'ກ.ລ.', 'ສ.ຫ.', 'ກ.ຍ.', 'ຕ.ລ.', 'ພ.ຈ.', 'ທ.ວ.'];
 const month = months[d.getMonth()];
 const year = d.getFullYear();
 return `${day} ${month} ${year}`;
}

export default function NewJobsPage() {
 const [searchParams] = useSearchParams();
 const [jobs, setJobs] = useState([]);
 const [categories, setCategories] = useState([]);
 const [loading, setLoading] = useState(true);
 const [total, setTotal] = useState(0);
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);
 const [search, setSearch] = useState(searchParams.get('search') || '');
 const [categoryId, setCategoryId] = useState('');

 useEffect(() => {
 jobsAPI.getCategories().then(r => { if (r.data.success) setCategories(r.data.data || []); });
 }, []);

 useEffect(() => { loadJobs(); }, [page, categoryId]);

 const loadJobs = async () => {
 setLoading(true);
 try {
 const params = { page, per_page: 10, new_only: 'true' };
 if (search) params.search = search;
 if (categoryId) params.category_id = categoryId;
 const res = await jobsAPI.getJobs(params);
 if (res.data.success) {
 setJobs(res.data.data || []);
 setTotal(res.data.total || 0);
 setTotalPages(res.data.total_pages || 1);
 }
 } catch (err) { console.error(err); }
 finally { setLoading(false); }
 };

 const handleSearch = (e) => { e.preventDefault(); setPage(1); loadJobs(); };

 return (
 <div className="max-w-6xl mx-auto px-4 py-8">
 {/* Header */}
 <div className="flex items-center gap-3 mb-2">
 <Link to="/" className="text-blue-600 text-sm hover:underline">← ໜ້າຫຼັກ</Link>
 </div>
 <div className="flex items-center gap-3 mb-6">
 <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl"></div>
 <div>
 <h1 className="text-2xl font-bold text-gray-800">ວຽກໃໝ່</h1>
 <p className="text-sm text-gray-500">ວຽກທີ່ໂພສພາຍໃນ 5 ມື້ຫຼ້າສຸດ</p>
 </div>
 </div>

 {/* Search & Filter */}
 <form onSubmit={handleSearch} className="bg-white rounded-2xl p-4 shadow-sm border mb-6 flex flex-col md:flex-row gap-3">
 <input value={search} onChange={(e) => setSearch(e.target.value)}
 placeholder="ຄົ້ນຫາວຽກໃໝ່..."
 className="flex-1 px-4 py-2.5 border rounded-xl text-sm outline-none focus:border-blue-400" />
 <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
 className="px-4 py-2.5 border rounded-xl text-sm text-gray-600 outline-none">
 <option value="">ທຸກໝວດໝູ່</option>
 {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
 </select>
 <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 whitespace-nowrap">
 ຄົ້ນຫາ
 </button>
 </form>

 <p className="text-sm text-gray-500 mb-4">ພົບ {total} ວຽກໃໝ່</p>

 {/* Job List */}
 {loading ? (
 <div className="flex justify-center py-20">
 <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
 </div>
 ) : jobs.length === 0 ? (
 <div className="text-center py-20 bg-white rounded-2xl border">
 <div className="text-5xl mb-4"></div>
 <h3 className="text-lg font-semibold text-gray-700">ບໍ່ມີວຽກໃໝ່ໃນ 5 ມື້ນີ້</h3>
 <p className="text-gray-500 text-sm mt-2">ລອງກັບມາກວດເບິ່ງໃໝ່ພາຍຫຼັງ</p>
 <Link to="/jobs" className="inline-block mt-4 text-blue-600 font-semibold hover:underline">
 ເບິ່ງວຽກທັງໝົດ →
 </Link>
 </div>
 ) : (
 <div className="space-y-3">
 {jobs.map((job) => (
 <Link key={job.id} to={`/jobs/${job.id}`}
 className="block bg-white rounded-2xl p-5 border hover:shadow-lg transition-all group">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-xl font-bold text-white shrink-0">
 {job.company_name?.[0] || 'C'}
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-1">
 <h3 className="font-bold text-gray-800 group-hover:text-blue-700">{job.title}</h3>
 {/* Badge ໃໝ່ */}
 <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
 NEW
 </span>
 </div>
 <p className="text-sm text-gray-500">{job.company_name} • {job.location}</p>
 <div className="flex gap-2 mt-2 flex-wrap">
 <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{job.job_type}</span>
 {job.category_name && (
 <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{job.category_name}</span>
 )}
 {/* ===== ວັນທີໂພສ ===== */}
 <span className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full">
 ໂພສ: {formatDate(job.created_at)} ({timeAgo(job.created_at)})
 </span>
 </div>
 </div>
 <div className="text-right shrink-0">
 <div className="font-bold text-blue-700 text-sm">
 {formatSalary(job.salary_min, job.salary_max, job.salary_type)}
 </div>
 <div className="text-xs text-gray-400 mt-1"> {job.applicant_count || 0} ຄົນ</div>
 </div>
 </div>
 </Link>
 ))}
 </div>
 )}

 {/* Pagination */}
 {totalPages > 1 && (
 <div className="flex justify-center gap-2 mt-8">
 <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
 className="px-4 py-2 rounded-xl border text-sm disabled:opacity-50 hover:bg-gray-50">← ກ່ອນໜ້າ</button>
 <span className="px-4 py-2 text-sm text-gray-600">ໜ້າ {page} / {totalPages}</span>
 <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
 className="px-4 py-2 rounded-xl border text-sm disabled:opacity-50 hover:bg-gray-50">ໜ້າຕໍ່ໄປ →</button>
 </div>
 )}
 </div>
 );
}