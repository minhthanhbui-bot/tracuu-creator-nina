/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Search, CheckCircle2, XCircle, Clock, ChevronRight, Loader2, AlertCircle, ExternalLink, User, Link as LinkIcon, Info, RefreshCw } from 'lucide-react';
import { TikTokAccount } from './data';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';
import headerImg from './header.png';

// Link Google Sheet CSV
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
          throw new Error('LỖI QUYỀN TRUY CẬP: Vui lòng kiểm tra xem bạn đã đổi quyền chia sẻ Sheet thành "Bất kỳ ai có liên kết" chưa.');
        }
        throw new Error(`Lỗi kết nối: ${response.status} ${response.statusText}`);
      }
      
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        header: false,
        skipEmptyLines: true,
        complete: (results) => {
          const rows = results.data as string[][];
          
          const parsedData: TikTokAccount[] = rows.slice(2).map(row => {
            return {
              accountName: row[4]?.trim() || '', // Cột E
              fullName: row[3]?.trim() || '',    // Cột D
              tiktokLink: row[16]?.trim() || '', // Cột Q
              isRegistered: row[0]?.trim().toUpperCase() === 'TRUE' || row[0]?.trim() === '1', // Cột A
              mcnStatus: row[20]?.trim() || '',  // Cột U
              approvalStatus: row[1]?.trim() || '' // Cột B
            };
          }).filter(item => item.accountName !== '');

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
      const { mockData } = await import('./data');
      setAllData(mockData);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    setHasSearched(true);
    const cleanSearchTerm = searchTerm.toLowerCase().trim().replace(/^@/, '');
    const found = allData.find(acc => {
      const cleanAccountName = acc.accountName.toLowerCase().trim().replace(/^@/, '');
      return cleanAccountName === cleanSearchTerm;
    });
    setSearchResult(found || null);
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('duyệt') || s.includes('thành công') || s.includes('connected') || s.includes('linked')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (s.includes('chờ') || s.includes('pending') || s.includes('requested')) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (s.includes('từ chối') || s.includes('không') || s.includes('not')) return 'bg-rose-100 text-rose-700 border-rose-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getStatusIcon = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('duyệt') || s.includes('thành công') || s.includes('connected') || s.includes('linked')) return <CheckCircle2 size={16} />;
    if (s.includes('chờ') || s.includes('pending') || s.includes('requested')) return <Clock size={16} />;
    if (s.includes('từ chối') || s.includes('không') || s.includes('not')) return <XCircle size={16} />;
    return <Info size={16} />;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-blue-100">
      {/* Header Image - Restored to top */}
      <header className="w-full bg-white shadow-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          <img 
            src={headerImg} 
            alt="Nina Ecom Center Header" 
            className="w-full h-auto block"
            referrerPolicy="no-referrer"
          />
        </div>
      </header>

      {/* Sub-header with Refresh button */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Search size={12} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Tra cứu trạng thái</span>
          </div>
          <button 
            onClick={fetchData}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-all"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Làm mới dữ liệu
          </button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Search Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 border border-slate-100">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 mb-2">Tra cứu tài khoản</h2>
                <p className="text-sm text-slate-500">Nhập Account Name TikTok của bạn để kiểm tra trạng thái đăng ký.</p>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-xs leading-relaxed"
                >
                  <div className="flex gap-3">
                    <AlertCircle size={16} className="shrink-0" />
                    <p>{error}</p>
                  </div>
                </motion.div>
              )}

              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Ví dụ: ninanguyen.com.vn"
                    disabled={loading}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all disabled:opacity-50"
                  />
                  {searchTerm && !loading && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <XCircle size={18} />
                    </button>
                  )}
                </div>

                <button
                  onClick={handleSearch}
                  disabled={loading || !searchTerm.trim()}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                  TRA CỨU NGAY
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <div className="flex items-start gap-3 text-slate-500">
                  <Info size={16} className="shrink-0 mt-0.5 text-blue-500" />
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-slate-700">Cách lấy Account Name:</p>
                    <p>Nếu link là: tiktok.com/<span className="text-blue-600 font-medium">@ninanguyen</span></p>
                    <p>Bạn chỉ cần nhập: <span className="text-blue-600 font-medium">ninanguyen</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Result Column */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {searchResult ? (
                <motion.div
                  key={searchResult.accountName}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden"
                >
                  {/* Result Header */}
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                        <User size={32} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold leading-tight">{searchResult.fullName}</h3>
                        <p className="text-blue-100 text-sm opacity-80">@{searchResult.accountName}</p>
                      </div>
                    </div>
                    <a 
                      href={searchResult.tiktokLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-medium backdrop-blur-sm transition-all border border-white/10"
                    >
                      <LinkIcon size={14} />
                      Xem hồ sơ TikTok
                      <ExternalLink size={12} />
                    </a>
                  </div>

                  {/* Result Body */}
                  <div className="p-8 space-y-8">
                    <div>
                      <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-6">Trạng thái chi tiết</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Registration Status */}
                        <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-3">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Đăng ký Form</p>
                          <div className="flex items-center gap-3">
                            {searchResult.isRegistered ? (
                              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                <CheckCircle2 size={18} />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center">
                                <XCircle size={18} />
                              </div>
                            )}
                            <span className={`font-bold text-sm ${searchResult.isRegistered ? 'text-emerald-700' : 'text-slate-500'}`}>
                              {searchResult.isRegistered ? 'ĐÃ HOÀN TẤT' : 'CHƯA ĐĂNG KÝ'}
                            </span>
                          </div>
                        </div>

                        {/* MCN Status */}
                        <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-3">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Liên kết MCN</p>
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${getStatusColor(searchResult.mcnStatus)}`}>
                            {getStatusIcon(searchResult.mcnStatus)}
                            {searchResult.mcnStatus || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Approval Status Section */}
                    <div className="pt-6 border-t border-slate-100">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Kết quả xét duyệt</p>
                          <p className="text-lg font-bold text-slate-900">Coaching 30.03 tại Nina Ecom Center</p>
                        </div>
                        <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl border text-sm font-bold shadow-sm ${getStatusColor(searchResult.approvalStatus)}`}>
                          {getStatusIcon(searchResult.approvalStatus)}
                          {searchResult.approvalStatus || 'Đang cập nhật'}
                        </div>
                      </div>
                    </div>

                    {/* Footer Note */}
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
                      <Info size={18} className="text-blue-500 shrink-0" />
                      <p className="text-xs text-blue-700 leading-relaxed">
                        Vui lòng có mặt đúng giờ và mang theo các thiết bị cần thiết nếu trạng thái của bạn là <b>Đã duyệt</b>.
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-300 bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Search size={40} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {hasSearched ? "Chưa có trong danh sách" : "Sẵn sàng tra cứu"}
                  </h3>
                  <p className="text-sm text-slate-500 max-w-xs">
                    {hasSearched 
                      ? "Chúng tôi không tìm thấy thông tin cho tài khoản này. Vui lòng kiểm tra lại chính xác Account Name." 
                      : "Nhập thông tin bên trái để xem kết quả xét duyệt và trạng thái liên kết MCN của bạn."}
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-4 py-12 border-t border-slate-200 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center text-white text-[10px] font-bold">N</div>
            <span className="text-[10px] font-bold uppercase tracking-widest">Nina Ecom Center</span>
          </div>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">
            © 2026 Nina Ecom Center. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-[10px] font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">Hỗ trợ</a>
            <a href="#" className="text-[10px] font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">Điều khoản</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
