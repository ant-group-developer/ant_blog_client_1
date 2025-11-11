"use client";
import I18nProvider from "@/src/i18n-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider } from "antd";
import { NextIntlClientProvider } from "next-intl";
import { NuqsAdapter } from "nuqs/adapters/next";
import { useState } from "react";
import enUS from "antd/locale/en_US";
import viVn from "antd/locale/vi_VN";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App as AntApp } from "antd";

type Props = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: Props) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <html>
      <body>
        <ConfigProvider locale={enUS} componentSize="middle">
          <AntdRegistry>
            <AntApp>
              <I18nProvider>
                <NuqsAdapter>
                  <QueryClientProvider client={queryClient}>
                    {children}
                  </QueryClientProvider>
                </NuqsAdapter>
              </I18nProvider>
            </AntApp>
          </AntdRegistry>
        </ConfigProvider>
      </body>
    </html>
  );
}
