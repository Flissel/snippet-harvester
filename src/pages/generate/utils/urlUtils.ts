
export function getSubdirectoryFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split('/');
    const treeIndex = parts.indexOf('tree');
    if (treeIndex !== -1 && parts.length > treeIndex + 2) {
      return parts.slice(treeIndex + 2).join('/');
    }
    return '';
  } catch {
    return '';
  }
}
