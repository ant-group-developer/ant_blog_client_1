"use client";

import { parseAsInteger, parseAsString } from "@/lib/parser/parser";
import { I18nContext } from "@/src/i18n-provider";
import { mockPost, Post } from "@/src/mocks/post";
import { Category, mockCategories } from "@/src/mocks/category";
import { mockUsers, User } from "@/src/mocks/users";
import { ProColumns, ProTable } from "@ant-design/pro-components";
import { Button } from "antd";
import { useTranslations } from "next-intl";
import { useQueryState } from "nuqs";
import { startTransition, useContext, useMemo } from "react";

export default function PostPage() {
  const { locale, switchLocale } = useContext(I18nContext);
  const t = useTranslations();

  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(5)
  );
  const [title, setTitle] = useQueryState("title", parseAsString);
  const titleField = locale === "vi" ? "title_vi" : "title_en";
  const descriptionField =
    locale === "vi" ? "description_vi" : "description_en";

  const getCategoryNameById = (id: number): string => {
    const category = mockCategories.find((cat) => cat.id === id);
    if (!category) return t("No category");

    return locale === "vi" ? category.name_vi : category.name_en;
  };

  const getUserEmailById = (id: number): string => {
    const user = mockUsers.find((u) => u.id === id);
    if (!user) return t("No user");

    return user.email;
  };

  const filterPostByTitle = useMemo(() => {
    return mockPost.filter((p) => {
      const filterTitle = title
        ? p[titleField].toLowerCase().includes(title.toLowerCase())
        : true;
      return filterTitle;
    });
  }, [title, titleField]);

  const columns: ProColumns<Post>[] = [
    {
      title: t("post.columns.id"),
      dataIndex: "id",
      hideInSearch: true,
      hideInForm: true,
      width: 80,
    },
    {
      title: t("post.columns.title"),
      dataIndex: titleField,
      key: "title",
    },
    {
      title: t("post.columns.created_at"),
      dataIndex: "created_at",
      render: (_, entity) => entity.created_at.toLocaleDateString(),
      hideInSearch: true,
    },
    {
      title: t("post.columns.creator_id"),
      dataIndex: "creator_id",
      render: (text, entity) => getUserEmailById(entity.creator_id),
      hideInSearch: true,
    },
    {
      title: t("post.columns.category_id"),
      dataIndex: "category_id",
      render: (text, entity) => getCategoryNameById(entity.category_id),
      hideInSearch: true,
    },
    {
      title: t("post.columns.slug"),
      dataIndex: "slug",
      hideInSearch: true,
    },
    {
      title: t("post.columns.description"),
      dataIndex: descriptionField,
      hideInSearch: true,
    },
  ];
  return (
    <ProTable<Post>
      headerTitle={t("post.title")}
      columns={columns}
      rowKey="id"
      search={{ labelWidth: "auto" }}
      pagination={{
        current: page,
        pageSize: pageSize,
        total: filterPostByTitle.length,
        onChange: (p, ps) => {
          setPage(p);
          setPageSize(ps);
        },
      }}
      params={{ title }}
      onSubmit={(values) => {
        startTransition(() => {
          setTitle(values.title ?? null);
        });
      }}
      onReset={() => {
        setTitle(null);
      }}
      dataSource={filterPostByTitle.slice(
        (page - 1) * pageSize,
        page * pageSize
      )}
      toolBarRender={() => [
        <Button type="primary" key="switch" onClick={switchLocale}>
          {t("actions.switchLang")}
        </Button>,
      ]}
    />
  );
}
