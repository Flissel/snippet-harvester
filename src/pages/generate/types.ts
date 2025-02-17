
export interface FileNode {
  name: string;
  type: 'file';
  path: string;
  sha: string;
  url: string;
  fileType?: 'python' | 'yaml' | 'toml' | 'requirements' | 'setup';
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

export interface ConfigurationTemplate {
  id: string;
  name: string;
  description?: string;
  file_path: string;
  content: string;
  template_type: 'yaml' | 'toml' | 'requirements' | 'setup';
  repository_tree_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
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

function getFileType(filename: string): FileNode['fileType'] | undefined {
  if (filename.endsWith('.py')) return 'python';
  if (filename.endsWith('.yml') || filename.endsWith('.yaml')) return 'yaml';
  if (filename.endsWith('.toml')) return 'toml';
  if (filename === 'requirements.txt') return 'requirements';
  if (filename === 'setup.py') return 'setup';
  return undefined;
}

export function collectFilesFromDirectory(
  node: DirectoryNode,
  fileTypes?: FileNode['fileType'][]
): FileNode[] {
  let files: FileNode[] = [];
  for (const child of node.children) {
    if (isFileNode(child)) {
      const fileType = getFileType(child.name);
      if (!fileTypes || (fileType && fileTypes.includes(fileType))) {
        files.push({ ...child, fileType });
      }
    } else if (isDirectoryNode(child)) {
      files = [...files, ...collectFilesFromDirectory(child, fileTypes)];
    }
  }
  return files;
}
