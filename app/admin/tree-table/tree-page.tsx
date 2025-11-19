"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";

const { Text } = Typography;

// --- Dữ liệu và Hàm Tiện ích ---

export type TreeNode = {
  key: string;
  title: string;
  children?: TreeNode[];
};

const cloneTree = (nodes: TreeNode[]): TreeNode[] =>
  nodes.map((node) => ({
    ...node,
    children: node.children ? cloneTree(node.children) : undefined,
  }));

const flattenTree = (
  nodes: TreeNode[],
  parentKey: string | null = null,
  depth = 0
): Map<string, { node: TreeNode; parentKey: string | null; depth: number }> => {
  const map = new Map();
  nodes.forEach((node) => {
    map.set(node.key, { node, parentKey, depth });
    if (node.children) {
      const childMap = flattenTree(node.children, node.key, depth + 1);
      childMap.forEach((value, key) => map.set(key, value));
    }
  });
  return map;
};

// Đã sửa: Đảm bảo children được gán là undefined nếu mảng rỗng sau khi lọc
const removeNode = (
  tree: TreeNode[],
  key: string
): { newTree: TreeNode[]; removedNode?: TreeNode } => {
  let removed: TreeNode | undefined;

  const filterRec = (nodes: TreeNode[]): TreeNode[] =>
    nodes
      .filter((n) => {
        if (n.key === key) {
          removed = {
            ...n,
            children: n.children ? cloneTree(n.children) : undefined,
          };
          return false;
        }
        if (n.children) {
          // Lọc đệ quy
          n.children = filterRec(n.children);
          // ✨ Nếu children sau khi lọc rỗng, gán là undefined
          if (n.children.length === 0) {
            n.children = undefined;
          }
        }
        return true;
      })
      .map((n) => ({
        ...n,
        // Chỉ clone children nếu nó tồn tại và có phần tử
        children:
          n.children && n.children.length > 0
            ? cloneTree(n.children)
            : undefined,
      }));

  return { newTree: filterRec(cloneTree(tree)), removedNode: removed };
};

const insertNode = (
  tree: TreeNode[],
  node: TreeNode,
  targetKey: string,
  position: "before" | "after" | "inside"
): TreeNode[] => {
  return tree.flatMap((n) => {
    if (n.key === targetKey) {
      if (position === "inside") {
        return [
          { ...n, children: n.children ? [node, ...n.children] : [node] },
        ];
      }
      if (position === "before") return [node, { ...n }];
      if (position === "after") return [{ ...n }, node];
    }
    if (n.children) {
      const newChildren = insertNode(n.children, node, targetKey, position);
      if (newChildren !== n.children) {
        // ✨ Nếu children mới rỗng, gán là undefined
        if (newChildren.length === 0) {
          return [{ ...n, children: undefined }];
        }
        return [{ ...n, children: newChildren }];
      }
    }
    return [n];
  });
};

// --- Drop Target State Type ---
type DropPosition = "before" | "after" | "inside";
type DropTarget = {
  id: string;
  position: DropPosition;
} | null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DraggableRow = (props: any) => {
  const { activeId, dropTarget, ...restProps } = props;
  const rowKey = restProps["data-row-key"];

  const isDragging = activeId === rowKey;
  const isTarget = dropTarget?.id === rowKey;

  // Full-row indicator
  const rowStyle: React.CSSProperties = {
    ...restProps.style,
    cursor: "grab",
    opacity: isDragging ? 0.3 : 1,
    transition: "all 0.15s ease",
    borderTop:
      isTarget && dropTarget.position === "before"
        ? "2px solid #1890ff"
        : undefined,
    borderBottom:
      isTarget && dropTarget.position === "after"
        ? "2px solid #1890ff"
        : undefined,
  };

  const {
    setNodeRef: setDragRef,
    attributes,
    listeners,
  } = useDraggable({
    id: rowKey,
  });
  const { setNodeRef: setDropRef } = useDroppable({ id: rowKey });

  return (
    <tr
      ref={(node) => {
        setDragRef(node);
        setDropRef(node);
      }}
      {...restProps}
      {...attributes}
      {...listeners}
      style={rowStyle}
    >
      {restProps.children}
    </tr>
  );
};

