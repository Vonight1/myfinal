import { useState } from 'react';

const faqs = [
  {
    category: 'ທົ່ວໄປ',
    items: [
      { q: 'ເວັບໄຊນີ້ໃຊ້ຫຍັງ?', a: 'PartTime Job Laos ເປັນເວັບໄຊຊອກວຽກ Part-time, Freelance, ແລະ ວຽກຊົ່ວຄາວສຳລັບ ສປປ ລາວ' },
      { q: 'ໃຊ້ຟຣີບໍ່?', a: 'ແມ່ນແລ້ວ! ການໃຊ້ງານທັງໝົດແມ່ນຟຣີສຳລັບທັງຜູ້ຊອກວຽກ ແລະ ບໍລິສັດ' },
      { q: 'ຮັບສະໝັກບໍລິສັດແບບໃດ?', a: 'ບໍລິສັດສາມາດສະໝັກໂດຍກົງໃນລະບົບ ແລະ Admin ຈະກວດສອບ ກ່ອນອະນຸມັດ' },
    ],
  },
  {
    category: 'ສຳລັບຜູ້ຊອກວຽກ',
    items: [
      { q: 'ສະໝັກວຽກແບບໃດ?', a: '1. ສະໝັກສະມາຊິກ → 2. ຊອກວຽກທີ່ສົນໃຈ → 3. ກົດປຸ່ມ "ສະໝັກວຽກນີ້" → 4. ອັບໂຫຼດ CV → ສຳເລັດ!' },
      { q: 'CV ຮອງຮັບ format ໃດ?', a: 'PDF, DOC, DOCX, JPG, PNG (ສູງສຸດ 10MB)' },
      { q: 'ບັນທຶກວຽກໄດ້ບໍ່?', a: 'ໄດ້! ກົດປຸ່ມຫົວໃຈ ❤️ ໃນວຽກທີ່ສົນໃຈ ມັນຈະຖືກບັນທຶກໄວ້ໃນ "ບັນທຶກໄວ້"' },
      { q: 'ຍົກເລີກການສະໝັກໄດ້ບໍ່?', a: 'ປະຈຸບັນຍັງບໍ່ໄດ້ - ກະລຸນາຕິດຕໍ່ບໍລິສັດໂດຍກົງ' },
    ],
  },
  {
    category: 'ສຳລັບບໍລິສັດ',
    items: [
      { q: 'ປະກາດວຽກແບບໃດ?', a: 'Login → ໄປ "ປະກາດວຽກ" → ກົດ "+ ປະກາດວຽກໃໝ່" → ກອກຂໍ້ມູນ → Admin ຈະອະນຸມັດໃນ 24 ຊມ' },
      { q: 'ປະກາດໄດ້ກີ່ວຽກ?', a: 'ສູງສຸດ 10 ວຽກຕໍ່ບໍລິສັດ (ສາມາດປັບໄດ້ໂດຍ Admin)' },
      { q: 'ເບິ່ງຜູ້ສະໝັກໄດ້ບ່ອນໃດ?', a: 'ໄປໜ້າ "ປະກາດວຽກ" → ກົດ "ເບິ່ງ" ໃນວຽກໃດໜຶ່ງ → ຈະເຫັນລາຍຊື່ຜູ້ສະໝັກ + CV' },
    ],
  },
  {
    category: 'ບັນຊີ & ຄວາມປອດໄພ',
    items: [
      { q: 'ລືມລະຫັດຜ່ານ?', a: 'ໄປ Login → ກົດ "ລືມລະຫັດຜ່ານ?" → ໃສ່ email → ໄດ້ຮັບ link ຣີເຊັດ (ໝົດອາຍຸໃນ 1 ຊມ)' },
      { q: 'ປ່ຽນຂໍ້ມູນສ່ວນຕົວ?', a: 'ໄປໜ້າ Profile ຂອງເຈົ້າ → ກົດ "ແກ້ໄຂ"' },
      { q: 'ຂໍ້ມູນຂອງຂ້ອຍປອດໄພບໍ່?', a: 'ແມ່ນແລ້ວ. ລະຫັດຜ່ານຖືກ hash ດ້ວຍ bcrypt ແລະ JWT token ໃຊ້ສຳລັບ session.' },
    ],
  },
];

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState({ 0: 0 });

  const toggle = (catIdx, itemIdx) => {
    setOpenIdx(prev => ({
      ...prev,
      [catIdx]: prev[catIdx] === itemIdx ? -1 : itemIdx,
    }));
  };

  return (
    <div className="bg-gradient-to-b from-blue-50/50 to-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex w-16 h-16 bg-blue-600 rounded-2xl items-center justify-center mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">ຄຳຖາມທີ່ພົບເລື້ອຍ</h1>
          <p className="text-gray-500 mt-2">ຄຳຕອບສຳລັບຄຳຖາມທີ່ໃຊ້ງານ ມັກຖາມເຂົ້າມາ</p>
        </div>

        <div className="space-y-6">
          {faqs.map((cat, catIdx) => (
            <div key={catIdx}>
              <h2 className="text-lg font-bold text-gray-800 mb-3 pl-1">{cat.category}</h2>
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
                {cat.items.map((item, idx) => {
                  const isOpen = openIdx[catIdx] === idx;
                  return (
                    <div key={idx}>
                      <button
                        onClick={() => toggle(catIdx, idx)}
                        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-all"
                      >
                        <span className="font-semibold text-gray-800 pr-3">{item.q}</span>
                        <svg
                          width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                          className={`text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        >
                          <path d="M6 9l6 6 6-6"/>
                        </svg>
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed animate-fade-in">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
          <p className="text-sm text-blue-700">ບໍ່ພົບຄຳຕອບທີ່ຕ້ອງການ?</p>
          <a href="/contact" className="mt-2 inline-block text-blue-600 font-semibold hover:underline">
            ຕິດຕໍ່ເຮົາ →
          </a>
        </div>
      </div>
    </div>
  );
}
