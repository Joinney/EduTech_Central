import React from "react";
import { CheckCircle2, Clock, Hourglass, AlertTriangle, XCircle } from "lucide-react";

export const SCHOOL_OPTIONS = [
  "THPT Chuyên Lê Hồng Phong (TP.HCM)",
  "THPT Chuyên Trần Đại Nghĩa (TP.HCM)",
  "THPT Chuyên Hà Nội - Amsterdam",
  "THPT Chuyên Khoa học Tự nhiên",
  "THPT Nguyễn Thị Minh Khai",
  "THPT Chu Văn An (Hà Nội)",
  "Đại học Bách Khoa TP.HCM (HCMUT)",
  "Đại học Khoa học Tự nhiên (HCMUS)",
  "Đại học Công nghệ Thông tin (UIT)",
  "Đại học Bách Khoa Hà Nội (HUST)",
  "Đại học Kinh tế TP.HCM (UEH)",
  "Đại học Văn Lang",
  "Đại học FPT"
];

export const SUBJECT_OPTIONS = [
  "Toán Học",
  "Ngữ Văn",
  "Tiếng Anh",
  "Vật Lý",
  "Hóa Học",
  "Sinh Học",
  "Lịch Sử",
  "Địa Lý",
  "Tin Học",
  "Giáo Dục Kinh Tế & Pháp Luật",
  "Lập trình Web",
  "Khoa học Dữ liệu"
];

export const formatStatusBadge = (status, type) => {
  if (type === "school") {
    return status === "APPROVED" ? (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3" /> Đang Mở
      </span>
    ) : (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700 flex items-center gap-1">
        <Clock className="w-3 h-3" /> Tạm Dừng
      </span>
    );
  }

  switch (status) {
    case "APPROVED":
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Đã Phê Duyệt
        </span>
      );
    case "PENDING":
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 flex items-center gap-1 animate-pulse">
          <Hourglass className="w-3 h-3" /> Chờ Duyệt
        </span>
      );
    case "NEEDS_REVISION":
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Yêu Cầu Sửa
        </span>
      );
    case "REJECTED":
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 flex items-center gap-1">
          <XCircle className="w-3 h-3" /> Từ Chối
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
          {status}
        </span>
      );
  }
};