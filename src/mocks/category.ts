// Định nghĩa kiểu dữ liệu cho Category
export interface Category {
  id: number;
  created_at: Date;
  updated_at: Date;
  creator_id: string;
  modifier_id: string;
  slug: string;
  name_vi: string;
  name_en: string;
  order: number;
}

export const mockCategories: Category[] = [
  {
    id: 1,
    created_at: new Date("2025-11-10T10:00:00Z"),
    updated_at: new Date("2025-11-10T10:00:00Z"),
    creator_id: "6f7b8c9d-0e1f-4a2b-8c3d-5e4f6a7b8c9d",
    modifier_id: "6f7b8c9d-0e1f-4a2b-8c3d-5e4f6a7b8c9d",
    slug: "cong-nghe",
    name_vi: "Công Nghệ",
    name_en: "Technology",
    order: 1,
  },
  {
    id: 2,
    created_at: new Date("2025-11-10T10:05:00Z"),
    updated_at: new Date("2025-11-11T09:30:15Z"),
    creator_id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    modifier_id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    slug: "doi-song",
    name_vi: "Đời Sống & Văn Hóa",
    name_en: "Lifestyle & Culture",
    order: 2,
  },
  {
    id: 3,
    created_at: new Date("2025-11-10T10:10:00Z"),
    updated_at: new Date("2025-11-10T10:10:00Z"),
    creator_id: "6f7b8c9d-0e1f-4a2b-8c3d-5e4f6a7b8c9d",
    modifier_id: "6f7b8c9d-0e1f-4a2b-8c3d-5e4f6a7b8c9d",
    slug: "kinh-doanh",
    name_vi: "Kinh Doanh",
    name_en: "Business",
    order: 3,
  },
  {
    id: 4,
    created_at: new Date("2025-11-10T10:15:00Z"),
    updated_at: new Date("2025-11-11T08:45:00Z"),
    creator_id: "b2a3c4d5-f6e7-8b9a-0d1c-2f3e4d5c6b7a",
    modifier_id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    slug: "du-lich",
    name_vi: "Du Lịch",
    name_en: "Travel",
    order: 4,
  },
  {
    id: 5,
    created_at: new Date("2025-11-10T10:20:00Z"),
    updated_at: new Date("2025-11-10T10:20:00Z"),
    creator_id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    modifier_id: "b2a3c4d5-f6e7-8b9a-0d1c-2f3e4d5c6b7a",
    slug: "am-thuc",
    name_vi: "Ẩm Thực",
    name_en: "Food",
    order: 5,
  },
];
