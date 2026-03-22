import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { jobsAPI } from '../lib/api';
import { formatSalary, categoryIcons } from '../lib/utils';

export default function JobsPage() {
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('category_id') || '');
  const [jobType, setJobType] = useState('');

  useEffect(() => { jobsAPI.getCategories().then(r => { if (r.data.success) setCategories(r.data.data || []); }); }, []);
  useEffect(() => { loadJobs(); }, [page, categoryId, jobType]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 10 };
      if (search) params.search = search;
      if (categoryId) params.category_id = categoryId;
      if (jobType) params.job_type = jobType;
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
      <h1 className="text-2xl font-bold mb-6">🔍 ຊອກຫາວຽກ Part-time</h1>
      <form onSubmit={handleSearch} className="bg-white rounded-2xl p-4 shadow-sm border mb-6 flex flex-col md:flex-row gap-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ຄົ້ນຫາ..." className="flex-1 px-4 py-2.5 border rounded-xl text-sm outline-none focus:border-blue-400" />
        <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setPage(1); }} className="px-4 py-2.5 border rounded-xl text-sm text-gray-600 outline-none">
          <option value="">ທຸກໝວດໝູ່</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={jobType} onChange={(e) => { setJobType(e.target.value); setPage(1); }} className="px-4 py-2.5 border rounded-xl text-sm text-gray-600 outline-none">
          <option value="">ທຸກປະເພດ</option>
          <option value="part-time">Part-time</option>
          <option value="freelance">Freelance</option>
          <option value="temporary">ຊົ່ວຄາວ</option>
        </select>
        <button type="submit" className="bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-800 whitespace-nowrap">🔍 ຄົ້ນຫາ</button>
      </form>
      <p className="text-sm text-gray-500 mb-4">ພົບ {total} ວຽກ</p>
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20"><div className="text-5xl mb-4">📭</div><h3 className="text-lg font-semibold text-gray-700">ບໍ່ພົບວຽກ</h3></div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Link key={job.id} to={`/jobs/${job.id}`} className="block bg-white rounded-2xl p-5 border hover:shadow-lg transition-all">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-50 rounded-xl flex items-center justify-center text-2xl shrink-0">{categoryIcons[job.category_name] || '💼'}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800">{job.title}</h3>
                  <p className="text-sm text-gray-500">{job.company_name} • 📍 {job.location}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{job.job_type}</span>
                    {job.category_name && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{job.category_name}</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-blue-700 text-sm">{formatSalary(job.salary_min, job.salary_max, job.salary_type)}</div>
                  <div className="text-xs text-gray-400 mt-1">👥 {job.applicant_count || 0} ຄົນ</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-4 py-2 rounded-xl border text-sm disabled:opacity-50 hover:bg-gray-50">← ກ່ອນໜ້າ</button>
          <span className="px-4 py-2 text-sm text-gray-600">ໜ້າ {page} / {totalPages}</span>
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-4 py-2 rounded-xl border text-sm disabled:opacity-50 hover:bg-gray-50">ໜ້າຕໍ່ໄປ →</button>
        </div>
      )}
    </div>
  );
}