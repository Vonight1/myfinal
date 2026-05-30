import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="36" rx="10" fill="url(#logo_gradient)" />
        <path d="M10 18.5L14.5 13L19 18.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14.5 13V24" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M19 14H25C25.5523 14 26 14.4477 26 15V23C26 23.5523 25.5523 24 25 24H19" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="22.5" cy="19" r="1.5" fill="white"/>
        <defs>
          <linearGradient id="logo_gradient" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2563EB"/>
            <stop offset="1" stopColor="#1D4ED8"/>
          </linearGradient>
        </defs>
      </svg>
      <span className="text-xl font-extrabold tracking-tight">
        <span className="text-blue-600">Part</span>
        <span className="text-gray-800">Time</span>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // ປິດ mobile menu ເມື່ອປ່ຽນໜ້າ
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/'); setMobileOpen(false); };
  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
      isActive(path) ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
    }`;

  const mobileLinkClass = (path) =>
    `block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
      isActive(path) ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
    }`;

  const navLinks = (
    <>
      <Link to="/" className={navLinkClass('/')}>ໜ້າຫຼັກ</Link>
      <Link to="/jobs" className={navLinkClass('/jobs')}>ຊອກວຽກ</Link>
      <Link to="/companies" className={navLinkClass('/companies')}>ບໍລິສັດ</Link>
      {user?.role === 'company' && (
        <Link to="/company" className={navLinkClass('/company')}>ປະກາດວຽກ</Link>
      )}
      {user?.role === 'applicant' && (
        <>
          <Link to="/saved-jobs" className={navLinkClass('/saved-jobs')}>ບັນທຶກໄວ້</Link>
          <Link to="/my-applications" className={navLinkClass('/my-applications')}>ວຽກທີ່ສະໝັກ</Link>
        </>
      )}
      {user?.role === 'admin' && (
        <Link to="/admin" className={navLinkClass('/admin')}>ຈັດການລະບົບ</Link>
      )}
    </>
  );

  const mobileNavLinks = (
    <>
      <Link to="/" className={mobileLinkClass('/')}>🏠 ໜ້າຫຼັກ</Link>
      <Link to="/jobs" className={mobileLinkClass('/jobs')}>🔍 ຊອກວຽກ</Link>
      <Link to="/companies" className={mobileLinkClass('/companies')}>🏢 ບໍລິສັດ</Link>
      {user?.role === 'company' && (
        <>
          <Link to="/company" className={mobileLinkClass('/company')}>📝 ປະກາດວຽກ</Link>
          <Link to="/company/profile" className={mobileLinkClass('/company/profile')}>👤 ໂປຣໄຟລ໌</Link>
        </>
      )}
      {user?.role === 'applicant' && (
        <>
          <Link to="/saved-jobs" className={mobileLinkClass('/saved-jobs')}>❤️ ບັນທຶກໄວ້</Link>
          <Link to="/my-applications" className={mobileLinkClass('/my-applications')}>📋 ວຽກທີ່ສະໝັກ</Link>
          <Link to="/profile" className={mobileLinkClass('/profile')}>👤 ໂປຣໄຟລ໌</Link>
        </>
      )}
      {user?.role === 'admin' && (
        <Link to="/admin" className={mobileLinkClass('/admin')}>⚙️ ຈັດການລະບົບ</Link>
      )}
    </>
  );

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-10 py-3 flex items-center justify-between">
        {/* ===== ຊ້າຍ: Logo + Desktop Nav ===== */}
        <div className="flex items-center gap-8">
          <Logo />
          <div className="hidden md:flex items-center gap-1">
            {navLinks}
          </div>
        </div>

        {/* ===== ຂວາ: Auth + Mobile Toggle ===== */}
        <div className="flex items-center gap-2 sm:gap-3">
          {loading ? (
            <div className="w-7 h-7 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
          ) : user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {user.role === 'company' && (
                <span className="hidden md:inline-block text-xs bg-purple-50 text-purple-600 font-semibold px-3 py-1 rounded-full border border-purple-100">
                  ບໍລິສັດ
                </span>
              )}
              {user.role === 'admin' && (
                <span className="hidden md:inline-block text-xs bg-red-50 text-red-600 font-semibold px-3 py-1 rounded-full border border-red-100">
                  Admin
                </span>
              )}

              {/* Notification Bell */}
              <NotificationBell />

              <Link
                to={user.role === 'company' ? '/company/profile' : user.role === 'admin' ? '/admin?tab=profile' : '/profile'}
                className="flex items-center gap-2.5 hover:bg-gray-50 rounded-xl px-2 sm:px-3 py-1.5 transition-all"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {user.name?.[0]}
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">{user.name}</span>
              </Link>

              <button
                onClick={handleLogout}
                className="hidden md:block text-sm text-gray-500 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-all font-medium"
              >
                ອອກ
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/register" className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:bg-gray-50 transition-all">
                ເລີ່ມຮັບງານ
              </Link>
              <Link to="/login" className="text-sm font-bold text-white bg-blue-600 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg hover:bg-blue-700 transition-all shadow-sm">
                ເຂົ້າສູ່ລະບົບ
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-all"
            aria-label="ເປີດເມນູ"
          >
            {mobileOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ===== Mobile Menu Drawer ===== */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3 space-y-1 max-h-[calc(100vh-60px)] overflow-y-auto">
            {mobileNavLinks}

            {/* Auth section ໃນ mobile */}
            {!user && !loading && (
              <div className="pt-3 mt-3 border-t border-gray-100 space-y-2">
                <Link to="/register" className="block w-full text-center px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  ເລີ່ມຮັບງານ
                </Link>
                <Link to="/login" className="block w-full text-center px-4 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700">
                  ເຂົ້າສູ່ລະບົບ
                </Link>
              </div>
            )}

            {user && (
              <div className="pt-3 mt-3 border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  🚪 ອອກຈາກລະບົບ
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
