import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="bg-gradient-to-b from-blue-50/50 to-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex w-16 h-16 bg-blue-600 rounded-2xl items-center justify-center mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">ກ່ຽວກັບເຮົາ</h1>
          <p className="text-lg text-gray-500 mt-2">ແພລດຟອມຊອກວຽກ Part-time ໃນ ສປປ ລາວ</p>
        </div>

        {/* Mission */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">ພາລະກິດຂອງເຮົາ</h2>
          <p className="text-gray-600 leading-relaxed">
            <strong>PartTime Job Laos</strong> ເປັນແພລດຟອມທີ່ສ້າງຂຶ້ນເພື່ອເຊື່ອມໂຍງ
            <strong> ນັກສຶກສາ, ຄົນຮຸ່ນໃໝ່, ແລະ ຜູ້ທີ່ມີເວລາວ່າງ</strong> ກັບ
            ບໍລິສັດທີ່ຕ້ອງການແຮງງານ Part-time ໃນ ສປປ ລາວ.
            ເຮົາເຊື່ອວ່າທຸກຄົນຄວນມີໂອກາດໃນການຫາລາຍໄດ້ເສີມ ແລະ ປະສົບການເຮັດວຽກ.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            </div>
            <h3 className="font-bold text-gray-800 mb-1">ຊອກວຽກງ່າຍ</h3>
            <p className="text-sm text-gray-500">ກອງວຽກຕາມໝວດໝູ່, ສະຖານທີ່, ເງິນເດືອນ</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h3 className="font-bold text-gray-800 mb-1">ປອດໄພ</h3>
            <p className="text-sm text-gray-500">ບໍລິສັດຕ້ອງຜ່ານການກວດສອບຈາກ Admin</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
            <h3 className="font-bold text-gray-800 mb-1">ໄວ</h3>
            <p className="text-sm text-gray-500">ສະໝັກວຽກໄດ້ໃນບໍ່ເຖິງ 1 ນາທີ</p>
          </div>
        </div>

        {/* Team */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">ທີມງານພັດທະນາ</h2>
          <p className="text-sm text-gray-500 mb-6">ນັກສຶກສາສະຖາບັນເຕັກໂນໂລຊີ ສຸດສະກະ - ຮຸ່ນທີ 09</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {['ສຸກຈະເລີນ ຈະເລີນຜົນ', 'ສິດທິພອນ ສຸພັນໄຄສີ', 'ໄພປະດິດ ສຸຂະທຳມະວົງ'].map((name, i) => (
              <div key={i} className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {name.split(' ')[0]?.[0]}
                </div>
                <p className="text-sm font-semibold text-gray-800">{name}</p>
                <p className="text-xs text-gray-500 mt-1">Full-stack Developer</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">ພ້ອມເລີ່ມຕົ້ນບໍ່?</h2>
          <p className="text-blue-100 mb-4">ສະໝັກສະມາຊິກໃນຄ່ຳວາງ ແລະຄົ້ນພົບໂອກາດໃໝ່ໆ</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/register" className="bg-white text-blue-700 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all">
              ສະໝັກສະມາຊິກ
            </Link>
            <Link to="/jobs" className="bg-blue-500 text-white border border-blue-400 px-6 py-3 rounded-xl font-bold hover:bg-blue-400 transition-all">
              ເບິ່ງວຽກ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
