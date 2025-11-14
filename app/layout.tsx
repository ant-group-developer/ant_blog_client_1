"use client";
import I18nProvider, { I18nContext } from "@/src/i18n-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider } from "antd";
import { NuqsAdapter } from "nuqs/adapters/next";
import { useState, useContext } from "react";
import enUS from "antd/locale/en_US";
import viVN from "antd/locale/vi_VN";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App as AntApp } from "antd";

type Props = { children: React.ReactNode };

export default function RootLayout({ children }: Props) {
  return (
    <html>
      <body>
        <I18nProvider>
          <LocaleWrapper>{children}</LocaleWrapper>
        </I18nProvider>
      </body>
    </html>
  );
}

function LocaleWrapper({ children }: Props) {
  const { locale } = useContext(I18nContext);

  // 👇 Tạo queryClient ngay trong component
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ConfigProvider
      locale={locale === "en" ? enUS : viVN}
      componentSize="middle"
    >
      <AntdRegistry>
        <AntApp>
          <NuqsAdapter>
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          </NuqsAdapter>
        </AntApp>
      </AntdRegistry>
    </ConfigProvider>
  );
}
