import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jobsAPI } from '../lib/api';
import { formatSalary, getFullUrl } from '../lib/utils';
import CompanyAvatar from '../components/CompanyAvatar';
import SaveJobButton from '../components/SaveJobButton';
import { JobGridSkeleton } from '../components/Skeleton';

const categoryImages = {
  'ການເງິນ': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80',
  'ການສຶກສາ': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80',
  'ການຕະຫຼາດ': 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=600&q=80',
  'ຂົນສົ່ງ': 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&q=80',
  'ສຸຂະພາບ': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80',
  'ບໍລິການ': 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&q=80',
  'ຮ້ານຄ້າ': 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600&q=80',
  'ຮ້ານອາຫານ': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80',
  'ເຕັກໂນໂລຊີ': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80',
  'ອື່ນໆ': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80',
};

const defaultCover = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80';

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [latestJobs, setLatestJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [seenCategories, setSeenCategories] = useState(() => {
    try { return JSON.parse(localStorage.getItem('seenCategories') || '{}'); }
    catch { return {}; }
  });
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      jobsAPI.getCategories(),
      jobsAPI.getJobs({ per_page: 6 }),
      jobsAPI.getStats(),
    ])
      .then(([catRes, jobRes, statsRes]) => {
        if (catRes.data.success) setCategories(catRes.data.data || []);
        if (jobRes.data.success) setLatestJobs(jobRes.data.data || []);
        if (statsRes.data.success) setStats(statsRes.data.data);
      })
      .catch((err) => { if (import.meta.env.DEV) console.error(err); })
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/jobs?search=${encodeURIComponent(search)}`);
  };

  const handleCategoryClick = (catId, jobCount) => {
    const updated = { ...seenCategories, [catId]: jobCount };
    setSeenCategories(updated);
    localStorage.setItem('seenCategories', JSON.stringify(updated));
  };

  const getUnseenCount = (catId, jobCount) => {
    const lastSeen = seenCategories[catId] || 0;
    return Math.max(0, jobCount - lastSeen);
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
      {/* ===== Hero ===== */}
      <section className="pt-16 pb-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-800 mb-4">
            ຊອກວຽກ <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Part-time</span>?
          </h1>
          <p className="text-gray-500 mb-8 text-base md:text-lg">ແພລດຟອມຊອກຫາວຽກ Part-time ໃນ ສປປ ລາວ</p>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="bg-white rounded-full shadow-xl border-2 border-blue-100 p-2 flex items-center gap-2 focus-within:border-blue-400 transition-all">
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="ຄົ້ນຫາວຽກ... ເຊັ່ນ: ພະນັກງານກາເຟ"
                className="flex-1 px-5 py-3 text-gray-700 text-sm outline-none bg-transparent" />
              <button type="submit" className="bg-blue-600 text-white px-7 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors text-sm">ຄົ້ນຫາ</button>
            </div>
          </form>

          {stats && (
            <div className="flex justify-center gap-8 md:gap-16 mt-10">
              <Link to="/new-jobs" className="text-center hover:scale-110 transition-transform">
                <div className="text-3xl md:text-4xl font-black text-blue-600">{stats.new_jobs_today}</div>
                <div className="text-xs md:text-sm text-gray-500 mt-1">ວຽກໃໝ່</div>
              </Link>
              <div className="w-px bg-gray-200"></div>
              <Link to="/jobs" className="text-center hover:scale-110 transition-transform">
                <div className="text-3xl md:text-4xl font-black text-green-600">{stats.approved_jobs}</div>
                <div className="text-xs md:text-sm text-gray-500 mt-1">ກຳລັງເປີດຮັບ</div>
              </Link>
              <div className="w-px bg-gray-200 hidden md:block"></div>
              <div className="text-center hidden md:block">
                <div className="text-3xl md:text-4xl font-black text-purple-600">{stats.total_companies}</div>
                <div className="text-xs md:text-sm text-gray-500 mt-1">ບໍລິສັດ</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ===== Categories ===== */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">ໝວດໝູ່ວຽກ</h2>
            <Link to="/jobs" className="text-sm text-blue-600 font-semibold hover:underline">ເບິ່ງທັງໝົດ →</Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-10"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((cat) => {
                const unseen = getUnseenCount(cat.id, cat.job_count || 0);
                const imgUrl = categoryImages[cat.name] || categoryImages['ອື່ນໆ'];
                return (
                  <Link key={cat.id} to={`/jobs?category_id=${cat.id}`}
                    onClick={() => handleCategoryClick(cat.id, cat.job_count || 0)}
                    className="relative rounded-2xl overflow-hidden group cursor-pointer h-32 md:h-40 shadow-md hover:shadow-xl transition-all">
                    <img src={imgUrl} alt={cat.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 group-hover:from-black/90 transition-all"></div>
                    {unseen > 0 && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold min-w-[22px] h-5 px-1.5 rounded-full flex items-center justify-center shadow-lg animate-pulse">{unseen}</div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 text-white">
                      <h3 className="font-bold text-sm md:text-base">{cat.name}</h3>
                      <p className="text-xs text-gray-200 mt-0.5">{cat.job_count || 0} ວຽກ</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ===== Top 5 Companies (ມີ logo) ===== */}
      {stats?.top_companies?.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-16">
          <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">ບໍລິສັດຍອດນິຍົມ</h2>
            <p className="text-sm text-gray-500 mb-6">Top 5 ບໍລິສັດທີ່ມີວຽກຫຼາຍທີ່ສຸດ</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {stats.top_companies.map((company, i) => (
                <div key={i} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 text-center hover:shadow-lg transition-all relative border border-blue-100">
                  <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md ${
                    i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-600' : 'bg-blue-500'
                  }`}>{i + 1}</div>
                  <div className="flex justify-center mb-3">
                    <CompanyAvatar logo={company.company_logo} name={company.company_name} size="2xl" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm mb-2 truncate">{company.company_name || 'ບໍລິສັດ'}</h3>
                  <div className="flex justify-center gap-3 text-xs">
                    <div><div className="font-bold text-blue-600">{company.job_count}</div><div className="text-gray-400 text-[10px]">ວຽກ</div></div>
                    <div className="w-px bg-gray-200"></div>
                    <div><div className="font-bold text-green-600">{company.app_count}</div><div className="text-gray-400 text-[10px]">ສະໝັກ</div></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== Latest Jobs (ມີ cover + logo) ===== */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">ວຽກລ່າສຸດ</h2>
              <p className="text-sm text-gray-500 mt-1">ໂອກາດໃໝ່ໆທີ່ກຳລັງເປີດຮັບສະໝັກ</p>
            </div>
            <Link to="/jobs" className="text-sm text-blue-600 font-semibold hover:underline flex items-center gap-1 shrink-0">
              ເບິ່ງທັງໝົດ
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
          {loading ? (
            <JobGridSkeleton count={6} />
          ) : latestJobs.length === 0 ? (
            <p className="text-center text-gray-500 py-10">ຍັງບໍ່ມີວຽກໃນລະບົບ</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestJobs.map((job) => {
                const cover = job.company_cover ? getFullUrl(job.company_cover) : defaultCover;
                const isNewJob = job.created_at && ((new Date() - new Date(job.created_at)) / (1000 * 60 * 60 * 24)) <= 5;
                return (
                  <div key={job.id}
                    className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 group flex flex-col">
                    {/* ===== Cover Image ===== */}
                    <div className="relative h-40 overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-600">
                      <img
                        src={cover}
                        alt={job.company_name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.src = defaultCover; }}
                      />
                      {isNewJob && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                          NEW
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <SaveJobButton jobId={job.id} />
                      </div>
                    </div>

                    {/* ===== Logo Card + Stats Row ===== */}
                    <div className="relative px-5 -mt-8 flex items-end justify-between gap-3">
                      {/* Logo ໃນ card ສີຂາວ */}
                      <div className="w-16 h-16 bg-white rounded-xl shadow-md border border-gray-100 p-2 shrink-0">
                        <CompanyAvatar
                          logo={job.company_logo}
                          name={job.company_name}
                          size="sm"
                          className="!w-full !h-full !rounded-lg shadow-none"
                        />
                      </div>
                      {/* Stats: applicants + job_type badge */}
                      <div className="flex items-center gap-3 pb-1">
                        <span className="text-xs text-gray-500">
                          <span className="font-semibold text-gray-700">{job.applicant_count || 0}</span> ສະໝັກແລ້ວ
                        </span>
                        <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-full border border-blue-100">
                          {job.job_type}
                        </span>
                      </div>
                    </div>

                    {/* ===== Content ===== */}
                    <div className="p-5 pt-3 flex-1 flex flex-col">
                      <h3 className="font-bold text-gray-800 text-base line-clamp-1 group-hover:text-blue-700 transition-colors">
                        {job.title}
                      </h3>
                      <Link
                        to={`/users/${job.company_id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm text-gray-500 mt-0.5 truncate hover:text-blue-600 hover:underline block w-fit max-w-full"
                      >
                        {job.company_name || 'ບໍລິສັດ'}
                      </Link>

                      <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        <span className="truncate">{job.location}</span>
                      </div>

                      {/* Salary */}
                      <div className="mt-3 text-sm font-bold text-blue-700">
                        {formatSalary(job.salary_min, job.salary_max, job.salary_type)}
                      </div>

                      {/* Button */}
                      <Link to={`/jobs/${job.id}`}
                        className="mt-4 block w-full text-center py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 font-medium hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all">
                        ເບິ່ງລາຍລະອຽດ →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}