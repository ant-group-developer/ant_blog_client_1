"use client";

import { App, Button } from "antd";
import { useTranslations } from "next-intl";
import { useQueryState } from "nuqs";
import { parseAsInteger, parseAsString } from "@/lib/parser/parser";
import { I18nContext } from "@/src/i18n-provider";
import { useContext, useEffect, useMemo, startTransition } from "react";
import { ProTable, ProColumns } from "@ant-design/pro-components";
import { useQuery } from "@tanstack/react-query";
import { fetchPosts, Post } from "@/api/post";
import "@ant-design/v5-patch-for-react-19";

export default function PostsPage() {
  const { message } = App.useApp();
  const { locale } = useContext(I18nContext);
  const t = useTranslations();

  // URL state
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(10)
  );
  const [title, setTitle] = useQueryState("title", parseAsString);

  const titleField = locale === "vi" ? "title_vi" : "title_en";
  const descriptionField =
    locale === "vi" ? "description_vi" : "description_en";

  // Fetch posts
  const { data, isLoading, isError } = useQuery({
    queryKey: ["posts", page, pageSize],
    queryFn: () => fetchPosts({ page, pageSize }),
  });

  useEffect(() => {
    if (isError) {
      message.error(t("post.messages.fetchFailed"));
    }
  }, [isError, message, t]);

  // Client-side filter by title (optional)
  const filteredData = useMemo(() => {
    return (
      data?.data.filter((p) => {
        if (!title) return true;
        return p[titleField].toLowerCase().includes(title.toLowerCase());
      }) ?? []
    );
  }, [data, title, titleField]);

  const columns: ProColumns<Post>[] = [
    {
      title: t("post.columns.title"),
      dataIndex: titleField,
      key: "title",
    },
    {
      title: t("post.columns.category_id"),
      dataIndex: ["categories"],
      hideInSearch: true,
      render: (_, record) =>
        locale === "vi"
          ? record.categories?.name_vi
          : record.categories?.name_en,
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
    {
      title: t("post.columns.creator_id"),
      dataIndex: ["users_posts_creator_idTousers"],
      hideInSearch: true,
      render: (_, record) => record.users_posts_creator_idTousers?.email || "-",
    },
    {
      title: t("post.columns.modifier"),
      dataIndex: ["users_posts_modifier_idTousers"],
      hideInSearch: true,
      render: (_, record) =>
        record.users_posts_modifier_idTousers?.email || "-",
    },
    {
      title: t("post.columns.created_at"),
      dataIndex: "created_at",
      hideInSearch: true,
      render: (_, record) => new Date(record.created_at).toLocaleString(locale),
    },
    {
      title: t("post.columns.updated_at"),
      dataIndex: "updated_at",
      hideInSearch: true,
      render: (_, record) => new Date(record.updated_at).toLocaleString(locale),
    },
  ];

  return (
    <ProTable<Post>
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
      params={{ title }}
      onSubmit={(values) => {
        startTransition(() => {
          setTitle(values.title ?? null);
          setPage(1);
        });
      }}
      onReset={() => {
        setTitle(null);
        setPage(1);
      }}
      dataSource={filteredData.slice((page - 1) * pageSize, page * pageSize)}
    />
  );
}
