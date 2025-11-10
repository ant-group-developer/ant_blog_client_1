"use client";

import { ReactNode, useState } from "react";
import { ProLayout, ProLayoutProps } from "@ant-design/pro-components";
import { usePathname, useRouter } from "next/navigation";
import { MenuProps } from "antd";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Menu items
  const menuItems: ProLayoutProps["route"] = {
    children: [
      { path: "/admin/users", name: "Users" },
      { path: "/admin/categories", name: "Categories" },
      { path: "/admin/posts", name: "Posts" },
    ],
  };

  return (
    <ProLayout
      collapsed={collapsed}
      onCollapse={setCollapsed}
      title="CMS Admin"
      route={menuItems}
      location={{ pathname }}
      menuItemRender={(item, dom) => (
        <div
          onClick={() => {
            if (item.path) router.push(item.path);
          }}
        >
          {dom}
        </div>
      )}
      style={{ minHeight: "100vh" }}
    >
      {children}
    </ProLayout>
  );
}
