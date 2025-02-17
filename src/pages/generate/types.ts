
export interface FileNode {
  name: string;
  type: 'file';
  path: string;
  sha: string;
  url: string;
}

export interface DirectoryNode {
  name: string;
  type: 'directory';
  children: (DirectoryNode | FileNode)[];
}

export type TreeNode = FileNode | DirectoryNode;

export interface RepositoryTree {
  id: string;
  repository_url: string;
  tree_structure: DirectoryNode;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export function isFileNode(node: any): node is FileNode {
  return (
    typeof node === 'object' &&
    node !== null &&
    node.type === 'file' &&
    typeof node.name === 'string' &&
    typeof node.path === 'string' &&
    typeof node.sha === 'string' &&
    typeof node.url === 'string'
  );
}

export function isDirectoryNode(node: any): node is DirectoryNode {
  return (
    typeof node === 'object' &&
    node !== null &&
    node.type === 'directory' &&
    typeof node.name === 'string' &&
    Array.isArray(node.children)
  );
}

export function collectFilesFromDirectory(node: DirectoryNode): FileNode[] {
  let files: FileNode[] = [];
  for (const child of node.children) {
    if (isFileNode(child)) {
      if (child.name.endsWith('.py')) {
        files.push(child);
      }
    } else if (isDirectoryNode(child)) {
      files = [...files, ...collectFilesFromDirectory(child)];
    }
  }
  return files;
}
