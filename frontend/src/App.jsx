import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ConfirmProvider } from './context/ConfirmContext';
import { ScrollToTopOnRouteChange, ScrollToTopButton } from './components/ScrollToTop';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JobsPage from './pages/JobsPage';
import NewJobsPage from './pages/NewJobsPage';
import JobDetailPage from './pages/JobDetailPage';
import CompanyPage from './pages/CompanyPage';
import CompanyProfilePage from './pages/CompanyProfilePage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import UserProfilePage from './pages/UserProfilePage';
import SavedJobsPage from './pages/SavedJobsPage';
import CompaniesPage from './pages/CompaniesPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import NotFoundPage from './pages/NotFoundPage';

function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-8">
          {/* Logo + Description */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <svg width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="36" height="36" rx="10" fill="url(#footer_grad)" />
                <path d="M10 18.5L14.5 13L19 18.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14.5 13V24" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M19 14H25C25.5523 14 26 14.4477 26 15V23C26 23.5523 25.5523 24 25 24H19" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="22.5" cy="19" r="1.5" fill="white"/>
                <defs><linearGradient id="footer_grad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse"><stop stopColor="#2563EB"/><stop offset="1" stopColor="#1D4ED8"/></linearGradient></defs>
              </svg>
              <span className="text-xl font-extrabold tracking-tight">
                <span className="text-blue-400">Part</span><span className="text-white">Time</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              ເວັບໄຊຊອກຫາບ່ອນເຮັດວຽກ Part-time ໃນ ສປປ ລາວ
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-sm mb-4 text-gray-300">ລິ້ງດ່ວນ</h4>
            <div className="space-y-2">
              <a href="/" className="block text-gray-400 text-sm hover:text-white transition-colors">ໜ້າຫຼັກ</a>
              <a href="/jobs" className="block text-gray-400 text-sm hover:text-white transition-colors">ຊອກວຽກ</a>
              <a href="/companies" className="block text-gray-400 text-sm hover:text-white transition-colors">ບໍລິສັດ</a>
              <a href="/register" className="block text-gray-400 text-sm hover:text-white transition-colors">ສະໝັກສະມາຊິກ</a>
            </div>
          </div>

          {/* About Links */}
          <div>
            <h4 className="font-bold text-sm mb-4 text-gray-300">ກ່ຽວກັບ</h4>
            <div className="space-y-2">
              <a href="/about" className="block text-gray-400 text-sm hover:text-white transition-colors">ກ່ຽວກັບເຮົາ</a>
              <a href="/contact" className="block text-gray-400 text-sm hover:text-white transition-colors">ຕິດຕໍ່</a>
              <a href="/faq" className="block text-gray-400 text-sm hover:text-white transition-colors">ຄຳຖາມທີ່ພົບເລື້ອຍ</a>
            </div>
          </div>

          {/* ຜູ້ພັດທະນາ */}
          <div>
            <h4 className="font-bold text-sm mb-4 text-gray-300">ຜູ້ພັດທະນາ</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <p>ສຸກຈະເລີນ ຈະເລີນຜົນ</p>
              <p>ສິດທິພອນ ສຸພັນໄຄສີ</p>
              <p>ໄພປະດິດ ສຸຂະທຳມະວົງ</p>
            </div>
          </div>

          {/* ຕິດຕໍ່ */}
          <div>
            <h4 className="font-bold text-sm mb-4 text-gray-300">ຂໍ້ມູນ</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <p>ສະຖາບັນ ເຕັກໂນໂລຊີ ສຸດສະກະ</p>
              <p>ຮຸ່ນທີ 09</p>
              <p>ນະຄອນຫຼວງວຽງຈັນ, ສປປ ລາວ</p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-6 text-center">
          <p className="text-gray-500 text-xs">© 2026 ສະຖາບັນ ເຕັກໂນໂລຊີ ສຸດສະກະ - ຮຸ່ນທີ 09. ສະຫງວນລິຂະສິດ.</p>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
        <ConfirmProvider>
        <ScrollToTopOnRouteChange />
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/new-jobs" element={<NewJobsPage />} />
              <Route path="/jobs/:id" element={<JobDetailPage />} />
              <Route path="/company" element={<CompanyPage />} />
              <Route path="/company/profile" element={<CompanyProfilePage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/users/:id" element={<UserProfilePage />} />
              <Route path="/saved-jobs" element={<SavedJobsPage />} />
              <Route path="/companies" element={<CompaniesPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/my-applications" element={<MyApplicationsPage />} />
              <Route path="/change-password" element={<ChangePasswordPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
          <ScrollToTopButton />
        </div>
        </ConfirmProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}