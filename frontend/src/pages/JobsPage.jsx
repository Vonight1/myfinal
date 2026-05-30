import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { jobsAPI } from '../lib/api';
import { formatSalary, getFullUrl } from '../lib/utils';
import { useDebounce } from '../lib/hooks';
import CompanyAvatar from '../components/CompanyAvatar';
import SaveJobButton from '../components/SaveJobButton';
import { JobGridSkeleton } from '../components/Skeleton';

const defaultCover = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80';

// Format ວັນທີ
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const day = d.getDate().toString().padStart(2, '0');
  const months = ['ມ.ກ.', 'ກ.ພ.', 'ມີ.ນ.', 'ເມ.ສ.', 'ພ.ພ.', 'ມິ.ຖ.', 'ກ.ລ.', 'ສ.ຫ.', 'ກ.ຍ.', 'ຕ.ລ.', 'ພ.ຈ.', 'ທ.ວ.'];
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// ກວດວ່າໂພສພາຍໃນ 5 ມື້
function isNew(dateStr) {
  if (!dateStr) return false;
  const diff = (new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24);
  return diff <= 5;
}

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
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [showFilters, setShowFilters] = useState(false);
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');

  // Debounce search (300ms) - ບໍ່ search ທຸກຕົວອັກສອນ
  const debouncedSearch = useDebounce(search, 400);
  const debouncedSalaryMin = useDebounce(salaryMin, 500);
  const debouncedSalaryMax = useDebounce(salaryMax, 500);

  useEffect(() => {
    jobsAPI.getCategories().then(r => { if (r.data.success) setCategories(r.data.data || []); });
  }, []);
  useEffect(() => { setPage(1); }, [debouncedSearch]);
  useEffect(() => { loadJobs(); }, [page, categoryId, jobType, debouncedSearch, debouncedSalaryMin, debouncedSalaryMax]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 12 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (categoryId) params.category_id = categoryId;
      if (jobType) params.job_type = jobType;
      if (debouncedSalaryMin) params.salary_min = debouncedSalaryMin;
      if (debouncedSalaryMax) params.salary_max = debouncedSalaryMax;
      const res = await jobsAPI.getJobs(params);
      if (res.data.success) {
        setJobs(res.data.data || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.total_pages || 1);
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error(err);
    }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => { e.preventDefault(); setPage(1); loadJobs(); };

  const resetFilters = () => {
    setSearch(''); setCategoryId(''); setJobType('');
    setSalaryMin(''); setSalaryMax(''); setPage(1);
  };

  const activeFilterCount = [search, categoryId, jobType, salaryMin, salaryMax].filter(Boolean).length;
  const categoryName = categories.find(c => String(c.id) === String(categoryId))?.name;

  return (
    <div className="bg-gradient-to-b from-blue-50/50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ===== Header ===== */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">ຊອກຫາວຽກ Part-time</h1>
          <p className="text-sm text-gray-500 mt-1">ຄົ້ນພົບໂອກາດໃໝ່ໆທີ່ເໝາະກັບເຈົ້າ</p>
        </div>

        {/* ===== Search Bar ===== */}
        <form onSubmit={handleSearch} className="bg-white rounded-2xl p-4 shadow-md border border-gray-100 mb-6 flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ຄົ້ນຫາວຽກ, ບໍລິສັດ..."
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
            className="px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 outline-none focus:border-blue-400">
            <option value="">ທຸກໝວດໝູ່</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={jobType} onChange={(e) => { setJobType(e.target.value); setPage(1); }}
            className="px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 outline-none focus:border-blue-400">
            <option value="">ທຸກປະເພດ</option>
            <option value="part-time">Part-time</option>
            <option value="freelance">Freelance</option>
            <option value="temporary">ຊົ່ວຄາວ</option>
            <option value="internship">Internship</option>
          </select>
          <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 whitespace-nowrap">
            ຄົ້ນຫາ
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all flex items-center gap-2 ${
              showFilters || activeFilterCount > 0
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            ຕົວກອງ
            {activeFilterCount > 0 && (
              <span className="bg-blue-600 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </form>

        {/* ===== Advanced Filters Panel ===== */}
        {showFilters && (
          <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100 mb-6 animate-slide-up">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                  ເງິນເດືອນຕ່ຳສຸດ (₭)
                </label>
                <input
                  type="number"
                  value={salaryMin}
                  onChange={(e) => { setSalaryMin(e.target.value); setPage(1); }}
                  placeholder="ເຊັ່ນ: 1,000,000"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                  ເງິນເດືອນສູງສຸດ (₭)
                </label>
                <input
                  type="number"
                  value={salaryMax}
                  onChange={(e) => { setSalaryMax(e.target.value); setPage(1); }}
                  placeholder="ເຊັ່ນ: 5,000,000"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Quick salary presets */}
            <div className="flex flex-wrap gap-2 mt-3">
              {[
                { min: '', max: '1000000', label: '< 1M' },
                { min: '1000000', max: '3000000', label: '1M - 3M' },
                { min: '3000000', max: '5000000', label: '3M - 5M' },
                { min: '5000000', max: '', label: '> 5M' },
              ].map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { setSalaryMin(p.min); setSalaryMax(p.max); setPage(1); }}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    salaryMin === p.min && salaryMax === p.max
                      ? 'bg-blue-100 border-blue-300 text-blue-700 font-semibold'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 text-sm text-red-600 hover:underline font-medium"
            >
              ↻ ລ້າງຕົວກອງທັງໝົດ
            </button>
          </div>
        )}

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {search && (
              <FilterChip label={`ຄຳຄົ້ນຫາ: ${search}`} onRemove={() => setSearch('')} />
            )}
            {categoryId && (
              <FilterChip label={`ໝວດ: ${categoryName || categoryId}`} onRemove={() => { setCategoryId(''); setPage(1); }} />
            )}
            {jobType && (
              <FilterChip label={`ປະເພດ: ${jobType}`} onRemove={() => { setJobType(''); setPage(1); }} />
            )}
            {salaryMin && (
              <FilterChip label={`≥ ${Number(salaryMin).toLocaleString()} ₭`} onRemove={() => { setSalaryMin(''); setPage(1); }} />
            )}
            {salaryMax && (
              <FilterChip label={`≤ ${Number(salaryMax).toLocaleString()} ₭`} onRemove={() => { setSalaryMax(''); setPage(1); }} />
            )}
          </div>
        )}

        {/* ===== Result Header (count + view toggle) ===== */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-gray-600">
            ພົບ <span className="font-bold text-blue-700">{total}</span> ວຽກ
          </p>
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              title="Grid"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              title="List"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
            </button>
          </div>
        </div>

        {/* ===== Results ===== */}
        {loading ? (
          viewMode === 'grid' ? <JobGridSkeleton count={6} /> : (
            <div className="space-y-4">
              {Array.from({length: 5}).map((_,i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border animate-pulse h-24" />
              ))}
            </div>
          )
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-700">ບໍ່ພົບວຽກ</h3>
            <p className="text-sm text-gray-400 mt-1">ລອງປ່ຽນຄຳຄົ້ນຫາ ຫຼື ຕົວກອງເບິ່ງ</p>
          </div>
        ) : viewMode === 'grid' ? (
          /* ====== GRID VIEW (ມີ cover + logo card + stats + button) ====== */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => {
              const cover = job.company_cover ? getFullUrl(job.company_cover) : defaultCover;
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
                    {isNew(job.created_at) && (
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
                        <span className="font-semibold text-gray-700">{job.applicant_count || 0}</span> ສະໝັກ
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
        ) : (
          /* ====== LIST VIEW (ມີ cover background ກວ້າງ) ====== */
          <div className="space-y-4">
            {jobs.map((job) => {
              const cover = job.company_cover ? getFullUrl(job.company_cover) : defaultCover;
              return (
                <div key={job.id}
                  className="relative block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all group">
                  <div className="flex">
                    <Link to={`/jobs/${job.id}`} className="relative w-56 shrink-0 hidden md:block overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-600">
                      <img
                        src={cover}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover scale-125 blur-2xl opacity-60"
                        onError={(e) => { e.target.src = defaultCover; }}
                      />
                      <img
                        src={cover}
                        alt={job.company_name}
                        className="relative w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.src = defaultCover; }}
                      />
                    </Link>

                    {/* Content */}
                    <div className="flex-1 p-5 flex items-center gap-4">
                      <Link to={`/users/${job.company_id}`} className="shrink-0">
                        <CompanyAvatar logo={job.company_logo} name={job.company_name} size="lg" className="hover:ring-4 hover:ring-blue-100 transition-all" />
                      </Link>

                      <div className="flex-1 min-w-0">
                        <Link to={`/jobs/${job.id}`} className="flex items-center gap-2 mb-1 hover:text-blue-700 transition-colors">
                          <h3 className="font-bold text-gray-800 group-hover:text-blue-700 transition-colors truncate">{job.title}</h3>
                          {isNew(job.created_at) && (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">NEW</span>
                          )}
                        </Link>
                        <p className="text-sm text-gray-500 mb-2 truncate">
                          <Link to={`/users/${job.company_id}`} className="font-medium hover:text-blue-600 hover:underline">{job.company_name}</Link>
                          {' • '}{job.location}
                        </p>
                        <div className="flex gap-1.5 flex-wrap">
                          <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-full border border-blue-100 font-medium">{job.job_type}</span>
                          {job.category_name && (
                            <span className="text-[10px] bg-gray-50 text-gray-600 px-2 py-1 rounded-full border border-gray-200 font-medium">{job.category_name}</span>
                          )}
                          <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-1 rounded-full border border-orange-100 font-medium">{formatDate(job.created_at)}</span>
                        </div>
                      </div>

                      <Link to={`/jobs/${job.id}`} className="text-right shrink-0 hidden sm:block">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">ເງິນເດືອນ</p>
                        <div className="font-bold text-blue-700 text-sm">{formatSalary(job.salary_min, job.salary_max, job.salary_type)}</div>
                        <div className="text-xs text-gray-400 mt-1">{job.applicant_count || 0} ສະໝັກ</div>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ===== Pagination ===== */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm disabled:opacity-50 hover:bg-blue-50 hover:border-blue-300 transition-all font-medium"
            >
              ← ກ່ອນໜ້າ
            </button>
            <span className="px-4 py-2 text-sm text-gray-600 font-medium">ໜ້າ {page} / {totalPages}</span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm disabled:opacity-50 hover:bg-blue-50 hover:border-blue-300 transition-all font-medium"
            >
              ໜ້າຕໍ່ໄປ →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== FilterChip Component =====
function FilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-full text-xs font-medium">
      {label}
      <button onClick={onRemove} className="hover:bg-blue-200 rounded-full w-4 h-4 flex items-center justify-center" aria-label="ລົບ">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}
