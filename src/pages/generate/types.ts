
export interface FileNode {
  name: string;
  type: 'file';
  path: string;
  sha: string;
  url: string;
  extension?: string;
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
  available_file_types: string[];
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

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

export function filterTreeByExtensions(
  node: DirectoryNode,
  extensions: string[]
): DirectoryNode {
  if (extensions.length === 0) return node;

  const filterNode = (n: DirectoryNode): DirectoryNode => {
    const filteredChildren = n.children
      .map(child => {
        if (isFileNode(child)) {
          const ext = getFileExtension(child.name);
          return extensions.includes(ext) ? child : null;
        }
        if (isDirectoryNode(child)) {
          const filteredDir = filterNode(child);
          return filteredDir.children.length > 0 ? filteredDir : null;
        }
        return null;
      })
      .filter((child): child is FileNode | DirectoryNode => child !== null);

    return {
      ...n,
      children: filteredChildren,
    };
  };

  return filterNode(node);
}

export function collectFilesFromDirectory(
  node: DirectoryNode,
  extensions?: string[]
): FileNode[] {
  let files: FileNode[] = [];
  for (const child of node.children) {
    if (isFileNode(child)) {
      const ext = getFileExtension(child.name);
      if (!extensions || extensions.includes(ext)) {
        files.push({ ...child, extension: ext });
      }
    } else if (isDirectoryNode(child)) {
      files = [...files, ...collectFilesFromDirectory(child, extensions)];
    }
  }
  return files;
}
