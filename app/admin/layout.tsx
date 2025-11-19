"use client";

import { ReactNode, useContext, useState } from "react";
import {
  ProLayout,
  PageContainer,
  ProLayoutProps,
} from "@ant-design/pro-components";
import { Dropdown, MenuProps } from "antd";
import { ChartColumnStacked, User, UserRoundPen } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { APP_ROUTES } from "@/enums/routes";
import Image from "next/image";
import { I18nContext } from "@/src/i18n-provider";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { locale, switchLocale } = useContext(I18nContext);

  const headerTitles: Record<string, string> = {
    [APP_ROUTES.USER]:
      locale === "en" ? "User Management" : "Quản lý người dùng",
    [APP_ROUTES.CATEGORY]:
      locale === "en" ? "Category Management" : "Quản lý danh mục",
    [APP_ROUTES.POST]: locale === "en" ? "Post Management" : "Quản lý bài đăng",
  };

  const menuItems: ProLayoutProps["route"] = {
    path: "/",
    routes: [
      { path: APP_ROUTES.USER, name: "Users", icon: <User size={16} /> },
      {
        path: APP_ROUTES.CATEGORY,
        name: "Categories",
        icon: <ChartColumnStacked size={16} />,
      },
      {
        path: APP_ROUTES.POST,
        name: "Posts",
        icon: <UserRoundPen size={16} />,
      },
      {
        path: APP_ROUTES.TREE,
        name: "Tree table",
      },
    ],
  };

  const userMenu: MenuProps["items"] = [
    {
      key: "en",
      label: "English",
      onClick: () => switchLocale("en"),
    },
    {
      key: "vi",
      label: "Vietnamese",
      onClick: () => switchLocale("vi"),
    },
  ];

  return (
    <ProLayout
      title="CMS Admin"
      logo="https://github.com/ant-design.png"
      collapsed={collapsed}
      onCollapse={setCollapsed}
      route={menuItems}
      location={{ pathname }}
      layout="mix"
      fixSiderbar
      contentWidth="Fluid"
      headerTitleRender={() => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Image
            src="https://github.com/ant-design.png"
            alt="CMS Logo"
            width={24}
            height={24}
          />
          <span style={{ fontSize: "16px", fontWeight: 600, color: "#1f2937" }}>
            CMS Admin
          </span>
        </div>
      )}
      menuItemRender={(item, dom) => (
        <div
          onClick={() => {
            if (item.path) router.push(item.path);
          }}
        >
          {dom}
        </div>
      )}
      avatarProps={{
        src: "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=",
        size: "large",
        render: (_, dom) => (
          <Dropdown menu={{ items: userMenu }} placement="bottomRight">
            <div style={{ cursor: "pointer" }}>{dom}</div>
          </Dropdown>
        ),
      }}
      style={{
        minHeight: "100vh",
      }}
    >
      <PageContainer
        header={{
          title: headerTitles[pathname],
        }}
      >
        {children}
      </PageContainer>
    </ProLayout>
  );
}
