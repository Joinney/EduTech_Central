// Dùng chung instance Prisma từ config DB (tránh cạn kiệt connection)
const prisma = require('../configs/db.config');

const VANSAO_API_URL = 'https://school.vansao.com/api/v1/schools';
const GIST_THCS_URL =
  'https://gist.githubusercontent.com/ngoan98tv/b9111580b75562b45185f90d00e5b1ff/raw/truong_thcs_vn.json';

const SCHOOL_KEYWORDS = [
  'trường', 'mầm non', 'tiểu học', 'trung học', 'thcs', 'thpt', 
  'đại học', 'cao đẳng', 'trung cấp', 'nghề', 'school', 'academy', 
  'college', 'university', 'kindergarten'
];

const EXCLUDED_TYPES = [
  'road', 'highway', 'pedestrian', 'residential', 'service', 'track', 'unclassified',
  'house', 'building', 'apartments', 'isolated_dwelling',
  'administrative', 'boundary', 'suburb', 'neighbourhood', 'quarter', 'hamlet', 'village', 'town', 'city',
  'bus_stop', 'station', 'restaurant', 'cafe', 'bank', 'hospital', 'pharmacy', 'park'
];

// Memory Cache lưu danh sách trường
let vansaoSchoolsCache = null;
let gistSchoolsCache = null;

/**
 * 1. Fetch Vietnam Schools API (vansao.com) - Chuyên Đại học / Cao đẳng
 */
async function fetchVansaoSchools() {
  if (vansaoSchoolsCache) return vansaoSchoolsCache;

  try {
    const res = await fetch(VANSAO_API_URL);
    if (!res.ok) return [];

    const json = await res.json();
    const rawList = Array.isArray(json) ? json : (json.data || json.items || json.results || []);

    const parsedList = rawList
      .map((item, idx) => {
        const name = item.name || item.schoolName || item.title || '';
        return {
          id: `vansao_${item.id || item.code || idx}`,
          schoolName: name.trim(),
          level: 'university',
          provinceName: item.province || item.location || item.address || 'Việt Nam',
        };
      })
      .filter((s) => s.schoolName);

    vansaoSchoolsCache = parsedList;
    return parsedList;
  } catch (err) {
    console.warn('Lỗi fetch Vansao API (bỏ qua):', err.message);
    return [];
  }
}

/**
 * 2. Fetch GitHub Gist (ngoan98tv) - Chuyên THCS
 */
async function fetchGistSchools() {
  if (gistSchoolsCache) return gistSchoolsCache;

  try {
    const res = await fetch(GIST_THCS_URL);
    if (!res.ok) return [];

    const json = await res.json();
    const parsedList = [];

    for (const [province, districts] of Object.entries(json)) {
      if (typeof districts === 'object' && districts !== null) {
        for (const [district, schoolList] of Object.entries(districts)) {
          if (Array.isArray(schoolList)) {
            schoolList.forEach((rawName, index) => {
              const cleanName = rawName.replace(/\s*\([^\)]*\)/g, '').trim();
              if (cleanName) {
                parsedList.push({
                  id: `gist_${province}_${index}_${cleanName}`,
                  schoolName: cleanName,
                  level: 'secondary',
                  provinceName: province,
                });
              }
            });
          }
        }
      }
    }

    gistSchoolsCache = parsedList;
    return parsedList;
  } catch (err) {
    console.warn('Lỗi fetch Gist Schools (bỏ qua):', err.message);
    return [];
  }
}

/**
 * Kiếm tra tên trường có khớp với cấp học được yêu cầu hay không
 */
function matchesLevel(schoolName, targetLevel) {
  const name = schoolName.toLowerCase();
  
  if (targetLevel === 'university') {
    // Chỉ lấy Đại học, Cao đẳng, Học viện, Đại học Quốc gia...
    const isUni = name.includes('đại học') || name.includes('học viện') || name.includes('cao đẳng') || name.includes('university') || name.includes('college') || name.includes('academy');
    const isLowerSchool = name.includes('thpt') || name.includes('thcs') || name.includes('tiểu học') || name.includes('mầm non');
    return isUni && !isLowerSchool;
  }
  
  if (targetLevel === 'high_school') {
    // Chỉ lấy THPT / Cấp 3 / Chuyên
    const isHigh = name.includes('thpt') || name.includes('trung học phổ thông') || name.includes('cấp 3');
    const isUni = name.includes('đại học') || name.includes('học viện') || name.includes('cao đẳng');
    return isHigh && !isUni;
  }

  if (targetLevel === 'secondary') {
    // Chỉ lấy THCS / Cấp 2
    const isSec = name.includes('thcs') || name.includes('trung học cơ sở') || name.includes('cấp 2');
    const isUni = name.includes('đại học') || name.includes('học viện') || name.includes('cao đẳng');
    return isSec && !isUni;
  }

  if (targetLevel === 'primary') {
    // Chỉ lấy Tiểu học / Cấp 1
    const isPri = name.includes('tiểu học') || name.includes('cấp 1') || name.includes('primary');
    const isUni = name.includes('đại học') || name.includes('học viện') || name.includes('cao đẳng');
    return isPri && !isUni;
  }

  return true;
}

