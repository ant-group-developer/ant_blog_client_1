"use client";

import React from "react";
import { TreeDnDTable, TreeNode } from "./tree-page";

const mockData: TreeNode[] = [
  {
    key: "1",
    title: "Parent 1",
    children: [
      { key: "1-1", title: "Child 1-1" },
      { key: "1-2", title: "Child 1-2" },
    ],
  },
  {
    key: "2",
    title: "Parent 2",
    children: [
      { key: "2-1", title: "Child 2-1" },
      {
        key: "2-2",
        title: "Child 2-2",
        children: [
          { key: "2-2-1", title: "Child 2-2-1" },
          { key: "2-2-2", title: "Child 2-2-2" },
        ],
      },
    ],
  },
  { key: "3", title: "Parent 3" },
];

export default function TreePage() {
  return (
    <div style={{ padding: 24 }}>
      <TreeDnDTable data={mockData} />
    </div>
  );
}
