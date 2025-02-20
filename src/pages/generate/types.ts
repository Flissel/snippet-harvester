
export interface FileNode {
  type: 'file';
  name: string;
  path: string;
  url: string;
  extension?: string;
}

export interface DirectoryNode {
  type: 'directory';
  name: string;
  path: string;
  children: (FileNode | DirectoryNode)[];
}

export interface RepositoryTree {
  id: string;
  created_at: string;
  tree_structure: DirectoryNode;
  available_file_types: string[];
}

export function isDirectoryNode(node: unknown): node is DirectoryNode {
  return (
    typeof node === 'object' &&
    node !== null &&
    'type' in node &&
    (node as any).type === 'directory'
  );
}

export function filterTreeByExtensions(tree: DirectoryNode, extensions: string[]): DirectoryNode {
  const filteredChildren = tree.children
    .map(child => {
      if (child.type === 'directory') {
        const filteredDir = filterTreeByExtensions(child, extensions);
        return filteredDir.children.length > 0 ? filteredDir : null;
      }
      return extensions.includes(child.extension || '') ? child : null;
    })
    .filter((child): child is FileNode | DirectoryNode => child !== null);

  return {
    ...tree,
    children: filteredChildren
  };
}

export function findSubdirectoryInTree(tree: DirectoryNode, targetPath: string): DirectoryNode | null {
  if (!targetPath) return tree;

  const pathParts = targetPath.split('/').filter(Boolean);
  let currentNode: DirectoryNode | null = tree;

  for (const part of pathParts) {
    if (!currentNode) return null;

    const matchingChild = currentNode.children.find(
      child => child.type === 'directory' && child.name === part
    ) as DirectoryNode | undefined;

    if (!matchingChild) return null;
    currentNode = matchingChild;
  }

  return currentNode;
}

export function collectFilesFromDirectory(directory: DirectoryNode, fileExtensions: string[]): FileNode[] {
  const files: FileNode[] = [];

  const traverse = (node: DirectoryNode) => {
    for (const child of node.children) {
      if (child.type === 'directory') {
        traverse(child);
      } else if (fileExtensions.length === 0 || fileExtensions.includes(child.extension || '')) {
        files.push(child);
      }
    }
  };

  traverse(directory);
  return files;
}
