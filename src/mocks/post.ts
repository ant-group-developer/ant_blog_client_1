export interface Post {
  id: number;
  created_at: Date;
  updated_at: Date;
  creator_id: number;
  modifier_id: string;
  category_id: number;
  slug: string;
  thumbnail: string;
  title_vi: string;
  title_en: string;
  description_vi: string;
  description_en: string;
  content_vi: string;
  content_en: string;
}

export const mockPost: Post[] = [
  {
    id: 101,
    created_at: new Date("2025-11-12T09:00:00Z"),
    updated_at: new Date("2025-11-12T09:00:00Z"),
    creator_id: 1, // Category Creator
    modifier_id: "6f7b8c9d-0e1f-4a2b-8c3d-5e4f6a7b8c9d",
    category_id: 1, // Công Nghệ
    slug: "dien-toan-luoc",
    thumbnail: "/img/post/cloud-comp.jpg",
    title_vi: "Điện toán đám mây: Xu hướng 2026",
    title_en: "Cloud Computing: 2026 Trends",
    description_vi:
      "Tổng quan về các dịch vụ đám mây mới nhất và dự báo. (Đây là đoạn tóm tắt)",
    description_en:
      "Overview of the latest cloud services and future forecast. (This is the excerpt)",
    content_vi:
      "Nội dung chi tiết về Công Nghệ, bao gồm AI, Big Data và Cloud Computing...",
    content_en:
      "Detailed content on Technology, including AI, Big Data and Cloud Computing...",
  },
  {
    id: 102,
    created_at: new Date("2025-11-12T09:10:00Z"),
    updated_at: new Date("2025-11-12T09:10:00Z"),
    creator_id: 2, // Category Creator
    modifier_id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    category_id: 2, // Đời Sống & Văn Hóa
    slug: "hanh-phuc-gia-dinh",
    thumbnail: "/img/post/family-life.jpg",
    title_vi: "Bí quyết xây dựng hạnh phúc gia đình",
    title_en: "Secrets to Building Family Happiness",
    description_vi:
      "Lời khuyên về giao tiếp và chia sẻ trong gia đình. (Đây là đoạn tóm tắt)",
    description_en:
      "Advice on communication and sharing in family life. (This is the excerpt)",
    content_vi:
      "Nội dung chi tiết về các hoạt động văn hóa và đời sống tinh thần...",
    content_en: "Detailed content on cultural activities and spiritual life...",
  },
  {
    id: 103,
    created_at: new Date("2025-11-12T09:20:00Z"),
    updated_at: new Date("2025-11-12T09:25:00Z"),
    creator_id: 3,
    modifier_id: "6f7b8c9d-0e1f-4a2b-8c3d-5e4f6a7b8c9d",
    category_id: 3, // Kinh Doanh
    slug: "tai-chinh-ca-nhan",
    thumbnail: "/img/post/personal-finance.jpg",
    title_vi: "Quản lý Tài chính Cá nhân hiệu quả",
    title_en: "Effective Personal Finance Management",
    description_vi:
      "Hướng dẫn lập ngân sách và đầu tư cơ bản. (Đây là đoạn tóm tắt)",
    description_en:
      "Guide to budgeting and basic investment. (This is the excerpt)",
    content_vi:
      "Nội dung chi tiết về các mô hình kinh doanh, khởi nghiệp và tài chính...",
    content_en: "Detailed content on business models, startup and finance...",
  },
  {
    id: 104,
    created_at: new Date("2025-11-12T09:30:00Z"),
    updated_at: new Date("2025-11-12T09:30:00Z"),
    creator_id: 2,
    modifier_id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    category_id: 4, // Du Lịch
    slug: "kham-pha-mientay",
    thumbnail: "/img/post/mekong-delta.jpg",
    title_vi: "Khám phá Miền Tây sông nước 4 ngày",
    title_en: "Discovering the Mekong Delta in 4 Days",
    description_vi:
      "Lịch trình chi tiết và các điểm đến không thể bỏ qua. (Đây là đoạn tóm tắt)",
    description_en:
      "Detailed itinerary and must-see destinations. (This is the excerpt)",
    content_vi:
      "Nội dung chi tiết về các địa điểm du lịch, mẹo và kinh nghiệm...",
    content_en:
      "Detailed content on travel destinations, tips, and experiences...",
  },
  {
    id: 105,
    created_at: new Date("2025-11-12T09:40:00Z"),
    updated_at: new Date("2025-11-12T09:40:00Z"),
    creator_id: 1,
    modifier_id: "b2a3c4d5-f6e7-8b9a-0d1c-2f3e4d5c6b7a",
    category_id: 5, // Ẩm Thực
    slug: "mon-chay-ngon",
    thumbnail: "/img/post/vegan-dish.jpg",
    title_vi: "5 món chay ngon và dễ làm tại nhà",
    title_en: "5 Delicious and Easy Vegetarian Dishes",
    description_vi:
      "Công thức chế biến các món chay phổ biến. (Đây là đoạn tóm tắt)",
    description_en:
      "Recipes for popular vegetarian dishes. (This is the excerpt)",
    content_vi:
      "Nội dung chi tiết về các công thức ẩm thực, review nhà hàng...",
    content_en: "Detailed content on culinary recipes, restaurant reviews...",
  },
];
