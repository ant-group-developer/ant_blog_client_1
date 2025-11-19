export interface TreeNode {
  key: React.Key;
  name: string;
  type: "file" | "folder";
  children: TreeNode[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface FlattenedTreeNode extends TreeNode {
  level: number;
  parentKey: string;
  position: number;
  _indent: number;
}

export interface DragItem {
  key: React.Key;
  type: string;
  children?: TreeNode[];
  node?: TreeNode;
}

export enum DragTypes {
  NODE = "tree_node",
}
