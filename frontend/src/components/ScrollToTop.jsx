import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useScrollTop } from '../lib/hooks';

/**
 * ScrollToTopOnRouteChange - scroll ໄປເທິງສຸດເມື່ອປ່ຽນໜ້າ
 */
export function ScrollToTopOnRouteChange() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

/**
 * ScrollToTopButton - ປຸ່ມລອຍຢູ່ມຸມຂວາລຸ່ມ
 * ສະແດງເມື່ອ scroll ລົງເກີນ 300px
 */
export function ScrollToTopButton() {
  const show = useScrollTop(300);

  if (!show) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl shadow-blue-600/30 flex items-center justify-center transition-all hover:scale-110 animate-fade-in"
      aria-label="ກັບໄປເທິງສຸດ"
      title="ກັບໄປເທິງສຸດ"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  );
}
