/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Camera,
  Sparkles,
  Save,
  ShieldCheck,
  GraduationCap,
  Award,
  CheckCircle2,
  Clock,
  Phone,
  BookOpen,
  Users,
  Briefcase,
  Loader2,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";

const API_AUTH_URL =
  import.meta.env.VITE_API_AUTH_URL || "http://localhost:8001/api/v1";
const API_COURSE_URL = "http://localhost:8002/api/v1";

export default function Profile() {
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // State hiển thị Mật khẩu
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State Mật khẩu
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Thống kê số lượng
  const [stats, setStats] = useState({ val1: 0, val2: 0 });

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [formData, setFormData] = useState({
    userId: storedUser.id || storedUser.id_users || null,
    fullName: storedUser.fullName || storedUser.full_name || "",
    email: storedUser.email || "",
    avatar: storedUser.avatar || "",
    phone: "",
    bio: "",
  });

  useEffect(() => {
    const fetchUserProfileAndStats = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");

        // 1. KÉO DATA TỪ BE NODEJS
        const res = await fetch(`${API_AUTH_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();

        if (res.ok && result.success) {
          const userData = result.data;
          const userRole = (userData.role || "student").toLowerCase();
          const uId = userData.id || userData.id_users;
          setRole(userRole);

          setFormData({
            userId: uId,
            fullName:
              userData.fullName ||
              userData.full_name ||
              storedUser.fullName ||
              storedUser.full_name ||
              "",
            email: userData.email || storedUser.email || "",
            avatar: userData.avatar || storedUser.avatar || "",
            phone: userData.phone || "",
            bio: userData.teacherProfile?.bio || userData.bio || "",
          });

          fetchRealtimeStats(uId, userRole);
        }
      } catch (err) {
        console.error("Lỗi lấy dữ liệu người dùng:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfileAndStats();
  }, []);

  const fetchRealtimeStats = async (uId, currentRole) => {
    try {
      if (currentRole === "teacher" || currentRole === "instructor") {
        const cRes = await fetch(`${API_COURSE_URL}/courses?teacher_id=${uId}`);
        const cData = await cRes.json();
        const totalCourses = cData.length || 0;
        const totalStudents = cData.reduce(
          (acc, curr) => acc + (curr.studentsCount || 0),
          0,
        );
        setStats({ val1: totalCourses, val2: totalStudents });
      } else {
        const sRes = await fetch(`${API_COURSE_URL}/students/${uId}/courses`);
        const sData = await sRes.json();
        const totalCourses = sData.length || 0;
        let totalLessons = 0;
        sData.forEach((c) => (totalLessons += c.lessons?.length || 0));
        const totalHours = Math.floor(totalLessons * 1.5);
        setStats({ val1: totalCourses, val2: totalHours });
      }
    } catch (error) {
      console.error("Lỗi thống kê:", error);
    }
  };

  const isTeacher = role === "teacher" || role === "instructor";

  // Xử lý hiển thị Tên tránh bị trống
  const fallbackName =
    storedUser.fullName ||
    storedUser.full_name ||
    (isTeacher ? "Giảng viên EduTech" : "Học viên EduTech");
  const displayName = formData.fullName || fallbackName;

  const getInitials = (name) => {
    if (!name) return isTeacher ? "GV" : "EC";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return parts
      .map((p) => p[0])
      .join("")
      .substring(0, 3)
      .toUpperCase();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () =>
        setFormData((prev) => ({ ...prev, avatar: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  // HÀM SUBMIT GỘP TẤT CẢ TRONG 1 NÚT BẤM
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const token = localStorage.getItem("token");

      // 1. CẬP NHẬT THÔNG TIN CÁ NHÂN
      const profileRes = await fetch(`${API_AUTH_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          avatar: formData.avatar,
          phone: formData.phone,
          bio: formData.bio,
        }),
      });
      const profileResult = await profileRes.json();
      if (!profileRes.ok || !profileResult.success)
        throw new Error(profileResult.message || "Cập nhật hồ sơ thất bại");

      // Cập nhật LocalStorage
      const updatedUser = { ...storedUser, ...profileResult.data };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("user-profile-updated"));

      // 2. CẬP NHẬT MẬT KHẨU (NẾU CÓ NHẬP VÀO)
      if (passwordData.oldPassword || passwordData.newPassword) {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
          throw new Error("Mật khẩu mới và xác nhận không khớp!");
        }

        const passRes = await fetch(`${API_AUTH_URL}/auth/change-password`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            oldPassword: passwordData.oldPassword,
            newPassword: passwordData.newPassword,
          }),
        });
        const passResult = await passRes.json();
        if (!passRes.ok || !passResult.success)
          throw new Error(passResult.message || "Đổi mật khẩu thất bại");

        // Reset ô mật khẩu sau khi đổi thành công
        setPasswordData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }

      alert("Lưu thay đổi thành công!");
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading && !formData.fullName) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 font-sans">
      {/* 1. Header Banner Profile */}
      <div
        className={`relative rounded-3xl p-6 md:p-8 text-white overflow-hidden shadow-xl transition-colors ${
          isTeacher
            ? "bg-gradient-to-r from-slate-900 via-orange-950 to-amber-900 border border-orange-500/20"
            : "bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900"
        }`}
      >
        <div
          className={`absolute -right-10 -bottom-10 w-64 h-64 rounded-full blur-3xl pointer-events-none ${isTeacher ? "bg-orange-500/15" : "bg-blue-500/10"}`}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
            <div className="relative group">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-white/20 bg-slate-800 shadow-2xl overflow-hidden flex items-center justify-center shrink-0">
                {formData.avatar ? (
                  <img
                    src={formData.avatar}
                    alt={displayName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      if (e.target.nextSibling)
                        e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className={`w-full h-full font-black text-2xl items-center justify-center text-white ${formData.avatar ? "hidden" : "flex"} ${isTeacher ? "bg-gradient-to-br from-orange-500 to-amber-500" : "bg-gradient-to-br from-blue-600 to-cyan-500"}`}
                >
                  {getInitials(displayName)}
                </div>
              </div>
              <label
                htmlFor="avatar-upload"
                className={`absolute bottom-1 right-1 p-2 text-white rounded-full shadow-lg cursor-pointer transition-transform hover:scale-110 active:scale-95 border-2 border-white ${isTeacher ? "bg-orange-600 hover:bg-orange-700" : "bg-orange-500 hover:bg-orange-600"}`}
              >
                <Camera className="w-4 h-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <h1 className="text-xl md:text-2xl font-black text-white">
                  {displayName}
                </h1>
                <span
                  className={`p-1 rounded-full border ${isTeacher ? "bg-orange-500/20 text-amber-300 border-amber-400/30" : "bg-blue-500/20 text-cyan-300 border-cyan-400/30"}`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>

              {/* Đã bỏ Mã Học Viên, hiển thị Lớp 12A1 tĩnh */}
              <p
                className={`text-xs font-medium ${isTeacher ? "text-orange-200" : "text-blue-200"}`}
              >
                {isTeacher ? (
                  <>
                    Tài khoản Giảng viên •{" "}
                    <span className="font-bold text-amber-300">
                      Hệ thống EduTech
                    </span>
                  </>
                ) : (
                  <>
                    Tài khoản Học viên • Lớp:{" "}
                    <span className="font-bold text-amber-300">12A1</span>
                  </>
                )}
              </p>

              <div className="pt-1 flex flex-wrap justify-center md:justify-start gap-2">
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Đã xác thực</span>
                </span>
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Sparkles className="w-3 h-3" />
                  <span>{isTeacher ? "Giảng viên Pro" : "Học viên Pro"}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10">
            <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-300 border border-amber-400/30">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p
                className={`text-[10px] uppercase tracking-wider font-extrabold ${isTeacher ? "text-orange-200" : "text-blue-200"}`}
              >
                {isTeacher ? "Đánh giá Giảng dạy" : "Điểm rèn luyện"}
              </p>
              <p className="text-lg font-black text-amber-300">
                {isTeacher ? "4.9 / 5.0 ⭐" : "1,250 Points"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Body Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CỘT TRÁI (THỐNG KÊ THẬT) */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              {isTeacher ? (
                <>
                  <Briefcase className="w-4 h-4 text-orange-600" />
                  <span>Tổng quan giảng dạy</span>
                </>
              ) : (
                <>
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>Tổng quan học tập</span>
                </>
              )}
            </h3>

            <div className="space-y-3">
              {isTeacher ? (
                <>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          Khóa học phụ trách
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          Hệ thống EduTech
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-orange-600">
                      {stats.val1} Khóa
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          Tổng số Học viên
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          Đang theo học
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-emerald-600">
                      {stats.val2} Học viên
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          Môn học đăng ký
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          Khóa học EduTech
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-blue-600">
                      {stats.val1} Môn
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          Thời lượng học
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          Tính theo giờ
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-emerald-600">
                      {stats.val2} Giờ
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div
            className={`rounded-3xl p-5 border space-y-2 ${isTeacher ? "bg-gradient-to-br from-orange-50 to-amber-50/50 border-orange-200" : "bg-gradient-to-br from-blue-50 to-indigo-50/50 border-blue-100"}`}
          >
            <div
              className={`flex items-center space-x-2 font-extrabold text-xs ${isTeacher ? "text-orange-700" : "text-blue-700"}`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Ghi chú bảo mật</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Email của bạn là định danh duy nhất trên hệ thống nên không thể tự
              thay đổi. Vui lòng liên hệ Admin nếu cần hỗ trợ.
            </p>
          </div>
        </div>

        {/* CỘT PHẢI: FORM GỘP CHUNG (ĐÃ SẮP XẾP LẠI THEO YÊU CẦU UX) */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden"
          >
            {/* Header Form (Đã bỏ nút ở đây) */}
            <div className="px-6 py-5 md:px-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Hồ sơ & Bảo mật
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Cập nhật thông tin định danh và đổi mật khẩu tài khoản.
                </p>
              </div>
            </div>

            {/* Nội dung Grid chung */}
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                {/* Dòng 1: Họ tên (Full width) */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Họ và tên
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 transition ${isTeacher ? "focus:ring-orange-500/20 focus:border-orange-500" : "focus:ring-blue-500/20 focus:border-blue-500"}`}
                      required
                    />
                  </div>
                </div>

                {/* Dòng 2: Email & SĐT */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Địa chỉ Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Số điện thoại
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="Nhập số điện thoại"
                      className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 transition ${isTeacher ? "focus:ring-orange-500/20 focus:border-orange-500" : "focus:ring-blue-500/20 focus:border-blue-500"}`}
                    />
                  </div>
                </div>

                {/* Dòng 3: Đổi mật khẩu (CÓ CON MẮT) */}
                <div className="space-y-1.5 md:col-span-2 mt-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Mật khẩu hiện tại{" "}
                    <span className="text-[10px] text-slate-400 font-normal lowercase">
                      (Bỏ trống nếu không đổi)
                    </span>
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showOldPassword ? "text" : "password"}
                      value={passwordData.oldPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          oldPassword: e.target.value,
                        })
                      }
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showOldPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                      placeholder="••••••••"
                      className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Nhập lại mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="••••••••"
                      className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Dòng 4: Giới thiệu (Full width) - NẰM CUỐI CÙNG TRƯỚC NÚT LƯU */}
                <div className="space-y-1.5 md:col-span-2 mt-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Giới thiệu ngắn (Tiểu sử)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    className={`w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 transition resize-none ${isTeacher ? "focus:ring-orange-500/20 focus:border-orange-500" : "focus:ring-blue-500/20 focus:border-blue-500"}`}
                    placeholder="Vài dòng giới thiệu về bản thân bạn..."
                  />
                </div>
              </div>

              {/* NÚT LƯU Ở GÓC PHẢI DƯỚI */}
              <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`flex items-center space-x-2 px-8 py-3 rounded-xl text-white font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer ${
                    isTeacher
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 shadow-orange-500/20"
                      : "bg-blue-600 shadow-blue-500/20"
                  }`}
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Lưu hồ sơ</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
