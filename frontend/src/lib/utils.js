export const formatSalary = (min, max, type) => {
  const fmt = (n) => (n ? Number(n).toLocaleString() : '0');
  const label = { hourly: '/ຊມ', daily: '/ມື້', monthly: '/ເດືອນ', negotiable: '' };
  if (!min && !max) return 'ຕາມຕົກລົງ';
  return `${fmt(min)} - ${fmt(max)} ₭${label[type] || ''}`;
};

export const API_BASE = 'http://localhost:8080';

// ສ້າງ full URL ສຳລັບ logo/cover
export const getFullUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path}`;
};

export const categoryIcons = {};

export const statusColor = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  accepted: 'bg-green-100 text-green-700',
  reviewed: 'bg-blue-100 text-blue-700',
  closed: 'bg-gray-100 text-gray-700',
};

export const statusLabel = {
  pending: 'ລໍຖ້າ', approved: 'ອະນຸມັດ', rejected: 'ປະຕິເສດ',
  accepted: 'ຮັບແລ້ວ', reviewed: 'ກຳລັງພິຈາລະນາ', closed: 'ປິດແລ້ວ',
};