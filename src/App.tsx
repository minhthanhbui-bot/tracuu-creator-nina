/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Search, MapPin, Mail, Phone, CheckSquare, Square, ChevronDown, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { TikTokAccount } from './data';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';
import headerImg from './header.png';

// Link Google Sheet CSV (Đã cập nhật ID từ link bạn cung cấp)
const DEFAULT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1pVBcHqnAKe0gabCKlIHAINyth-JYjCBDv1Kwmu6MzZ0/export?format=csv&gid=0';

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<TikTokAccount | null>(null);
  const [allData, setAllData] = useState<TikTokAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Hàm fetch dữ liệu từ Google Sheet
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(DEFAULT_SHEET_URL);
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('LỖI QUYỀN TRUY CẬP: Vui lòng kiểm tra xem bạn đã đổi quyền chia sẻ Sheet thành "Bất kỳ ai có liên kết" (Anyone with the link) chưa.');
        }
        throw new Error(`Lỗi kết nối: ${response.status} ${response.statusText}`);
      }
      
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        header: false,
        skipEmptyLines: true,
        complete: (results) => {
          const rows = results.data as string[][];
          
          // Dữ liệu bắt đầu từ dòng 3 (index 2)
          const parsedData: TikTokAccount[] = rows.slice(2).map(row => {
            // Log để debug (chỉ dành cho dev)
            // console.log('Row data:', row);
            
            return {
              accountName: row[4]?.trim() || '', // Cột E
              fullName: row[3]?.trim() || '',    // Cột D
              tiktokLink: row[16]?.trim() || '', // Cột Q
              isRegistered: row[0]?.trim().toUpperCase() === 'TRUE' || row[0]?.trim() === '1', // Cột A
              mcnStatus: row[20]?.trim() || '',  // Cột U
              approvalStatus: row[1]?.trim() || '' // Cột B
            };
          }).filter(item => item.accountName !== '');

          console.log('Dữ liệu đã tải (5 dòng đầu):', parsedData.slice(0, 5));

          if (parsedData.length === 0) {
            setError('Không tìm thấy dữ liệu hợp lệ trong Sheet. Vui lòng kiểm tra lại cấu trúc các cột.');
          }
          setAllData(parsedData);
          setLoading(false);
        },
        error: (err: any) => {
          console.error('PapaParse error:', err);
          throw new Error('Lỗi khi phân tích dữ liệu CSV.');
        }
      });

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Không thể kết nối với Google Sheet.');
      // Fallback về dữ liệu mẫu nếu lỗi
      const { mockData } = await import('./data');
      setAllData(mockData);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = () => {
    setHasSearched(true);
    const cleanSearchTerm = searchTerm.toLowerCase().trim().replace(/^@/, '');
    const found = allData.find(acc => {
      const cleanAccountName = acc.accountName.toLowerCase().trim().replace(/^@/, '');
      return cleanAccountName === cleanSearchTerm;
    });
    setSearchResult(found || null);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900">
      {/* Header Image */}
      <header className="w-full bg-white shadow-sm">
        <div className="max-w-7xl mx-auto">
          <img 
            src={headerImg} 
            alt="Nina Ecom Center Header" 
            className="w-full h-auto block"
            referrerPolicy="no-referrer"
          />
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Search */}
        <div className="lg:col-span-5 space-y-8">
          {error && (
            <div className="bg-amber-50 border-2 border-amber-500 p-4 space-y-3 text-amber-800 text-xs font-medium">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
                <button 
                  onClick={fetchData}
                  className="bg-amber-500 text-white px-2 py-1 rounded hover:bg-amber-600 transition-colors"
                >
                  Thử lại
                </button>
              </div>
              {error.includes('QUYỀN TRUY CẬP') && (
                <div className="pt-2 border-t border-amber-200 space-y-2">
                  <p className="font-bold underline">Hướng dẫn sửa lỗi:</p>
                  <ol className="list-decimal ml-4 space-y-1">
                    <li>Mở file Google Sheet của bạn.</li>
                    <li>Nhấn nút <b>Chia sẻ (Share)</b> ở góc trên bên phải.</li>
                    <li>Trong phần "Quyền truy cập chung", đổi thành <b>"Bất kỳ ai có liên kết"</b>.</li>
                    <li>Sau đó quay lại đây và tải lại trang.</li>
                  </ol>
                </div>
              )}
            </div>
          )}

          <div className="bg-blue-100 border-2 border-black p-6 text-center space-y-2">
            <h2 className="font-bold text-sm uppercase tracking-wide">
              NHẬP ĐÚNG ACCOUNT NAME TIKTOK VÀO Ô BÊN DƯỚI
            </h2>
            <div className="text-xs text-slate-700">
              <p className="font-bold">Hướng dẫn cách nhập</p>
              <p>Link tiktok của bạn: <span className="text-blue-600">https://www.tiktok.com/@ninanguyen.com.vn</span></p>
              <p>Chỉ cần nhập: <span className="font-bold">ninanguyen.com.vn</span></p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={loading ? "Đang tải dữ liệu..." : "Nhập account name..."}
                disabled={loading}
                className="w-full p-4 border-2 border-black text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100"
              />
              {searchTerm && !loading && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black"
                >
                  <AlertCircle size={20} className="rotate-45" />
                </button>
              )}
              {loading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Loader2 className="animate-spin text-blue-500" size={24} />
                </div>
              )}
            </div>

            <button
              onClick={handleSearch}
              disabled={loading || !searchTerm.trim()}
              className="w-full bg-black text-white p-4 font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:bg-slate-400"
            >
              <Search size={20} />
              TRA CỨU
            </button>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-7">
          <div className="border-2 border-black p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] min-h-[400px]">
            <AnimatePresence mode="wait">
              {searchResult ? (
                <motion.div
                  key={searchResult.accountName}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  {/* Name Row */}
                  <div className="flex items-stretch gap-4">
                    <div className="bg-blue-100 border-2 border-black px-6 py-3 flex items-center justify-center min-w-[120px] font-bold uppercase text-sm">
                      TÊN
                    </div>
                    <div className="flex-1 border-2 border-black px-6 py-3 text-lg font-medium flex items-center">
                      {searchResult.fullName}
                    </div>
                  </div>

                  {/* Link Row */}
                  <div className="flex items-stretch gap-4">
                    <div className="bg-blue-100 border-2 border-black px-6 py-3 flex items-center justify-center min-w-[120px] font-bold uppercase text-sm">
                      LINK TIKTOK
                    </div>
                    <div className="flex-1 border-2 border-black px-6 py-3 text-blue-600 underline flex items-center truncate">
                      <a href={searchResult.tiktokLink} target="_blank" rel="noopener noreferrer">
                        {searchResult.tiktokLink}
                      </a>
                    </div>
                  </div>

                  {/* Status Banner */}
                  <div className="bg-[#1e4b8a] text-white p-3 text-center font-bold uppercase text-xs tracking-wider">
                    TRẠNG THÁI ĐĂNG KÍ THAM GIA BUỔI COACHING VÀO 30.03 TẠI NINA ECOM CENTER
                  </div>

                  {/* Status Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    {/* Registered Form */}
                    <div className="space-y-4">
                      <div className="bg-blue-100 border-2 border-black p-2 text-center font-bold text-[10px] uppercase h-12 flex items-center justify-center">
                        ĐÃ ĐĂNG KÍ FORM
                      </div>
                      <div className="border-2 border-black p-2 flex items-center gap-2 bg-white h-12">
                        {searchResult.isRegistered ? (
                          <CheckSquare className="text-green-600" size={18} />
                        ) : (
                          <Square className="text-slate-300" size={18} />
                        )}
                        <span className="text-[10px] font-bold uppercase">
                          {searchResult.isRegistered ? 'ĐÃ ĐĂNG KÝ' : 'CHƯA ĐĂNG KÝ'}
                        </span>
                      </div>
                    </div>

                    {/* MCN Status */}
                    <div className="space-y-4">
                      <div className="bg-blue-100 border-2 border-black p-2 text-center font-bold text-[10px] uppercase h-12 flex items-center justify-center">
                        ĐÃ LIÊN KẾT MCN CHƯA
                      </div>
                      <div className="border-2 border-black p-2 flex items-center justify-between bg-[#fef3c7] h-12">
                        <span className="text-[10px] font-bold uppercase truncate">
                          {searchResult.mcnStatus}
                        </span>
                        <ChevronDown size={14} className="text-slate-600" />
                      </div>
                    </div>

                    {/* Approval Status */}
                    <div className="space-y-4">
                      <div className="bg-blue-100 border-2 border-black p-2 text-center font-bold text-[10px] uppercase h-12 flex items-center justify-center">
                        TRẠNG THÁI XÉT DUYỆT
                      </div>
                      <div className="border-2 border-black p-2 flex items-center justify-between bg-blue-50 h-12">
                        <span className="text-[10px] font-bold uppercase truncate">
                          {searchResult.approvalStatus}
                        </span>
                        <ChevronDown size={14} className="text-slate-600" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                  <Search size={48} strokeWidth={1} />
                  <p className="text-sm font-medium italic">
                    {hasSearched ? "Chưa có trong danh sách" : "Vui lòng nhập account name để tra cứu kết quả"}
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer / Info */}
      <footer className="max-w-6xl mx-auto p-8 text-center text-[10px] text-slate-500 uppercase tracking-widest">
        © 2026 NINA ECOM CENTER. ALL RIGHTS RESERVED.
      </footer>
    </div>
  );
}
