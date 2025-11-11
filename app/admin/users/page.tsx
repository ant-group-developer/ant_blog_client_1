"use client";

import { parseAsInteger, parseAsString } from "@/lib/parser/parser";
import { mockUsers, User } from "@/src/mocks/users";
import {
  ActionType,
  ModalForm,
  ProColumns,
  ProFormText,
  ProTable,
} from "@ant-design/pro-components";
import { useQueryState } from "nuqs";
import { startTransition, useContext, useMemo, useRef } from "react";
import "@ant-design/v5-patch-for-react-19";
import { Button, Popconfirm } from "antd";
import { SquarePen, Trash } from "lucide-react";
import { I18nContext } from "@/src/I18nProvider";
import { useTranslations } from "next-intl";

export default function UserPage() {
  const { locale, switchLocale } = useContext(I18nContext);
  const t = useTranslations();

  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(5)
  );
  const [email, setEmail] = useQueryState("email", parseAsString);
  const filterUser = useMemo(() => {
    return mockUsers.filter((u) => {
      if (!email) {
        return true;
      }

      const username = u.email.split("@")[0];

      return username.toLowerCase().includes(email.toLowerCase());
    });
  }, [email]);

  const columns: ProColumns<User>[] = [
    {
      title: t("user.columns.id"),
      dataIndex: "id",
      hideInSearch: true,
      hideInForm: true,
      width: 80,
    },
    {
      title: t("user.columns.email"),
      dataIndex: "email",
      key: "email",
    },
    {
      title: t("user.columns.created_at"),
      dataIndex: "created_at",
      render: (_, entity) => entity.created_at.toLocaleDateString(),
      hideInSearch: true,
    },
    {
      title: t("user.columns.status"),
      dataIndex: "status",
      hideInSearch: true,
      render: (_, entity) => (
        <span>
          {entity.status ? t("user.status.active") : t("user.status.inactive")}
        </span>
      ),
    },
  ];
  return (
    <ProTable<User>
      headerTitle={t("user.title")}
      columns={columns}
      rowKey="id"
      search={{
        labelWidth: "auto",
      }}
      pagination={{
        current: page,
        pageSize: pageSize,
        total: filterUser.length,
        onChange: (p, ps) => {
          setPage(p);
          setPageSize(ps);
        },
      }}
      params={{ email }}
      onSubmit={(values) => {
        startTransition(() => {
          setEmail(values.email ?? null);
        });
      }}
      onReset={() => {
        setEmail(null);
      }}
      dataSource={filterUser.slice((page - 1) * pageSize, page * pageSize)}
      toolBarRender={() => [
        <Button type="primary" key="switch" onClick={switchLocale}>
          {t("actions.switchLang")}
        </Button>,
      ]}
    />
  );
}
