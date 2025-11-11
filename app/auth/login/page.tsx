// src/app/auth/login/page.tsx
"use client";

import {
  ProForm,
  ProFormText,
  ProFormCheckbox,
} from "@ant-design/pro-components";
import { Button, message } from "antd";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Cookies from "js-cookie";
import "@ant-design/v5-patch-for-react-19";
import { API_BASE_URL } from "@/api";
import { APP_ROUTES } from "@/enums/routes";

interface LoginValues {
  email: string;
  password: string;
  remember: boolean;
}

interface LoginResponse {
  statusCode: number;
  message: string;
  data: {
    access_token: string;
    email: string;
  };
  timestamp: string;
}

// Hàm gọi API login
const loginApi = async (values: LoginValues): Promise<LoginResponse> => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
    credentials: "include", // backend có thể cần
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Login failed");
  return data as LoginResponse;
};

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations("login");

  // message hook
  const [msgApi, contextHolder] = message.useMessage();

  const mutation = useMutation<LoginResponse, Error, LoginValues>({
    mutationFn: async (values) => {
      const loginData = await loginApi(values);

      // Lấy access_token
      const token = loginData.data?.access_token;
      if (!token) throw new Error("Token not returned from API");

      // Lưu cookie client-side hoặc localStorage
      Cookies.set("token", token, { expires: 1, path: "/" });
      // localStorage.setItem("token", token);

      return loginData;
    },
    onSuccess: () => {
      msgApi.success(t("loginSuccess"));
      router.push(APP_ROUTES.USER);
    },
    onError: (error) => {
      msgApi.error(error.message || t("loginFailed"));
    },
  });

  return (
    <div style={{ maxWidth: 400, margin: "50px auto" }}>
      {contextHolder}
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>{t("title")}</h2>

      <ProForm<LoginValues>
        onFinish={(values) => mutation.mutate(values)}
        submitter={{
          render: (props) => (
            <Button type="primary" onClick={() => props.form?.submit?.()}>
              {t("title")}
            </Button>
          ),
        }}
      >
        <ProFormText
          name="email"
          label="Email"
          placeholder={t("emailRequired")}
          rules={[
            { required: true, message: t("emailRequired") },
            { type: "email", message: "Enter a valid email" },
          ]}
        />

        <ProFormText.Password
          name="password"
          label="Password"
          placeholder={t("passwordRequired")}
          rules={[{ required: true, message: t("passwordRequired") }]}
        />

        <ProFormCheckbox name="remember">Remember me</ProFormCheckbox>
      </ProForm>
    </div>
  );
}
