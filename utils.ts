import { TreeNode } from "@/types/tree";

/**
 * Di chuyển node trong tree
 */
export const moveTreeNode = (
  data: TreeNode[],
  dragKey: React.Key,
  dropKey: React.Key,
  dropPosition: number
): TreeNode[] => {
  const clone = structuredClone
    ? structuredClone(data)
    : (JSON.parse(JSON.stringify(data)) as TreeNode[]);

  let dragItem: TreeNode | null = null;

  // Tìm và xóa node được kéo
  const removeNode = (arr: TreeNode[]): boolean => {
    for (let i = 0; i < arr.length; i++) {
      const node = arr[i];
      if (node.key === dragKey) {
        dragItem = arr.splice(i, 1)[0];
        return true;
      }
      if (node.children && removeNode(node.children)) {
        return true;
      }
    }
    return false;
  };

  if (!removeNode(clone) || !dragItem) {
    return clone; // Không tìm thấy node để di chuyển
  }

  // Chặn việc thả node vào chính nó hoặc vào con cháu của nó
  const isDescendant = (parent: TreeNode, childKey: React.Key): boolean => {
    if (parent.key === childKey) return true;
    if (parent.children) {
      return parent.children.some((child) => isDescendant(child, childKey));
    }
    return false;
  };

  if (isDescendant(dragItem, dropKey)) {
    return data; // Không cho phép thả vào chính nó hoặc con cháu
  }

  // Chèn node vào vị trí mới
  const insertNode = (arr: TreeNode[]): boolean => {
    for (let i = 0; i < arr.length; i++) {
      const node = arr[i];

      if (node.key === dropKey) {
        if (dropPosition === -1) {
          // Thả vào bên trong node
          node.children = node.children || [];
          node.children.push(dragItem!);
        } else {
          // Thả lên trên (0) hoặc dưới (1) node
          arr.splice(i + dropPosition, 0, dragItem!);
        }
        return true;
      }

      if (node.children && insertNode(node.children)) {
        return true;
      }
    }
    return false;
  };

  // Nếu không tìm thấy vị trí thả, thêm vào cuối
  if (!insertNode(clone)) {
    clone.push(dragItem);
  }

  return clone;
};
