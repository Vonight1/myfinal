import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { companiesAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

/**
 * FollowButton - ປຸ່ມຕິດຕາມບໍລິສັດ
 * variant: 'default' | 'small'
 */
export default function FollowButton({ companyId, variant = 'default', onFollowChange }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user) {
      setChecking(false);
      return;
    }
    if (user.id === Number(companyId)) {
      setChecking(false);
      return;
    }
    companiesAPI.checkFollowing(companyId)
      .then(r => { if (r.data.success) setFollowing(r.data.data.following); })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [companyId, user]);

  // ບໍ່ສະແດງ ຖ້າເປັນບໍລິສັດເອງ
  if (user && user.id === Number(companyId)) return null;

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.info('ກະລຸນາ login ກ່ອນ');
      navigate('/login');
      return;
    }

    if (loading || checking) return;
    setLoading(true);
    try {
      const res = await companiesAPI.toggleFollow(companyId);
      if (res.data.success) {
        const nowFollowing = res.data.data.following;
        setFollowing(nowFollowing);
        toast.success(nowFollowing ? 'ຕິດຕາມສຳເລັດ' : 'ເລີກຕິດຕາມແລ້ວ');
        onFollowChange?.(nowFollowing);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'ບໍ່ສາມາດຕິດຕາມໄດ້');
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'small') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={loading || checking}
        className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all disabled:opacity-50 ${
          following
            ? 'bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {following ? 'ກຳລັງຕິດຕາມ' : '+ ຕິດຕາມ'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading || checking}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all disabled:opacity-50 ${
        following
          ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20'
      }`}
    >
      {following ? (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          ກຳລັງຕິດຕາມ
        </>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          ຕິດຕາມ
        </>
      )}
    </button>
  );
}
