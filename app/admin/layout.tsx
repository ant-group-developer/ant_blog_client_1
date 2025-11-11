"use client";

import { ReactNode, useState } from "react";
import { ProLayout, ProLayoutProps } from "@ant-design/pro-components";
import { usePathname, useRouter } from "next/navigation";
import { MenuProps } from "antd";
import { ChartColumnStacked, User, UserRoundPen } from "lucide-react";
import { APP_ROUTES } from "@/enums/routes";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems: ProLayoutProps["route"] = {
    children: [
      { path: APP_ROUTES.USER, name: "Users", icon: <User size={18} /> },
      {
        path: APP_ROUTES.CATEGORY,
        name: "Categories",
        icon: <ChartColumnStacked size={18} />,
      },
      {
        path: APP_ROUTES.POST,
        name: "Posts",
        icon: <UserRoundPen size={18} />,
      },
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