export const TreeDnDTable: React.FC<{ data: TreeNode[] }> = ({ data }) => {
  const [treeData, setTreeData] = useState<TreeNode[]>(data);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget>(null);
  const flatMap = useMemo(() => flattenTree(treeData), [treeData]);

  const dropPadding = 0.25; 
  const indentThreshold = 50;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const isDescendant = useCallback(
    (parentKey: string | null, childKey: string): boolean => {
      let current = flatMap.get(childKey);
      while (current && current.parentKey !== null) {
        if (current.parentKey === parentKey) return true;
        const next = flatMap.get(current.parentKey);
        if (!next) break;
        current = next;
      }
      return false;
    },
    [flatMap]
  );

  // --- Logic Xử lý Vị trí Thả (Drop Over) ---
  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over, delta } = event;

      // Không hover gì hoặc kéo vào chính nó → bỏ highlight
      if (!over || active.id === over.id) {
        setDropTarget(null);
        return;
      }

      const draggedKey = active.id as string;
      const overKey = over.id as string;

      // ❌ Không cho kéo cha vào con (vòng lặp)
      if (isDescendant(draggedKey, overKey)) {
        setDropTarget(null);
        return;
      }

      // --- Lấy bounding rect của row đích ---
      const overRect = over.rect;
      const mouseY = overRect.top + delta.y;
      const mouseX = overRect.left + delta.x;

      const relativeY = (mouseY - overRect.top) / overRect.height;
      const indentX = mouseX - overRect.left;

      let position: DropPosition;

      if (relativeY < dropPadding) {
        position = "before";
      } else if (relativeY > 1 - dropPadding) {
        // AFTER ZONE
        // 👉 Nếu kéo chuột vào sâu bên phải → convert thành INSIDE
        if (indentX > indentThreshold) {
          position = "inside";
        } else {
          position = "after";
        }
      } else {
        // MIDDLE ZONE
        if (indentX > indentThreshold) {
          position = "inside";
        } else {
          position = "after";
        }
      }

      setDropTarget({ id: overKey, position });
    },
    [isDescendant, dropPadding, indentThreshold]
  );

  // --- Logic Xử lý Kết thúc Kéo Thả (Drop End) ---
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active } = event;
      setActiveId(null);

      if (!dropTarget || active.id === dropTarget.id) {
        setDropTarget(null);
        return;
      }

      const draggedKey = active.id as string;
      const targetKey = dropTarget.id as string;
      const position = dropTarget.position;

      setDropTarget(null);

      const dragged = flatMap.get(draggedKey);
      const target = flatMap.get(targetKey);
      if (!dragged || !target) return;

      const { newTree: treeAfterRemove, removedNode } = removeNode(
        treeData,
        draggedKey
      );
      if (!removedNode) return;

      let updatedTree: TreeNode[];

      if (position === "inside") {
        updatedTree = insertNode(
          treeAfterRemove,
          removedNode,
          targetKey,
          "inside"
        );
      } else {
        updatedTree = insertNode(
          treeAfterRemove,
          removedNode,
          targetKey,
          position
        );
      }

      setTreeData(updatedTree);
    },
    [treeData, flatMap, dropTarget]
  );

  // --- Logic Bắt đầu Kéo Thả (Drag Start) ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDragStart = useCallback((event: any) => {
    setActiveId(event.active.id as string);
    setDropTarget(null);
  }, []);

  // --- Column Definition (với Logic Indicator) ---
  const columns: ColumnsType<TreeNode> = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: TreeNode) => {
        const depth = flatMap.get(record.key)?.depth ?? 0;
        const INDENT_SIZE = 24;

        // Xác định trạng thái của hàng hiện tại
        const isTarget = dropTarget && dropTarget.id === record.key;
        const isInsideTarget = isTarget && dropTarget.position === "inside";
        const isBeforeTarget = isTarget && dropTarget.position === "before";
        const isAfterTarget = isTarget && dropTarget.position === "after";

        const insideIndicatorLeft = `${(depth + 1) * INDENT_SIZE}px`;

        return (
          <div
            style={{
              paddingLeft: `${depth * 24}px`,
              position: "relative",
              minHeight: "32px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Text>{text}</Text>

            {/* Indicator cho Before/After (Vẽ đường kẻ) */}
            {(isBeforeTarget || isAfterTarget) && (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  height: "2px",
                  background: "#1890ff",
                  zIndex: 1,
                  // Đặt ở trên cùng (before) hoặc dưới cùng (after)
                  [isBeforeTarget ? "top" : "bottom"]: 0,
                }}
              />
            )}
            {isInsideTarget && (
              <div
                style={{
                  position: "absolute",
                  bottom: 0, // Đặt bên dưới parent
                  left: insideIndicatorLeft, // Thụt vào (Cấp hiện tại + 1)
                  right: 0, // Kéo dài đến cuối
                  height: "2px",
                  background: "#1890ff",
                  zIndex: 1,
                }}
              />
            )}
          </div>
        );
      },
    },
  ];

  const activeNode = activeId ? flatMap.get(activeId)?.node : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        setActiveId(null);
        setDropTarget(null);
      }}
    >
      <Table
        columns={columns}
        dataSource={treeData}
        rowKey="key"
        pagination={false}
        expandable={{
          defaultExpandAllRows: true,
          rowExpandable: (record: TreeNode) =>
            !!(record.children && record.children.length > 0),
        }}
        components={{
          body: {
            row: (props) => (
              <DraggableRow
                {...props}
                activeId={activeId}
                dropTarget={dropTarget}
              />
            ),
          },
        }}
      />
      <DragOverlay>
        {activeNode ? (
          <div
            style={{
              padding: "8px 16px",
              background: "#fafafa",
              border: "1px solid #1890ff",
              borderRadius: 4,
              boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
              minWidth: 200,
            }}
          >
            {activeNode.title}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
