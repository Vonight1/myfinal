import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jobsAPI } from '../lib/api';
import { formatSalary, categoryIcons } from '../lib/utils';

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [latestJobs, setLatestJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([jobsAPI.getCategories(), jobsAPI.getJobs({ per_page: 4 })])
      .then(([catRes, jobRes]) => {
        if (catRes.data.success) setCategories(catRes.data.data || []);
        if (jobRes.data.success) setLatestJobs(jobRes.data.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/jobs?search=${encodeURIComponent(search)}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-800 via-blue-700 to-indigo-800 text-white py-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="inline-block bg-yellow-500 text-blue-900 text-xs font-bold px-4 py-1 rounded-full mb-6">🇱🇦 ສຳລັບຄົນລາວ</div>
          <h1 className="text-4xl md:text-6xl font-black mb-4">ຊອກຫາວຽກ <span className="text-yellow-400">Part-time</span></h1>
          <p className="text-lg text-blue-200 mb-8 max-w-2xl mx-auto">ແພລດຟອມອັນດັບ 1 ສຳລັບຊອກຫາວຽກ Part-time ໃນ ສປປ ລາວ</p>
          <form onSubmit={handleSearch} className="bg-white rounded-2xl p-2 max-w-2xl mx-auto flex gap-2 shadow-2xl">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ຄົ້ນຫາວຽກ... ເຊັ່ນ: ພະນັກງານກາເຟ" className="flex-1 px-5 py-3 text-gray-700 text-sm rounded-xl outline-none" />
            <button type="submit" className="bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-800 whitespace-nowrap"> ຊອກຫາ</button>
          </form>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-8"> ໝວດໝູ່ວຽກ</h2>
        {loading ? (
          <div className="flex justify-center py-10"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link key={cat.id} to={`/jobs?category_id=${cat.id}`} className="bg-white border-2 border-gray-100 rounded-2xl p-5 text-center hover:border-blue-300 hover:shadow-lg transition-all group">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{categoryIcons[cat.name]}</div>
                <div className="font-semibold text-gray-800 text-sm">{cat.name}</div>
                <div className="text-xs text-gray-400 mt-1">{cat.job_count || 0} ວຽກ</div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Latest Jobs */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8"> ວຽກລ່າສຸດ</h2>
          {loading ? (
            <div className="flex justify-center py-10"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
          ) : latestJobs.length === 0 ? (
            <p className="text-center text-gray-500">ຍັງບໍ່ມີວຽກໃນລະບົບ</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {latestJobs.map((job) => (
                <Link key={job.id} to={`/jobs/${job.id}`} className="bg-white rounded-2xl p-5 border hover:shadow-xl transition-all group">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center text-2xl shrink-0">{categoryIcons[job.category_name]}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 group-hover:text-blue-700">{job.title}</h3>
                      <p className="text-sm text-gray-500">{job.company_name}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">📍 {job.location}</span>
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">{job.job_type}</span>
                      </div>
                      <div className="mt-3 text-sm font-bold text-blue-700">{formatSalary(job.salary_min, job.salary_max, job.salary_type)}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Link to="/jobs" className="inline-block bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-800">ເບິ່ງວຽກທັງໝົດ →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}