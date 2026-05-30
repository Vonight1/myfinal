import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { usersAPI, companiesAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { formatSalary, getFullUrl } from '../lib/utils';
import CompanyAvatar from '../components/CompanyAvatar';
import FollowButton from '../components/FollowButton';

const defaultCover = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80';

export default function UserProfilePage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    // ຕ້ອງ login ກ່ອນ
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (user) {
      setLoading(true);
      usersAPI.getById(id)
        .then(r => {
          if (r.data.success) {
            setProfile(r.data.data);
            // ໂຫຼດ follower count ຖ້າເປັນບໍລິສັດ
            if (r.data.data.role === 'company') {
              companiesAPI.getFollowerCount(id)
                .then(fr => { if (fr.data.success) setFollowerCount(fr.data.data.count || 0); })
                .catch(() => {});
            }
          } else {
            setError(r.data.message || 'ບໍ່ພົບຜູ້ໃຊ້');
          }
        })
        .catch(err => setError(err.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດ'))
        .finally(() => setLoading(false));
    }
  }, [id, user, authLoading]);

  const handleFollowChange = (nowFollowing) => {
    setFollowerCount(c => nowFollowing ? c + 1 : Math.max(0, c - 1));
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-2xl border border-gray-200 p-12">
          <div className="w-20 h-20 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">{error || 'ບໍ່ພົບຜູ້ໃຊ້'}</h2>
          <Link to="/jobs" className="text-blue-600 mt-4 inline-block hover:underline">← ກັບຄືນ</Link>
        </div>
      </div>
    );
  }

  const isCompany = profile.role === 'company';
  const displayName = isCompany ? (profile.company_name || profile.name) : profile.name;

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <Link to="/jobs" className="text-blue-600 text-sm mb-4 inline-flex items-center gap-1 hover:underline">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        ກັບຄືນ
      </Link>

      {/* ===== Profile Card ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
        {/* Cover (ສະແດງສະເພາະ company) */}
        {isCompany ? (
          <div className="relative h-48 md:h-64 bg-gradient-to-br from-blue-400 to-indigo-600 overflow-hidden">
            <img
              src={profile.company_cover ? getFullUrl(profile.company_cover) : defaultCover}
              alt={displayName}
              loading="lazy"
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = defaultCover; }}
            />
          </div>
        ) : (
          <div className="h-24 md:h-32 bg-gradient-to-br from-blue-500 to-indigo-600"></div>
        )}

        {/* Logo Card + Role badge */}
        <div className="relative px-6 -mt-10 flex items-end justify-between gap-3 flex-wrap">
          <div className="w-20 h-20 bg-white rounded-2xl shadow-md border border-gray-100 p-2 shrink-0">
            <CompanyAvatar
              logo={isCompany ? profile.company_logo : profile.profile_image}
              name={displayName}
              size="sm"
              className="!w-full !h-full !rounded-xl shadow-none"
            />
          </div>
          <div className="pb-2 flex items-center gap-2 flex-wrap">
            {isCompany ? (
              <>
                <span className="text-xs bg-purple-50 text-purple-700 font-semibold px-3 py-1.5 rounded-full border border-purple-100">
                  ບໍລິສັດ
                </span>
                <span className="text-xs text-gray-500">
                  <span className="font-semibold text-gray-700">{followerCount}</span> ຄົນຕິດຕາມ
                </span>
                <FollowButton companyId={profile.id} variant="small" onFollowChange={handleFollowChange} />
              </>
            ) : (
              <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-3 py-1.5 rounded-full border border-blue-100">
                ຜູ້ຊອກວຽກ
              </span>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="px-6 pt-4 pb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{displayName}</h1>

          {isCompany && profile.company_industry && (
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16M9 7h6M9 11h6M9 15h6" />
              </svg>
              {profile.company_industry}
            </p>
          )}

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
              <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Email</p>
                <a href={`mailto:${profile.email}`} className="text-sm font-semibold text-gray-800 hover:text-blue-600 truncate block">{profile.email}</a>
              </div>
            </div>
            {profile.phone && (
              <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">ເບີໂທ</p>
                  <a href={`tel:${profile.phone}`} className="text-sm font-semibold text-gray-800 hover:text-blue-600">{profile.phone}</a>
                </div>
              </div>
            )}
          </div>

          {/* === Company Info === */}
          {isCompany && (
            <>
              {profile.company_address && (
                <div className="mt-3 flex items-start gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                  <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">ທີ່ຢູ່</p>
                    <p className="text-sm font-semibold text-gray-800">{profile.company_address}</p>
                  </div>
                </div>
              )}

              {profile.company_website && (
                <div className="mt-3 flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                  <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">Website</p>
                    <a href={profile.company_website} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-600 hover:underline truncate block">
                      {profile.company_website}
                    </a>
                  </div>
                </div>
              )}

              {profile.company_description && (
                <div className="mt-5">
                  <h3 className="font-bold text-gray-800 mb-2 text-base">ກ່ຽວກັບບໍລິສັດ</h3>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{profile.company_description}</p>
                </div>
              )}
            </>
          )}

          {/* === Applicant Info === */}
          {!isCompany && (
            <>
              {profile.education && (
                <div className="mt-3 flex items-start gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                  <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">ການສຶກສາ</p>
                    <p className="text-sm font-semibold text-gray-800">{profile.education}</p>
                  </div>
                </div>
              )}

              {profile.skills && (
                <div className="mt-5">
                  <h3 className="font-bold text-gray-800 mb-2 text-base">ທັກສະ (Skills)</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.split(/[,;\n]/).filter(s => s.trim()).map((skill, i) => (
                      <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium border border-blue-100">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-xs text-gray-500 mb-1">ສະໝັກວຽກແລ້ວ</p>
                  <p className="text-2xl font-bold text-blue-700">{profile.applied_count || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                  <p className="text-xs text-gray-500 mb-1">ສະມາຊິກ</p>
                  <p className="text-sm font-semibold text-gray-700 mt-2">
                    {profile.created_at ? new Date(profile.created_at).toLocaleDateString('lo-LA') : '-'}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ===== Jobs (ສຳລັບ company) ===== */}
      {isCompany && profile.jobs && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-800">ວຽກທີ່ປະກາດ ({profile.job_count})</h2>
          </div>

          {profile.jobs.length === 0 ? (
            <p className="text-center text-gray-500 py-10 text-sm">ຍັງບໍ່ມີວຽກປະກາດ</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {profile.jobs.map(job => (
                <Link key={job.id} to={`/jobs/${job.id}`}
                  className="block bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 rounded-xl p-4 transition-all group">
                  <h3 className="font-bold text-gray-800 group-hover:text-blue-700 line-clamp-1">{job.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                    {job.location}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">{job.job_type}</span>
                    <span className="text-sm font-bold text-blue-700">
                      {formatSalary(job.salary_min, job.salary_max, job.salary_type)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
