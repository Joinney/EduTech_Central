import React from 'react';
import { 
  Folder, 
  FileText, 
  MoreVertical, 
  Plus, 
  Filter, 
  Download, 
  Edit3, 
  Bookmark, 
  Library,
  ChevronLeft,
  ChevronRight,
  FileBadge2,
  Presentation,
  BookOpen
} from 'lucide-react';

export default function Bookshelf() {
  // Dữ liệu mẫu cho Bộ sưu tập
  const collections = [
    { id: 1, name: 'Khoa học Dữ liệu Cơ bản', count: 24, type: 'folder', color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { id: 2, name: 'Tài liệu Ôn thi Cuối kỳ', count: 12, type: 'folder', color: 'text-orange-500', bgColor: 'bg-orange-100' },
    { id: 3, name: 'Machine Learning Nâng cao', count: 8, type: 'file', color: 'text-slate-600', bgColor: 'bg-slate-200' },
  ];

  // Dữ liệu mẫu cho Tài liệu gần đây
  const recentDocs = [
    {
      id: 1,
      title: 'Kiến trúc Mạng Nơ-ron Tích chập (CNN) - Phần 1',
      meta: 'PDF - 2.4 MB',
      collection: 'Machine Learning Nâng cao',
      date: '22 Thg 10, 2024',
      icon: FileBadge2,
      iconColor: 'text-red-500',
      iconBg: 'bg-red-100',
      action: 'download'
    },
    {
      id: 2,
      title: 'Ghi chú bài giảng: Phân tích Dữ liệu Khám phá (EDA)',
      meta: 'Ghi chú cá nhân - 12 phút đọc',
      collection: 'Khoa học Dữ liệu Cơ bản',
      date: '20 Thg 10, 2024',
      icon: BookOpen,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-100',
      action: 'edit'
    },
    {
      id: 3,
      title: 'Slide: Giới thiệu về Transformer Models',
      meta: 'PPTX - 5.1 MB',
      collection: null,
      date: '18 Thg 10, 2024',
      icon: Presentation,
      iconColor: 'text-orange-500',
      iconBg: 'bg-orange-100',
      action: 'add'
    }
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800 font-sans">
      
      {/* HEADER TỔNG QUAN */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Thư viện cá nhân</h1>
          <p className="text-slate-500 text-sm">Quản lý tài liệu học tập, ghi chú và các bộ sưu tập của bạn.</p>
        </div>
        
        <div className="flex items-center gap-6 mt-4 md:mt-0">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">142</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tài liệu đã lưu</p>
          </div>
          <div className="w-px h-10 bg-slate-200"></div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-500">56</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ghi chú</p>
          </div>
          <div className="ml-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
              <Plus className="w-4 h-4" />
              Tạo Bộ Sưu Tập
            </button>
          </div>
        </div>
      </div>

      {/* BỘ SƯU TẬP CỦA TÔI */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-800">Bộ sưu tập của tôi</h2>
          </div>
          <a href="#" className="text-sm font-medium text-blue-600 hover:underline">Xem tất cả</a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {collections.map((col) => (
            <div key={col.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${col.bgColor}`}>
                  {col.type === 'folder' ? (
                    <Folder className={`w-6 h-6 ${col.color}`} />
                  ) : (
                    <FileText className={`w-6 h-6 ${col.color}`} />
                  )}
                </div>
                <button className="text-slate-400 hover:text-slate-600">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
              <h3 className="font-bold text-slate-800 leading-snug mb-2 flex-1">{col.name}</h3>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                {col.count} Tài liệu
              </p>
            </div>
          ))}

          {/* Card Tạo mới */}
          <div className="bg-slate-50/50 p-5 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/50 transition-colors cursor-pointer flex flex-col items-center justify-center text-slate-500 hover:text-blue-600 min-h-[160px]">
            <Plus className="w-8 h-8 mb-2 text-slate-400" />
            <span className="text-sm font-semibold">Tạo bộ sưu tập mới</span>
          </div>
        </div>
      </div>

      {/* TÀI LIỆU ĐÃ LƯU GẦN ĐÂY */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-800">Tài liệu đã lưu gần đây</h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
              <Filter className="w-4 h-4" />
              Lọc
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
              Mới nhất
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Tên tài liệu</th>
                  <th className="px-6 py-4 font-semibold">Bộ sưu tập</th>
                  <th className="px-6 py-4 font-semibold">Ngày lưu</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${doc.iconBg}`}>
                          <doc.icon className={`w-5 h-5 ${doc.iconColor}`} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{doc.title}</p>
                          <p className="text-xs text-slate-500 mt-1 font-medium">{doc.meta}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {doc.collection ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-semibold">
                          <Folder className="w-3 h-3" />
                          {doc.collection}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Chưa phân loại</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                      {doc.date}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3 text-slate-400">
                        {doc.action === 'download' && <button className="hover:text-blue-600"><Download className="w-4 h-4" /></button>}
                        {doc.action === 'edit' && <button className="hover:text-blue-600"><Edit3 className="w-4 h-4" /></button>}
                        {doc.action === 'add' && <button className="hover:text-blue-600"><Library className="w-4 h-4" /></button>}
                        <button className="hover:text-blue-600 text-slate-300">
                          <Bookmark className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
            <span className="text-sm text-slate-500 font-medium">Hiển thị 1-3 của 142 tài liệu</span>
            <div className="flex items-center gap-1">
              <button className="p-1 rounded hover:bg-slate-200 text-slate-400"><ChevronLeft className="w-5 h-5" /></button>
              <button className="w-8 h-8 rounded bg-blue-600 text-white text-sm font-bold flex items-center justify-center">1</button>
              <button className="w-8 h-8 rounded hover:bg-slate-200 text-slate-600 text-sm font-bold flex items-center justify-center">2</button>
              <span className="w-8 text-center text-slate-400">...</span>
              <button className="p-1 rounded hover:bg-slate-200 text-slate-600"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}