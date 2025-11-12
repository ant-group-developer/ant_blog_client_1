import { API_BASE_URL } from "@/api";
import Cookies from "js-cookie";

export interface UserMeta {
  id: string;
  email: string;
}

export interface Category {
  id: string;
  created_at: string; 
  updated_at: string; 
  creator_id: string;
  modifier_id: string;
  slug: string;
  name_vi: string;
  name_en: string;
  order: number;
  creator: UserMeta;
  modifier: UserMeta;
}

export interface CategoryResponse {
  data: Category[];
  total: number;
}

export const fetchCategory = async (params: {
  page: number;
  pageSize: number;
}): Promise<CategoryResponse> => {
  const query = new URLSearchParams({
    page: params.page.toString(),
    pageSize: params.pageSize.toString(),
  });

  const token = Cookies.get("token");

  if (!token) {
    throw new Error("User not authenticated");
  }

  const res = await fetch(
    `${API_BASE_URL}/cms/categories?${query.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => {});
    throw new Error(err.message || "Failed to fetch categories");
  }

  return res.json();
};
