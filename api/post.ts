import { API_BASE_URL } from "@/api";
import Cookies from "js-cookie";

export interface Category {
  id: string;
  slug: string;
  name_vi: string;
  name_en: string;
  order: number;
}

export interface UserMeta {
  id: string;
  email: string;
}

export interface Post {
  id: string;
  created_at: string;
  updated_at: string;
  creator_id: string;
  modifier_id: string;
  category_id: string;
  slug: string;
  thumbnail: string | null;
  title_vi: string;
  title_en: string;
  description_vi: string;
  description_en: string;
  content_vi: string;
  content_en: string;
  categories: Category;
  users_posts_creator_idTousers: UserMeta;
  users_posts_modifier_idTousers: UserMeta;
}

export interface PostResponse {
  data: Post[];
  total: number;
}

export const fetchPosts = async (params: {
  page: number;
  pageSize: number;
}): Promise<PostResponse> => {
  const query = new URLSearchParams({
    page: params.page.toString(),
    pageSize: params.pageSize.toString(),
  });

  const token = Cookies.get("token");

  if (!token) {
    throw new Error("User not authenticated");
  }

  const res = await fetch(`${API_BASE_URL}/cms/posts`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => {});
    throw new Error(err.message || "Failed to fetch posts");
  }

  return res.json();
};
