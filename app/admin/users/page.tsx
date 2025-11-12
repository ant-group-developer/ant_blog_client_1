"use client";

import { useState, useEffect, useMemo, startTransition } from "react";
import { App, Button, Modal } from "antd";
import {
  ProTable,
  ProColumns,
  ProForm,
  ProFormText,
} from "@ant-design/pro-components";
import { useQueryState } from "nuqs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUsers, createUser, User } from "@/api/users";
import { useTranslations } from "next-intl";
import { parseAsInteger, parseAsString } from "@/lib/parser/parser";
import "@ant-design/v5-patch-for-react-19";

interface UserWithMeta extends User {
  creator_name?: string;
  modifier_name?: string;
}

export default function UserPage() {
  const { message } = App.useApp();
  const t = useTranslations();
  const queryClient = useQueryClient();

  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(10)
  );
  const [email, setEmail] = useQueryState("email", parseAsString);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["users", page, pageSize, email],
    queryFn: () => fetchUsers({ page, pageSize, email }),
  });

  const { mutateAsync: createUserMutate } = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      message.success(t("user.messages.createSuccess"));
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsModalOpen(false);
    },
    onError: (err) => {
      message.error(err.message || t("user.messages.createFailed"));
    },
  });

  useEffect(() => {
    if (isError) message.error(t("user.messages.fetchFailed"));
  }, [isError, message, t]);

  const userMap = useMemo(() => {
    const map: Record<string, string> = {};
    data?.data.forEach((u) => {
      map[u.id] = u.email;
    });
    return map;
  }, [data]);

  const mappedData: UserWithMeta[] = useMemo(() => {
    return (
      data?.data.map((u) => ({
        ...u,
        creator_name: userMap[u.creator_id] || u.creator_id,
        modifier_name: userMap[u.modifier_id] || u.modifier_id,
      })) ?? []
    );
  }, [data, userMap]);

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
    <>
      <ProTable<UserWithMeta>
        columns={columns}
        loading={isLoading}
        rowKey="id"
        dataSource={mappedData}
        search={{ labelWidth: "auto" }}
        pagination={{
          current: page,
          pageSize,
          total: data?.pagination?.totalItem ?? 0,
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
        onReset={() => setEmail(null)}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            onClick={() => setIsModalOpen(true)}
          >
            {t("actions.create")}
          </Button>,
        ]}
      />

      <Modal
        title={t("actions.create")}
        open={isModalOpen}
        footer={null}
        onCancel={() => setIsModalOpen(false)}
      >
        <ProForm
          onFinish={async (values) => {
            await createUserMutate({
              email: values.email,
              password: values.password,
            });
            return true;
          }}
        >
          <ProFormText
            name="email"
            label={t("user.columns.email")}
            rules={[{ required: true, type: "email" }]}
          />
          <ProFormText.Password
            name="password"
            label={t("user.columns.password")}
            rules={[{ required: true, min: 6 }]}
          />
        </ProForm>
      </Modal>
    </>
  );
}
