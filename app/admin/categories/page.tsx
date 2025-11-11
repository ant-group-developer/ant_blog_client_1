"use client";

import { parseAsInteger, parseAsString } from "@/lib/parser/parser";
import { I18nContext } from "@/src/i18n-provider";
import { Category, mockCategories } from "@/src/mocks/category";
import { ProColumns, ProTable } from "@ant-design/pro-components";
import { Button } from "antd";
import { useTranslations } from "next-intl";
import { useQueryState } from "nuqs";
import { startTransition, useContext, useMemo } from "react";

export default function CategoriesPage() {
  const { locale, switchLocale } = useContext(I18nContext);
  const t = useTranslations();

  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(5)
  );
  const [name, setName] = useQueryState("name", parseAsString);

  const nameField = locale === "vi" ? "name_vi" : "name_en";

  const filterCategory = useMemo(() => {
    return mockCategories.filter((c) => {
      const filterName = name
        ? c[nameField].toLowerCase().includes(name.toLowerCase())
        : true;
      return filterName;
    });
  }, [name, nameField]);

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
      render: (_, entity) => entity.created_at.toLocaleDateString(),
      hideInSearch: true,
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
      pagination={{
        current: page,
        pageSize: pageSize,
        total: filterCategory.length,
        onChange: (p, ps) => {
          setPage(p);
          setPageSize(ps);
        },
      }}
      params={{ name }}
      onSubmit={(values) => {
        startTransition(() => {
          setName(values.name ?? null);
        });
      }}
      onReset={() => {
        setName(null);
      }}
      dataSource={filterCategory.slice((page - 1) * pageSize, page * pageSize)}
      toolBarRender={() => [
        <Button type="primary" key="switch" onClick={switchLocale}>
          {t("actions.switchLang")}
        </Button>,
      ]}
    />
  );
}
