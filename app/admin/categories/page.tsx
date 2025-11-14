"use client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
import {
  Category,
  fetchCategory,
  createCategory,
  updateCategory,
  UpdateCategoryInput,
  deleteCategory,
} from "@/api/category";
import { parseAsInteger, parseAsString } from "@/lib/parser/parser";
import { I18nContext } from "@/src/i18n-provider";
import {
  ProColumns,
  ProTable,
  ProForm,
  ProFormText,
  ProFormInstance,
} from "@ant-design/pro-components";
import { App, Button, Modal, Popconfirm } from "antd";
import { useTranslations } from "next-intl";
import { useQueryState } from "nuqs";
import { useContext, useMemo, useState, useEffect, useRef } from "react";
import "@ant-design/v5-patch-for-react-19";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SquarePen, Trash } from "lucide-react";
import Cookies from "js-cookie";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableRow } from "@/components/drag-sort";
import { API_BASE_URL } from "@/api";

interface CategoryWithMeta extends Category {
  creator_name?: string;
  modifier_name?: string;
  name?: string;
}
export default function CategoriesPage() {
  const { message } = App.useApp();
  const { locale } = useContext(I18nContext);
  const t = useTranslations();
  const queryClient = useQueryClient();
  const formRef = useRef<ProFormInstance>(null);

  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(10)
  );
  const [searchName, setSearchName] = useQueryState("name", parseAsString);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editableKeys, setEditableKeys] = useState<React.Key[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["categories", page, pageSize],
    queryFn: () => fetchCategory({ page, pageSize }),
  });

  const userMap = useMemo(() => {
    const map: Record<string, string> = {};
    data?.data.forEach((c) => {
      if (c.creator?.email) map[c.creator_id] = c.creator.email;
      if (c.modifier?.email) map[c.modifier_id] = c.modifier.email;
    });
    return map;
  }, [data?.data]);

  const filteredData: CategoryWithMeta[] = useMemo(() => {
    const raw = data?.data ?? [];
    const filtered = searchName
      ? raw.filter((c) => {
          const vi = c.name_vi?.toLowerCase() || "";
          const en = c.name_en?.toLowerCase() || "";
          const query = searchName.toLowerCase();
          return vi.includes(query) || en.includes(query);
        })
      : raw;
    return filtered.map((c) => ({
      ...c,
      creator_name: userMap[c.creator_id] ?? c.creator_id,
      modifier_name: userMap[c.modifier_id] ?? c.modifier_id,
    }));
  }, [data?.data, searchName, userMap]);

  const [tableData, setTableData] = useState<CategoryWithMeta[]>(filteredData);
  const safeTableData = tableData ?? [];

  useEffect(() => {
    setTableData(filteredData);
  }, [filteredData]);

  const { mutateAsync: createCategoryMutate } = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      message.success(t("category.messages.createSuccess"));
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsModalOpen(false);
    },
    onError: (err) => {
      message.error(err.message || t("category.messages.createFailed"));
    },
  });

  const { mutateAsync: updateCategoryMutate } = useMutation({
    mutationFn: ({ id, values }: { id: string; values: UpdateCategoryInput }) =>
      updateCategory(id, values),
    onSuccess: () => {
      message.success(t("category.messages.updateSuccess"));
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err) => {
      message.error(err.message || t("category.messages.updateFailed"));
    },
  });

  const updateOrderMutate = useMutation({
    mutationFn: async (data: { items: { id: string; order: number }[] }) => {
      const token = Cookies.get("token");
      if (!token) throw new Error("User not authenticated");

      return fetch(`${API_BASE_URL}/cms/categories/order`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to update order");
        return res.json();
      });
    },
    onSuccess: () => {
      message.success(t("category.messages.updateSuccess"));
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err) => {
      message.error(err.message || t("category.messages.updateOrderFailed"));
    },
  });

  const openCreateModal = () => {
    setIsModalOpen(true);
    setTimeout(() => formRef.current?.resetFields(), 50);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = tableData.findIndex((c) => c.id === active.id);
      const newIndex = tableData.findIndex((c) => c.id === over.id);
      const newData = arrayMove(tableData, oldIndex, newIndex);
      setTableData(newData);

      updateOrderMutate.mutate({
        items: newData.map((c, index) => ({ id: c.id, order: index + 1 })),
      });
    }
  };

  const columns: ProColumns<CategoryWithMeta>[] = [
    {
      title: t("category.columns.name"),
      dataIndex: "name",
      key: "name",
      editable: () => true,
      renderFormItem: (_, { record }) => (
        <ProFormText
          name="name"
          placeholder={t("category.columns.name")}
          initialValue={locale === "vi" ? record?.name_vi : record?.name_en}
        />
      ),
      render: (_, record) =>
        locale === "vi" ? record.name_vi : record.name_en,
    },
    {
      title: t("category.columns.created_at"),
      dataIndex: "created_at",
      hideInSearch: true,
      editable: () => false,
      render: (_, r) => new Date(r.created_at).toLocaleString(),
    },
    {
      title: t("category.columns.updated_at"),
      dataIndex: "updated_at",
      hideInSearch: true,
      editable: () => false,
      render: (_, r) => new Date(r.updated_at).toLocaleString(),
    },
    {
      title: t("category.columns.creator"),
      dataIndex: "creator_name",
      editable: () => false,
      hideInSearch: true,
    },
    {
      title: t("category.columns.modifier"),
      dataIndex: "modifier_name",
      hideInSearch: true,
      editable: () => false,
    },
    {
      title: t("category.columns.slug"),
      dataIndex: "slug",
      hideInSearch: true,
      editable: () => true,
    },
    {
      title: t("category.columns.order"),
      dataIndex: "order",
      hideInSearch: true,
      editable: () => false,
    },
    {
      title: t("actions.title"),
      valueType: "option",
      key: "option",
      width: 120,
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable(record.id);
          }}
          style={{ color: "black" }}
        >
          {" "}
          {<SquarePen size={16} />}{" "}
        </a>,
        <Popconfirm
          key="delete"
          title={t("actions.confirmDelete")}
          okText={t("actions.delete")}
          cancelText={t("actions.cancel")}
          onConfirm={async () => {
            try {
              await deleteCategory(record.id);
              message.success(t("category.messages.deleteSuccess"));
              queryClient.invalidateQueries({ queryKey: ["categories"] });
            } catch (err: unknown) {
              if (err instanceof Error) {
                message.error(err.message);
              } else {
                message.error(t("category.messages.deleteFailed"));
              }
            }
          }}
        >
          {" "}
          <a style={{ color: "red", marginLeft: 8 }}>
            {" "}
            <Trash size={16} />{" "}
          </a>{" "}
        </Popconfirm>,
      ],
    },
  ];

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={(safeTableData as { id: string }[])
            .map((c) => c.id)
            .filter((id) => typeof id === "string")}
          strategy={verticalListSortingStrategy}
        >
          <ProTable<CategoryWithMeta>
            key={locale}
            columns={columns}
            rowKey="id"
            dataSource={tableData}
            loading={isLoading}
            search={{ labelWidth: "auto" }}
            pagination={{
              current: page,
              pageSize,
              total: tableData.length,
              onChange: (p, ps) => {
                setPage(p);
                if (ps) setPageSize(ps);
              },
            }}
            onSubmit={(values) => {
              const nameVal = (values.name ?? "").trim();
              setSearchName(nameVal || null);
              setPage(1);
            }}
            onReset={() => {
              setSearchName(null);
              setPage(1);
            }}
            toolBarRender={() => [
              <Button key="create" type="primary" onClick={openCreateModal}>
                {t("actions.create")}
              </Button>,
            ]}
            editable={{
              type: "multiple",
              editableKeys,
              onChange: setEditableKeys,
              onSave: async (_, row) => {
                const updateData: UpdateCategoryInput = {
                  name_vi:
                    locale === "vi"
                      ? row.name ?? row.name_vi ?? ""
                      : row.name_vi ?? "",
                  name_en:
                    locale === "en"
                      ? row.name ?? row.name_en ?? ""
                      : row.name_en ?? "",
                  slug: row.slug ?? "",
                  order: row.order,
                };
                await updateCategoryMutate({ id: row.id, values: updateData });
              },
            }}
            components={{
              body: {
                row: (props) => {
                  const rowKey = props["data-row-key"];
                  if (!rowKey) return null;
                  const record = tableData.find((c) => c.id === rowKey);
                  if (!record) return null;
                  return (
                    <SortableRow id={record.id}>{props.children}</SortableRow>
                  );
                },
              },
            }}
          />
        </SortableContext>
      </DndContext>

      <Modal
        title={t("actions.create")}
        open={isModalOpen}
        footer={null}
        onCancel={() => setIsModalOpen(false)}
      >
        <ProForm
          formRef={formRef}
          onFinish={async (values) => {
            await createCategoryMutate({
              name_vi: values.name_vi,
              name_en: values.name_en,
              slug: values.slug,
              order: values.order,
            });
            return true;
          }}
        >
          <ProFormText
            name="name_vi"
            label={"Tên danh mục"}
            rules={[{ required: true, message: "Name (VI) is required" }]}
          />
          <ProFormText
            name="name_en"
            label={"Name"}
            rules={[{ required: true, message: "Name (EN) is required" }]}
          />
          <ProFormText
            name="slug"
            label={t("category.columns.slug")}
            rules={[{ required: true, message: "Slug is required" }]}
          />
          <ProFormText
            name="order"
            label={t("category.columns.order")}
            rules={[{ required: true, message: "Order is required" }]}
          />
        </ProForm>
      </Modal>
    </>
  );
}
