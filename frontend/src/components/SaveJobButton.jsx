import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { savedJobsAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

/**
 * SaveJobButton - ປຸ່ມບັນທຶກວຽກ (heart icon)
 * variant: 'icon' (ກວມ floating icon) | 'button' (ມີຂໍ້ຄວາມ)
 */
export default function SaveJobButton({ jobId, variant = 'icon', className = '' }) {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // ກວດເບິ່ງສະຖານະບັນທຶກ
  useEffect(() => {
    if (!user || user.role !== 'applicant') {
      setChecking(false);
      return;
    }
    savedJobsAPI.check(jobId)
      .then(r => { if (r.data.success) setSaved(r.data.data.saved); })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [jobId, user]);

  // ສະແດງສະເພາະ applicant
  if (!user || user.role !== 'applicant') {
    if (variant === 'icon') return null;
    return (
      <button
        type="button"
        onClick={() => { toast.info('ກະລຸນາ login ກ່ອນ'); navigate('/login'); }}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 ${className}`}
      >
        <Heart filled={false} />
        ບັນທຶກ
      </button>
    );
  }

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading || checking) return;
    setLoading(true);
    try {
      const res = await savedJobsAPI.toggle(jobId);
      if (res.data.success) {
        const nowSaved = res.data.data.saved;
        setSaved(nowSaved);
        toast.success(nowSaved ? 'ບັນທຶກວຽກສຳເລັດ' : 'ຍົກເລີກບັນທຶກແລ້ວ');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'ບໍ່ສາມາດບັນທຶກໄດ້');
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading || checking}
        className={`w-10 h-10 bg-white rounded-full shadow-md hover:scale-110 transition-all flex items-center justify-center disabled:opacity-50 ${className}`}
        aria-label={saved ? 'ຍົກເລີກບັນທຶກ' : 'ບັນທຶກວຽກ'}
        title={saved ? 'ຍົກເລີກບັນທຶກ' : 'ບັນທຶກວຽກ'}
      >
        <Heart filled={saved} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading || checking}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all disabled:opacity-50 ${
        saved
          ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
      } ${className}`}
    >
      <Heart filled={saved} />
      {saved ? 'ບັນທຶກແລ້ວ' : 'ບັນທຶກວຽກ'}
    </button>
  );
}

function Heart({ filled }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? '#ef4444' : 'none'}
      stroke={filled ? '#ef4444' : 'currentColor'}
      strokeWidth="2"
      className="transition-all"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
