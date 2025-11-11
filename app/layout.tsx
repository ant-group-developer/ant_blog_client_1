import I18nProvider from "@/src/I18nProvider";
import { NextIntlClientProvider } from "next-intl";
import { NuqsAdapter } from "nuqs/adapters/next";

type Props = {
  children: React.ReactNode;
};

export default async function RootLayout({ children }: Props) {
  return (
    <html>
      <body>
        <I18nProvider>
          <NuqsAdapter>{children}</NuqsAdapter>
        </I18nProvider>
      </body>
    </html>
  );
}
