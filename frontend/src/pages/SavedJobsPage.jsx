import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { savedJobsAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatSalary, getFullUrl } from '../lib/utils';
import CompanyAvatar from '../components/CompanyAvatar';
import SaveJobButton from '../components/SaveJobButton';
import { JobGridSkeleton, PageLoader } from '../components/Skeleton';

const defaultCover = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80';

export default function SavedJobsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { navigate('/login'); return; }
    if (!authLoading && user?.role !== 'applicant') {
      toast.warning('ສະເພາະຜູ້ຊອກວຽກເທົ່ານັ້ນ');
      navigate('/');
      return;
    }
    if (user?.role === 'applicant') {
      setLoading(true);
      savedJobsAPI.getMine()
        .then(r => { if (r.data.success) setJobs(r.data.data || []); })
        .catch(() => toast.error('ບໍ່ສາມາດໂຫຼດໄດ້'))
        .finally(() => setLoading(false));
    }
  }, [user, authLoading]);

  if (authLoading) return <PageLoader />;

  return (
    <div className="bg-gradient-to-b from-blue-50/50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">ວຽກທີ່ບັນທຶກ</h1>
            <p className="text-sm text-gray-500 mt-0.5">ວຽກທີ່ເຈົ້າສົນໃຈ ({jobs.length} ວຽກ)</p>
          </div>
        </div>

        {loading ? (
          <JobGridSkeleton count={6} />
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-700">ຍັງບໍ່ມີວຽກທີ່ບັນທຶກ</h3>
            <p className="text-sm text-gray-400 mt-2">ກົດປຸ່ມຫົວໃຈ ❤️ ໃນວຽກທີ່ສົນໃຈ ເພື່ອບັນທຶກ</p>
            <Link to="/jobs" className="mt-5 inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all">
              ໄປຊອກວຽກ →
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => {
              const cover = job.company_cover ? getFullUrl(job.company_cover) : defaultCover;
              return (
                <div key={job.id}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 group flex flex-col">
                  <div className="relative h-40 overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-600">
                    <img
                      src={cover}
                      alt={job.company_name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.target.src = defaultCover; }}
                    />
                    <div className="absolute top-3 right-3">
                      <SaveJobButton jobId={job.id} />
                    </div>
                  </div>

                  <div className="relative px-5 -mt-8 flex items-end justify-between gap-3">
                    <div className="w-16 h-16 bg-white rounded-xl shadow-md border border-gray-100 p-2 shrink-0">
                      <CompanyAvatar
                        logo={job.company_logo}
                        name={job.company_name}
                        size="sm"
                        className="!w-full !h-full !rounded-lg shadow-none"
                      />
                    </div>
                    <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-full border border-blue-100 pb-1">
                      {job.job_type}
                    </span>
                  </div>

                  <div className="p-5 pt-3 flex-1 flex flex-col">
                    <h3 className="font-bold text-gray-800 text-base line-clamp-1 group-hover:text-blue-700 transition-colors">{job.title}</h3>
                    <Link to={`/users/${job.company_id}`} className="text-sm text-gray-500 mt-0.5 truncate hover:text-blue-600 hover:underline w-fit">
                      {job.company_name || 'ບໍລິສັດ'}
                    </Link>

                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                      <span className="truncate">{job.location}</span>
                    </div>

                    <div className="mt-3 text-sm font-bold text-blue-700">
                      {formatSalary(job.salary_min, job.salary_max, job.salary_type)}
                    </div>

                    <Link to={`/jobs/${job.id}`} className="mt-4 block w-full text-center py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 font-medium hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all">
                      ເບິ່ງລາຍລະອຽດ →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
