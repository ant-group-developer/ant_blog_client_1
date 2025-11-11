"use client";

import { Category, fetchCategory } from "@/api/category";
import { parseAsInteger, parseAsString } from "@/lib/parser/parser";
import { I18nContext } from "@/src/i18n-provider";
import { ProColumns, ProTable } from "@ant-design/pro-components";
import { App, Button } from "antd";
import { useTranslations } from "next-intl";
import { useQueryState } from "nuqs";
import { startTransition, useContext, useMemo, useEffect } from "react";
import "@ant-design/v5-patch-for-react-19";
import { useQuery } from "@tanstack/react-query";

export default function CategoriesPage() {
  const { message } = App.useApp();
  const { locale, switchLocale } = useContext(I18nContext);
  const t = useTranslations();

  // Query state for URL
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(10)
  );
  const [name, setName] = useQueryState("name", parseAsString);

  const nameField = locale === "vi" ? "name_vi" : "name_en";

  // Fetch categories
  const { data, isLoading, isError } = useQuery({
    queryKey: ["categories", page, pageSize],
    queryFn: () => fetchCategory({ page, pageSize }),
  });

  useEffect(() => {
    if (isError) {
      message.error(t("category.messages.fetchFailed"));
    }
  }, [isError, message, t]);

  // Filter client-side giống UserPage search
  const filteredData = useMemo(() => {
    return (
      data?.data.filter((c) => {
        if (!name) return true;
        return c[nameField].toLowerCase().includes(name.toLowerCase());
      }) ?? []
    );
  }, [data, name, nameField]);

  const columns: ProColumns<Category>[] = [
    {
      title: t("category.columns.id"),
      dataIndex: "id",
      hideInSearch: true,
      hideInForm: true,
      width: 80,
    },
    {
      title: t("category.columns.name"),
      dataIndex: nameField,
      key: "name",
    },
    {
      title: t("category.columns.created_at"),
      dataIndex: "created_at",
      hideInSearch: true,
      render: (_, record) => new Date(record.created_at).toLocaleString(),
    },
    {
      title: t("category.columns.slug"),
      dataIndex: "slug",
      hideInSearch: true,
    },
    {
      title: t("category.columns.order"),
      dataIndex: "order",
      hideInSearch: true,
    },
  ];

  return (
    <ProTable<Category>
      headerTitle={t("category.title")}
      columns={columns}
      rowKey="id"
      search={{ labelWidth: "auto" }}
      loading={isLoading}
      pagination={{
        current: page,
        pageSize,
        total: filteredData.length,
        onChange: (p, ps) => {
          setPage(p);
          setPageSize(ps);
        },
      }}
      params={{ name }}
      onSubmit={(values) => {
        startTransition(() => {
          setName(values.name ?? null);
          setPage(1); // reset page on search
        });
      }}
      onReset={() => {
        setName(null);
        setPage(1);
      }}
      dataSource={filteredData.slice((page - 1) * pageSize, page * pageSize)}
      toolBarRender={() => [
        <Button type="primary" key="switch" onClick={switchLocale}>
          {t("actions.switchLang")}
        </Button>,
      ]}
    />
  );
}
