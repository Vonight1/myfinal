import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { Spinner } from '../components/Skeleton';

export default function ContactPage() {
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success('ສົ່ງຂໍ້ຄວາມສຳເລັດ! ເຮົາຈະຕິດຕໍ່ກັບໃນໄວໆ');
      setForm({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 800);
  };

  const h = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="bg-gradient-to-b from-blue-50/50 to-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">ຕິດຕໍ່ເຮົາ</h1>
          <p className="text-gray-500 mt-2">ມີຄຳຖາມຫຍັງ? ສົ່ງຂໍ້ຄວາມເຖິງເຮົາ</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-5">ສົ່ງຂໍ້ຄວາມ</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">ຊື່ <span className="text-red-500">*</span></label>
                <input name="name" value={form.name} onChange={h} required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Email <span className="text-red-500">*</span></label>
                <input type="email" name="email" value={form.email} onChange={h} required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">ຫົວຂໍ້</label>
                <input name="subject" value={form.subject} onChange={h}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">ຂໍ້ຄວາມ <span className="text-red-500">*</span></label>
                <textarea name="message" value={form.message} onChange={h} required rows={5}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all">
                {loading ? <><Spinner size="sm"/> ກຳລັງສົ່ງ...</> : 'ສົ່ງຂໍ້ຄວາມ'}
              </button>
            </form>
          </div>

          {/* Info */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-5">ຂໍ້ມູນຕິດຕໍ່</h2>
              <div className="space-y-4">
                <ContactInfo
                  icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  iconBg="bg-blue-100 text-blue-600"
                  label="Email" value="info@parttimejob.la"
                />
                <ContactInfo
                  icon="M3 5a2 2 0 012-2h3.28a1 1 0 01.95.68l1.5 4.49a1 1 0 01-.5 1.21l-2.26 1.13a11 11 0 005.52 5.52l1.13-2.26a1 1 0 011.21-.5l4.49 1.5a1 1 0 01.68.95V19a2 2 0 01-2 2h-1C9.72 21 3 14.28 3 6V5z"
                  iconBg="bg-green-100 text-green-600"
                  label="ເບີໂທ" value="020 00000000"
                />
                <ContactInfo
                  icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  iconBg="bg-orange-100 text-orange-600"
                  label="ທີ່ຢູ່" value="ສະຖາບັນເຕັກໂນໂລຊີ ສຸດສະກະ, ນະຄອນຫຼວງວຽງຈັນ"
                />
                <ContactInfo
                  icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  iconBg="bg-purple-100 text-purple-600"
                  label="ເວລາ" value="ຈັນ - ສຸກ: 08:00 - 17:00"
                />
              </div>
            </div>

            {/* Map placeholder */}
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl border border-blue-200 h-48 flex items-center justify-center text-blue-700">
              <div className="text-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <p className="text-sm font-medium">ນະຄອນຫຼວງວຽງຈັນ, ສປປ ລາວ</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactInfo({ icon, iconBg, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d={icon}/></svg>
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-gray-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}
