import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { companiesAPI } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { getFullUrl } from '../lib/utils';
import { useDebounce } from '../lib/hooks';
import CompanyAvatar from '../components/CompanyAvatar';
import FollowButton from '../components/FollowButton';

const defaultCover = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80';

export default function CompaniesPage() {
  const toast = useToast();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce search
  const debouncedSearch = useDebounce(search, 400);

  const loadCompanies = async (searchTerm = '') => {
    setLoading(true);
    try {
      const params = { page, per_page: 12 };
      if (searchTerm) params.search = searchTerm;
      const res = await companiesAPI.getAll(params);
      if (res.data.success) {
        setCompanies(res.data.data.companies || []);
        setTotal(res.data.data.total || 0);
        const pages = Math.ceil((res.data.data.total || 0) / 12);
        setTotalPages(pages || 1);
      }
    } catch (err) {
      toast.error('ບໍ່ສາມາດໂຫຼດໄດ້');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setPage(1); }, [debouncedSearch]);
  useEffect(() => { loadCompanies(debouncedSearch); }, [page, debouncedSearch]);

  const handleSearch = (e) => {
    e.preventDefault();
    // ບໍ່ຕ້ອງເຮັດຫຍັງເພາະ debounce trigger ໃຫ້ແລ້ວ
  };

  return (
    <div className="bg-gradient-to-b from-blue-50/50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">ບໍລິສັດທັງໝົດ</h1>
          <p className="text-sm text-gray-500 mt-1">ຄົ້ນພົບບໍລິສັດທີ່ກຳລັງເປີດຮັບສະໝັກວຽກ</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="bg-white rounded-2xl p-4 shadow-md border border-gray-100 mb-6 flex gap-3">
          <div className="flex-1 relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ຄົ້ນຫາບໍລິສັດ..."
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20">
            ຄົ້ນຫາ
          </button>
        </form>

        <p className="text-sm text-gray-600 mb-5">
          ພົບ <span className="font-bold text-blue-700">{total}</span> ບໍລິສັດ
        </p>

        {/* Results */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-200 animate-pulse">
                <div className="h-40 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100" />
                <div className="px-5 -mt-8 flex items-end justify-between">
                  <div className="w-16 h-16 bg-gray-200 rounded-xl" />
                  <div className="w-20 h-5 bg-gray-200 rounded-full pb-1" />
                </div>
                <div className="p-5 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-10 bg-gray-200 rounded-xl mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : companies.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16M9 7h6M9 11h6M9 15h6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-700">ບໍ່ພົບບໍລິສັດ</h3>
            <p className="text-sm text-gray-400 mt-1">ລອງປ່ຽນຄຳຄົ້ນຫາ</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((c) => {
              const cover = c.company_cover ? getFullUrl(c.company_cover) : defaultCover;
              return (
                <div key={c.id}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 group flex flex-col">
                  {/* Cover */}
                  <div className="relative h-40 overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-600">
                    <img
                      src={cover}
                      alt={c.company_name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.target.src = defaultCover; }}
                    />
                  </div>

                  {/* Logo + Stats */}
                  <div className="relative px-5 -mt-8 flex items-end justify-between gap-3">
                    <div className="w-16 h-16 bg-white rounded-xl shadow-md border border-gray-100 p-2 shrink-0">
                      <CompanyAvatar
                        logo={c.company_logo}
                        name={c.company_name}
                        size="sm"
                        className="!w-full !h-full !rounded-lg shadow-none"
                      />
                    </div>
                    <div className="flex items-center gap-2 pb-1">
                      <span className="text-xs text-gray-500">
                        <span className="font-semibold text-gray-700">{c.follower_count || 0}</span> ຄົນຕິດຕາມ
                      </span>
                      <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-full border border-blue-100">
                        {c.job_count} Jobs
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 pt-3 flex-1 flex flex-col">
                    <h3 className="font-bold text-gray-800 text-base line-clamp-1 group-hover:text-blue-700 transition-colors">
                      {c.company_name || 'ບໍລິສັດ'}
                    </h3>

                    {c.company_industry && (
                      <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{c.company_industry}</p>
                    )}

                    {c.company_address && (
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                        <span className="truncate">{c.company_address}</span>
                      </div>
                    )}

                    <div className="mt-4 flex items-center gap-2">
                      <Link to={`/users/${c.id}`} className="flex-1 text-center py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 font-medium hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all">
                        ເບິ່ງຂໍ້ມູນ →
                      </Link>
                      <FollowButton companyId={c.id} variant="small" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm disabled:opacity-50 hover:bg-blue-50 transition-all font-medium"
            >
              ← ກ່ອນໜ້າ
            </button>
            <span className="px-4 py-2 text-sm text-gray-600 font-medium">ໜ້າ {page} / {totalPages}</span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm disabled:opacity-50 hover:bg-blue-50 transition-all font-medium"
            >
              ໜ້າຕໍ່ໄປ →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