/**
 * GET /api/v1/schools/search?query=...&level=...
 * Tìm kiếm trường học Phân loại theo Cấp học
 */
exports.searchSchools = async (req, res) => {
  try {
    const { query, level } = req.query;
    const cleanQuery = (query || '').trim();
    const targetLevel = (level || '').trim().toLowerCase();

    if (!cleanQuery) {
      return res.status(200).json({ success: true, data: [] });
    }

    const lowerQuery = cleanQuery.toLowerCase();
    const existingNames = new Set();
    let schools = [];

    // ==========================================
    // 1. TÌM KIẾM TRONG CSDL POSTGRES LOCAL
    // ==========================================
    try {
      const whereCondition = {
        schoolName: {
          contains: cleanQuery,
          mode: 'insensitive',
        },
      };

      if (targetLevel) {
        whereCondition.level = targetLevel;
      }

      const dbSchools = await prisma.school.findMany({
        where: whereCondition,
        take: 10,
        select: {
          id: true,
          schoolName: true,
          level: true,
          provinceName: true,
        },
      });

      dbSchools.forEach((s) => {
        if (matchesLevel(s.schoolName, targetLevel)) {
          schools.push(s);
          existingNames.add(s.schoolName.toLowerCase());
        }
      });
    } catch (dbErr) {
      console.warn('Lỗi DB Postgres (bỏ qua):', dbErr.message);
    }

    // ==========================================
    // 2. NGUỒN ĐẠI HỌC / CAO ĐẲNG (Chỉ gọi khi level == university hoặc chưa lọc)
    // ==========================================
    if ((!targetLevel || targetLevel === 'university') && schools.length < 10) {
      const vansaoData = await fetchVansaoSchools();
      const matchedVansao = vansaoData.filter((s) =>
        s.schoolName.toLowerCase().includes(lowerQuery) && matchesLevel(s.schoolName, targetLevel)
      );

      for (const item of matchedVansao) {
        if (!existingNames.has(item.schoolName.toLowerCase())) {
          schools.push(item);
          existingNames.add(item.schoolName.toLowerCase());
        }
        if (schools.length >= 10) break;
      }
    }

    // ==========================================
    // 3. NGUỒN GITHUB GIST (Chỉ gọi khi level == secondary hoặc chưa lọc)
    // ==========================================
    if ((!targetLevel || targetLevel === 'secondary') && schools.length < 10) {
      const gistData = await fetchGistSchools();
      const matchedGist = gistData.filter((s) =>
        s.schoolName.toLowerCase().includes(lowerQuery) && matchesLevel(s.schoolName, targetLevel)
      );

      for (const item of matchedGist) {
        if (!existingNames.has(item.schoolName.toLowerCase())) {
          schools.push(item);
          existingNames.add(item.schoolName.toLowerCase());
        }
        if (schools.length >= 10) break;
      }
    }

    // ==========================================
    // 4. FALLBACK OPENSTREETMAP (NOMINATIM API)
    // ==========================================
    if (schools.length < 3) {
      try {
        let prefix = 'trường';
        if (targetLevel === 'university') prefix = 'đại học';
        else if (targetLevel === 'high_school') prefix = 'thpt';
        else if (targetLevel === 'secondary') prefix = 'thcs';
        else if (targetLevel === 'primary') prefix = 'tiểu học';

        const searchQuery = lowerQuery.includes(prefix)
          ? cleanQuery
          : `${prefix} ${cleanQuery}`;

        const osmUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          searchQuery
        )}&amenity=school&format=json&addressdetails=1&countrycodes=vn&limit=15`;

        const osmResponse = await fetch(osmUrl, {
          headers: {
            'User-Agent': 'EduTechCentralApp/1.0 (contact@edutech.vn)',
            'Accept-Language': 'vi',
          },
        });

        if (osmResponse.ok) {
          const osmData = await osmResponse.json();

          const osmSchools = osmData
            .filter((item) => {
              const category = (item.category || '').toLowerCase();
              const type = (item.type || '').toLowerCase();
              const name = (item.display_name || '').toLowerCase();
              const firstName = name.split(',')[0];

              if (EXCLUDED_TYPES.includes(type) || EXCLUDED_TYPES.includes(category)) {
                return false;
              }

              const hasSchoolKeyword = SCHOOL_KEYWORDS.some((kw) => firstName.includes(kw));
              return hasSchoolKeyword && matchesLevel(firstName, targetLevel);
            })
            .map((item) => {
              const address = item.address || {};
              const schoolName = item.display_name.split(',')[0].trim();

              return {
                id: `osm_${item.place_id}`,
                schoolName: schoolName,
                level: targetLevel || 'high_school',
                provinceName:
                  address.city ||
                  address.state ||
                  address.province ||
                  'Việt Nam',
              };
            });

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
      data: schools.slice(0, 10),
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