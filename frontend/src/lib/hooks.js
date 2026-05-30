import { useState, useEffect, useRef } from 'react';

/**
 * useDebounce - ໜ່ວງເວລາການອັບເດດ value ໂດຍ delay ms
 * ໃຊ້ສຳລັບ search input ເພື່ອບໍ່ໃຫ້ call API ທຸກຕົວອັກສອນ
 *
 * @example
 * const [search, setSearch] = useState('');
 * const debouncedSearch = useDebounce(search, 300);
 * useEffect(() => { fetchData(debouncedSearch); }, [debouncedSearch]);
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * useScrollTop - ກວດເບິ່ງວ່າ scroll ລົງເກີນ threshold ບໍ່
 * @example const showButton = useScrollTop(300);
 */
export function useScrollTop(threshold = 300) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = () => setShow(window.scrollY > threshold);
    window.addEventListener('scroll', handler, { passive: true });
    handler();
    return () => window.removeEventListener('scroll', handler);
  }, [threshold]);

  return show;
}

/**
 * useClickOutside - ໂທ callback ເມື່ອກົດນອກ element
 * @example const ref = useClickOutside(() => setOpen(false));
 */
export function useClickOutside(callback) {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) callback();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [callback]);
  return ref;
}
