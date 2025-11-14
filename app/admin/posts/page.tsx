"use client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { App, Button, Modal, Popconfirm } from "antd";
import { useTranslations } from "next-intl";
import {
  useContext,
  useState,
  useMemo,
  startTransition,
  useEffect,
  useRef,
} from "react";
import { I18nContext } from "@/src/i18n-provider";
import {
  ProTable,
  ProForm,
  ProFormText,
  ProColumns,
  ProFormSelect,
  ProFormInstance,
  ProCard,
} from "@ant-design/pro-components";
import { SquarePen, Trash, Eye } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { parseAsInteger, parseAsString } from "@/lib/parser/parser";
import "@ant-design/v5-patch-for-react-19";
import {
  Post,
  fetchPosts,
  createPost,
  updatePost,
  deletePost,
  getPostById,
  CreatePostInput,
} from "@/api/post";
import { Category, fetchCategory } from "@/api/category";

export default function PostsPage() {
  const { message } = App.useApp();
  const { locale } = useContext(I18nContext);
  const t = useTranslations();
  const queryClient = useQueryClient();
  const formRef = useRef<ProFormInstance>(null);

  // URL state
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(10)
  );
  const [title, setTitle] = useQueryState("title", parseAsString);
  const [categoryId, setCategoryId] = useQueryState(
    "categoryId",
    parseAsString.withDefault("")
  );

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const [detailPostId, setDetailPostId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const titleField = locale === "vi" ? "title_vi" : "title_en";
  const descriptionField =
    locale === "vi" ? "description_vi" : "description_en";

  // Categories
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchCategory({ page, pageSize }),
  });

  const categoryOptions =
    categoriesData?.data.map((c: Category) => ({
      label: locale === "vi" ? c.name_vi : c.name_en,
      value: c.id,
    })) ?? [];

  // Posts
  const { data, isLoading, isError } = useQuery({
    queryKey: ["posts", page, pageSize],
    queryFn: () => fetchPosts({ page, pageSize }),
  });

  useEffect(() => {
    if (isError) message.error(t("post.messages.fetchFailed"));
  }, [isError, message, t]);

  const filteredData = useMemo(() => {
    return (
      data?.data.filter((p) => {
        const matchTitle = !title
          ? true
          : p[titleField].toLowerCase().includes(title.toLowerCase());
        const matchCategory = !categoryId ? true : p.category_id === categoryId;
        return matchTitle && matchCategory;
      }) ?? []
    );
  }, [data, title, categoryId, titleField]);

  // Mutations
  const createPostMutate = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      message.success(t("post.messages.createSuccess"));
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setIsModalOpen(false);
    },
    onError: (err) =>
      message.error(err.message || t("post.messages.createFailed")),
  });

  const updatePostMutate = useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<Post> }) =>
      updatePost(id, values),
    onSuccess: () => {
      message.success(t("post.messages.updateSuccess"));
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setEditingPost(null);
      setIsModalOpen(false);
    },
    onError: (err) =>
      message.error(err.message || t("post.messages.updateFailed")),
  });

  const deletePostMutate = useMutation({
    mutationFn: (id: string) => deletePost(id),
    onSuccess: () => {
      message.success(t("post.messages.deleteSuccess"));
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (err) =>
      message.error(err.message || t("post.messages.deleteFailed")),
  });

  // Open modals
  const openCreateModal = () => {
    setEditingPost(null);
    setIsModalOpen(true);
    setTimeout(() => formRef.current?.resetFields(), 50);
  };
  const openEditModal = (post: Post) => {
    setEditingPost(post);
    setIsModalOpen(true);
    setTimeout(() => formRef.current?.setFieldsValue(post), 50);
  };
  const openDetailModal = (id: string) => {
    setDetailPostId(id);
    setIsDetailModalOpen(true);
  };

  // Table columns
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
    {
      title: t("actions.title"),
      valueType: "option",
      width: 150,
      render: (_, record) => [
        <a
          key="view"
          onClick={() => openDetailModal(record.id)}
          style={{ color: "black" }}
        >
          <Eye size={16} />
        </a>,
        <a
          key="edit"
          onClick={() => openEditModal(record)}
          style={{ color: "black" }}
        >
          <SquarePen size={16} />
        </a>,
        <Popconfirm
          key="delete"
          title={t("actions.confirmDelete")}
          okText={t("actions.delete")}
          cancelText={t("actions.cancel")}
          onConfirm={() => deletePostMutate.mutate(record.id)}
        >
          <a style={{ color: "red" }}>
            <Trash size={16} />
          </a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <>
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
        toolBarRender={() => [
          <ProFormSelect
            noStyle
            key="filter-category"
            placeholder={t("post.columns.category_id")}
            allowClear
            style={{ width: 200 }}
            options={categoryOptions}
            fieldProps={{
              value: categoryId || undefined,
              onChange: (val) => {
                startTransition(() => {
                  setCategoryId(val ?? "");
                  setPage(1);
                });
              },
            }}
          />,
          <Button key="create" type="primary" onClick={openCreateModal}>
            {t("actions.create")}
          </Button>,
        ]}
      />

      {/* Create/Edit Modal */}
      <Modal
        title={editingPost ? t("actions.edit") : t("actions.create")}
        open={isModalOpen}
        footer={null}
        onCancel={() => setIsModalOpen(false)}
      >
        <ProForm
          formRef={formRef}
          initialValues={editingPost ?? {}}
          onFinish={async (values) => {
            if (editingPost) {
              await updatePostMutate.mutateAsync({
                id: editingPost.id,
                values,
              });
            } else {
              const input: CreatePostInput = {
                category_id: values.category_id,
                slug: values.slug,
                title_vi: values.title_vi,
                title_en: values.title_en,
                description_vi: values.description_vi,
                description_en: values.description_en,
                content_vi: values.content_vi,
                content_en: values.content_en,
                thumbnail: values.thumbnail || null,
              };
              await createPostMutate.mutateAsync(input);
            }
            return true;
          }}
        >
          <ProFormText
            name="title_vi"
            label="Title (VI)"
            rules={[{ required: true }]}
          />
          <ProFormText
            name="title_en"
            label="Title (EN)"
            rules={[{ required: true }]}
          />
          <ProFormText name="slug" label="Slug" rules={[{ required: true }]} />
          <ProFormText name="description_vi" label="Description (VI)" />
          <ProFormText name="description_en" label="Description (EN)" />
          <ProFormText name="content_vi" label="Content (VI)" />
          <ProFormText name="content_en" label="Content (EN)" />
          <ProFormSelect
            name="category_id"
            label={t("post.columns.category_id")}
            options={categoryOptions}
            rules={[{ required: true, message: "Category is required" }]}
          />
          <ProFormText name="thumbnail" label="Thumbnail URL" />
        </ProForm>
      </Modal>

      {/* Detail Modal */}
      <Modal
        key={detailPostId}
        title={t("post.messages.detail")}
        open={isDetailModalOpen}
        onCancel={() => {
          setIsDetailModalOpen(false);
          setDetailPostId(null);
        }}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            {t("actions.close")}
          </Button>,
        ]}
        width={800}
      >
        {detailPostId && <PostDetail postId={detailPostId} locale={locale} />}
      </Modal>
    </>
  );
}

