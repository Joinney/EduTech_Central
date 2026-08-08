const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * GET /api/v1/schools/search?query=...&level=...
 * Tìm kiếm trường học từ Database + OpenStreetMap
 */
exports.searchSchools = async (req, res) => {
  try {
    const { query, level } = req.query;
    const cleanQuery = (query || '').trim();

    if (!cleanQuery) {
      return res.status(200).json({ success: true, data: [] });
    }

    // 1. Tìm kiếm trong Database Postgres trước
    const whereCondition = {
      schoolName: {
        contains: cleanQuery,
        mode: 'insensitive', // Không phân biệt hoa thường
      },
    };

    if (level && level.trim() !== '') {
      whereCondition.level = level.trim();
    }

    let schools = await prisma.school.findMany({
      where: whereCondition,
      take: 10,
      select: {
        id: true,
        schoolName: true,
        level: true,
        provinceName: true,
      },
    });

    // 2. Nếu Database chưa có đủ dữ liệu, fallback tìm từ OpenStreetMap (Nominatim API)
    if (schools.length < 3) {
      try {
        const osmUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          cleanQuery
        )}&format=json&addressdetails=1&countrycodes=vn&limit=10`;

        const osmResponse = await fetch(osmUrl, {
          headers: {
            'User-Agent': 'EduTechCentralApp/1.0 (contact@edutech.vn)',
            'Accept-Language': 'vi',
          },
        });

        if (osmResponse.ok) {
          const osmData = await osmResponse.json();

          const osmSchools = osmData.map((item) => {
            const address = item.address || {};
            const schoolName = item.display_name.split(',')[0];

            return {
              id: `osm_${item.place_id}`,
              schoolName: schoolName,
              level: level || 'high_school',
              provinceName:
                address.city ||
                address.state ||
                address.province ||
                'Việt Nam',
            };
          });

          // Gộp kết quả và loại bỏ trùng lặp tên trường
          const existingNames = new Set(schools.map((s) => s.schoolName.toLowerCase()));
          for (const osmSchool of osmSchools) {
            if (!existingNames.has(osmSchool.schoolName.toLowerCase())) {
              schools.push(osmSchool);
              existingNames.add(osmSchool.schoolName.toLowerCase());
            }
          }
        }
      } catch (osmError) {
        console.warn('Lỗi gọi OpenStreetMap API (bỏ qua):', osmError.message);
      }
    }

    return res.status(200).json({
      success: true,
      data: schools.slice(0, 10), // Trả về tối đa 10 kết quả
    });
  } catch (error) {
    console.error('Lỗi searchSchools:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi tìm kiếm trường học!',
      error: error.message,
    });
  }
};