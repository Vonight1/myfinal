import { getFullUrl } from '../lib/utils';

/**
 * CompanyAvatar - ສະແດງ logo ບໍລິສັດ
 * ຖ້າມີ logo → ສະແດງຮູບ
 * ບໍ່ມີ → ສະແດງຕົວອັກສອນທຳອິດ
 */
export default function CompanyAvatar({ logo, name, size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-10 h-10 text-base',
    md: 'w-12 h-12 text-lg',
    lg: 'w-14 h-14 text-xl',
    xl: 'w-16 h-16 text-2xl',
    '2xl': 'w-20 h-20 text-3xl',
    '3xl': 'w-28 h-28 text-5xl',
  };
  const cls = sizes[size] || sizes.md;

  if (logo) {
    return (
      <div className={`${cls} rounded-xl overflow-hidden bg-white shadow-md shrink-0 ${className}`}>
        <img
          src={getFullUrl(logo)}
          alt={name || 'Logo'}
          loading="lazy"
          className="w-full h-full object-cover"
          onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold">${name?.[0] || 'C'}</div>`; }}
        />
      </div>
    );
  }

  return (
    <div className={`${cls} bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center font-bold text-white shrink-0 shadow-md ${className}`}>
      {name?.[0] || 'C'}
    </div>
  );
}