"use client";

import { useEffect, useContext, useMemo, startTransition } from "react";
import { App, Button } from "antd";
import { ProTable, ProColumns } from "@ant-design/pro-components";
import { useQueryState } from "nuqs";
import { useQuery } from "@tanstack/react-query";
import { fetchUsers, User } from "@/api/users";
import { useTranslations } from "next-intl";
import { I18nContext } from "@/src/i18n-provider";
import { parseAsInteger, parseAsString } from "@/lib/parser/parser";
import "@ant-design/v5-patch-for-react-19";

interface UserWithMeta extends User {
  creator_name?: string;
  modifier_name?: string;
}

export default function UserPage() {
  const { message } = App.useApp();
  const t = useTranslations();
  const { switchLocale } = useContext(I18nContext);

  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(10)
  );
  const [email, setEmail] = useQueryState("email", parseAsString);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["users", page, pageSize, email],
    queryFn: () => fetchUsers({ page, pageSize, email }),
  });

  useEffect(() => {
    if (isError) {
      message.error(t("user.messages.fetchFailed"));
    }
  }, [isError, message, t]);

  const userMap = useMemo(() => {
    const map: Record<string, string> = {};
    data?.data.forEach((u) => {
      map[u.id] = u.email;
    });
    return map;
  }, [data]);

  const filteredData: UserWithMeta[] = useMemo(() => {
    return (
      data?.data
        .filter((u) => {
          if (!email) return true;
          const username = u.email.split("@")[0];
          return username.toLowerCase().includes(email.toLowerCase());
        })
        .map((u) => ({
          ...u,
          creator_name: userMap[u.creator_id] || u.creator_id,
          modifier_name: userMap[u.modifier_id] || u.modifier_id,
        })) ?? []
    );
  }, [data, email, userMap]);

  const columns: ProColumns<UserWithMeta>[] = [
    { title: t("user.columns.email"), dataIndex: "email" },
    {
      title: t("user.columns.created_at"),
      dataIndex: "created_at",
      render: (_, e) => new Date(e.created_at).toLocaleString(),
      hideInSearch: true,
    },
    {
      title: t("user.columns.updated_at"),
      dataIndex: "updated_at",
      render: (_, e) => new Date(e.updated_at).toLocaleString(),
      hideInSearch: true,
    },
    {
      title: t("user.columns.creator"),
      dataIndex: "creator_name",
      hideInSearch: true,
    },
    {
      title: t("user.columns.modifier"),
      dataIndex: "modifier_name",
      hideInSearch: true,
    },
    {
      title: t("user.columns.status"),
      dataIndex: "status",
      render: (_, e) =>
        e.status ? t("user.status.active") : t("user.status.inactive"),
      hideInSearch: true,
    },
  ];

  return (
    <ProTable<UserWithMeta>
      headerTitle={t("user.title")}
      columns={columns}
      loading={isLoading}
      rowKey="id"
      dataSource={filteredData}
      search={{ labelWidth: "auto" }}
      pagination={{
        current: page,
        pageSize,
        total: filteredData.length,
        onChange: (p, ps) => {
          setPage(p);
          setPageSize(ps);
        },
      }}
      onSubmit={(values) => {
        startTransition(() => {
          setEmail(values.email ?? null);
        });
      }}
      onReset={() => {
        setEmail(null);
      }}
      toolBarRender={() => [
        <Button type="primary" key="switch" onClick={switchLocale}>
          {t("actions.switchLang")}
        </Button>,
      ]}
    />
  );
}
