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

export type UpdateCategoryInput = {
  name_en: string;
  name_vi: string;
  slug: string;
  order: number;
};

export type CategoryOrderInput = {
  order: number;
};

// Fetch categories
export const fetchCategory = async (params: {
  page: number;
  pageSize: number;
}): Promise<CategoryResponse> => {
  const query = new URLSearchParams({
    page: params.page.toString(),
    pageSize: params.pageSize.toString(),
  });

  const token = Cookies.get("token");
  if (!token) throw new Error("User not authenticated");

  const res = await fetch(`${API_BASE_URL}/cms/categories`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch categories");
  }

  return res.json();
};

export const createCategory = async (data: {
  name_en: string;
  name_vi: string;
  slug: string;
  order: number;
}): Promise<Category> => {
  const token = Cookies.get("token");
  if (!token) throw new Error("User not authenticated");

  const res = await fetch(`${API_BASE_URL}/cms/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create category");
  }

  return res.json();
};

export const updateCategory = async (
  id: string,
  data: {
    name_en: string;
    name_vi: string;
    slug: string;
    order: number;
  }
): Promise<Category> => {
  const token = Cookies.get("token");
  if (!token) throw new Error("User not authenticated");

  const res = await fetch(`${API_BASE_URL}/cms/categories/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update category");
  }

  return res.json();
};

export const updateCategoryOrder = async (data: {
  id: string;
  order: number;
}): Promise<Category> => {
  const token = Cookies.get("token");
  if (!token) throw new Error("User not authenticated");

  const res = await fetch(`${API_BASE_URL}/cms/categories/order`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update category");
  }

  return res.json();
};

export const deleteCategory = async (
  id: string
): Promise<{ message: string }> => {
  const token = Cookies.get("token");
  if (!token) throw new Error("User not authenticated");

  const res = await fetch(`${API_BASE_URL}/cms/categories/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to delete category");
  }

  return res.json();
};
