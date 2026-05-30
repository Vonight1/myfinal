import { Link, useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="text-center max-w-md">
        {/* Big 404 */}
        <div className="relative mb-6">
          <h1 className="text-9xl md:text-[12rem] font-black text-blue-600/10 select-none leading-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-600/30">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
            </div>
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-3">
          ບໍ່ພົບໜ້າທີ່ຊອກຫາ
        </h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          ໜ້ານີ້ອາດຖືກລົບ, ປ່ຽນ URL, ຫຼື ບໍ່ເຄີຍມີ.
          <br />
          ກະລຸນາກວດສອບ URL ອີກຄັ້ງ ຫຼື ກັບໄປໜ້າຫຼັກ
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="bg-white text-gray-700 border border-gray-200 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            ກັບຄືນ
          </button>
          <Link
            to="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            ໜ້າຫຼັກ
          </Link>
        </div>

        {/* Suggestions */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">ຫຼື ລອງ:</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link to="/jobs" className="text-sm bg-blue-50 text-blue-700 border border-blue-200 px-4 py-2 rounded-full font-medium hover:bg-blue-100 transition-all">
              ຊອກວຽກ
            </Link>
            <Link to="/companies" className="text-sm bg-purple-50 text-purple-700 border border-purple-200 px-4 py-2 rounded-full font-medium hover:bg-purple-100 transition-all">
              ບໍລິສັດ
            </Link>
            <Link to="/about" className="text-sm bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-full font-medium hover:bg-green-100 transition-all">
              ກ່ຽວກັບເຮົາ
            </Link>
            <Link to="/contact" className="text-sm bg-orange-50 text-orange-700 border border-orange-200 px-4 py-2 rounded-full font-medium hover:bg-orange-100 transition-all">
              ຕິດຕໍ່
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
