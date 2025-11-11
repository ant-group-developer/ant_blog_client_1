import { API_BASE_URL } from "@/api";
import Cookies from "js-cookie";

export interface User {
  id: string; // theo data thực tế UUID
  email: string;
  created_at: string;
  updated_at: string;
  status: boolean;

  // Thêm các trường meta
  creator_id: string;
  modifier_id: string;
  creator_name?: string;
  modifier_name?: string;
}

export interface UsersResponse {
  data: User[];
  total: number;
}

export const fetchUsers = async (params: {
  page: number;
  pageSize: number;
  email?: string | null;
}): Promise<UsersResponse> => {
  const query = new URLSearchParams({
    page: params.page.toString(),
    pageSize: params.pageSize.toString(),
    ...(params.email ? { email: params.email } : {}),
  });

  const token = Cookies.get("token");

  if (!token) {
    throw new Error("User not authenticated");
  }

  const res = await fetch(`${API_BASE_URL}/cms/users`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch users");
  }

  return res.json();
};

export const createUser = async (
  user: Omit<User, "id" | "created_at" | "updated_at">
): Promise<User> => {
  const token = Cookies.get("token");
  if (!token) throw new Error("User not authenticated");

  const res = await fetch(`${API_BASE_URL}/cms/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(user),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create user");
  }

  return res.json();
};

export const updateUser = async (
  id: string,
  user: Partial<Omit<User, "id" | "created_at" | "updated_at">>
): Promise<User> => {
  const token = Cookies.get("token");
  if (!token) throw new Error("User not authenticated");

  const res = await fetch(`${API_BASE_URL}/cms/users/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(user),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update user");
  }

  return res.json();
};