// Component to show post detail
function PostDetail({ postId, locale }: { postId: string; locale: string }) {
  const { message } = App.useApp();
  const t = useTranslations();
  const {
    data: post,
    isLoading,
    isError,
  } = useQuery<Post>({
    queryKey: ["post", postId],
    queryFn: () => getPostById(postId),
  });

  const titleField = locale === "vi" ? "title_vi" : "title_en";
  const descriptionField =
    locale === "vi" ? "description_vi" : "description_en";
  const contentField = locale === "vi" ? "content_vi" : "content_en";

  useEffect(() => {
    if (isError) message.error(t("post.messages.fetchFailed"));
  }, [isError, message, t]);

  if (isLoading) return <p>{t("common.loading")}</p>;
  if (!post) return <p>{t("common.notFound")}</p>;

  return (
    <ProCard title={post[titleField]} bordered>
      <ProForm readonly submitter={false} layout="horizontal">
        <ProFormText
          name="description"
          label={t("post.columns.description")}
          initialValue={post[descriptionField]}
        />
        <ProFormText
          name="category"
          label={t("post.columns.category_id")}
          initialValue={
            post.categories?.[locale === "vi" ? "name_vi" : "name_en"]
          }
        />
        <ProFormText
          name="slug"
          label={t("post.columns.slug")}
          initialValue={post.slug}
        />
        <ProFormText
          name="content"
          label={t("post.columns.content")}
          initialValue={post[contentField]}
        />
      </ProForm>
    </ProCard>
  );
}
