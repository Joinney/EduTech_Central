// Cấu hình Key Cloudinary MỚI chuyên dùng cho Tệp/Tài liệu
const CLOUD_NAME = "j3iibkjc";
const UPLOAD_PRESET = "ml_default"; // Bạn nhớ tạo 1 Unsigned Upload Preset trên Cloudinary dashboard mới này (hoặc dùng preset mặc định)

export const uploadDocumentFile = async (file) => {
  if (!file) return null;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    // Lưu ý: resource_type là 'auto' hoặc 'raw' để Cloudinary nhận diện PDF/Word
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();
    if (data.secure_url) {
      return {
        url: data.secure_url,
        fileName: file.name,
        fileType: file.name.split(".").pop().toLowerCase(), // pdf, docx, doc...
      };
    } else {
      throw new Error(data.error?.message || "Lỗi upload file");
    }
  } catch (error) {
    console.error("Lỗi Upload Cloudinary Document:", error);
    alert("Không thể upload tệp tài liệu. Vui lòng kiểm tra lại!");
    return null;
  }
};