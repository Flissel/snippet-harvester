
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FileNode {
  name: string;
  type: 'file';
  path: string;
  sha: string;
  url: string;
  extension?: string;
}

interface DirectoryNode {
  name: string;
  type: 'directory';
  children: (DirectoryNode | FileNode)[];
}

interface GitHubPathInfo {
  owner: string;
  repo: string;
  branch: string;
  subdirectory: string;
}

function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

function parseGitHubUrl(urlString: string): GitHubPathInfo {
  const url = new URL(urlString);
  const pathParts = url.pathname.split('/').filter(Boolean);
  
  // Extract owner and repo
  const owner = pathParts[0];
  const repo = pathParts[1];
  
  if (!owner || !repo) {
    throw new Error('Invalid GitHub URL: Missing owner or repository name');
  }

  let branch = 'main';
  let subdirectory = '';

  // Check for tree/blob paths
  const treeIndex = pathParts.indexOf('tree');
  const blobIndex = pathParts.indexOf('blob');
  const branchIndex = treeIndex !== -1 ? treeIndex : blobIndex;

  if (branchIndex !== -1 && pathParts.length > branchIndex + 1) {
    branch = pathParts[branchIndex + 1];
    subdirectory = pathParts.slice(branchIndex + 2).join('/');
  }

  return { owner, repo, branch, subdirectory };
}

function buildDirectoryTree(files: { path: string; type: string; sha: string }[], baseUrl: string, subdirectory: string): DirectoryNode {
  const root: DirectoryNode = { name: '', type: 'directory', children: [] };
  const extensions = new Set<string>();

  // Filter files based on subdirectory
  const relevantFiles = subdirectory
    ? files.filter(file => file.path.startsWith(subdirectory))
    : files;

  for (const file of relevantFiles) {
    // Remove subdirectory prefix from path if it exists
    const relativePath = subdirectory
      ? file.path.slice(subdirectory.length + (subdirectory.endsWith('/') ? 0 : 1))
      : file.path;
    
    const parts = relativePath.split('/');
    let currentNode = root;

    // Create or traverse the directory structure
    for (let i = 0; i < parts.length - 1; i++) {
      const partName = parts[i];
      let found = currentNode.children.find(
        child => child.type === 'directory' && child.name === partName
      ) as DirectoryNode;

      if (!found) {
        found = { name: partName, type: 'directory', children: [] };
        currentNode.children.push(found);
      }
      currentNode = found;
    }

    // Add the file to its directory
    const fileName = parts[parts.length - 1];
    const extension = getFileExtension(fileName);
    if (extension) {
      extensions.add(extension);
    }

    currentNode.children.push({
      name: fileName,
      type: 'file',
      path: file.path,
      sha: file.sha,
      url: `${baseUrl}/${file.path}`,
      extension
    });
  }

  return root;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { repository_url } = await req.json();
    console.log('Processing repository URL:', repository_url);
    
    const { owner, repo, branch, subdirectory } = parseGitHubUrl(repository_url);
    console.log('Parsed URL info:', { owner, repo, branch, subdirectory });

    const githubToken = Deno.env.get('GITHUB_TOKEN');
    if (!githubToken) {
      throw new Error('GitHub token not configured');
    }

    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }
    
    const jwt = authHeader.replace('Bearer ', '');
    const [_header, payload] = jwt.split('.');
    const decodedPayload = JSON.parse(atob(payload));
    const userId = decodedPayload.sub;

    // First, get repository metadata to verify access and default branch
    const repoResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${githubToken}`,
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }
    );

    if (!repoResponse.ok) {
      const errorData = await repoResponse.json();
      console.error('GitHub API error:', errorData);
      throw new Error(`Repository not found or not accessible: ${repoResponse.statusText}`);
    }

    const repoData = await repoResponse.json();
    const defaultBranch = repoData.default_branch;
    const branchToUse = branch || defaultBranch;

    // Get the tree for the specified branch
    const treeResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${branchToUse}?recursive=1`,
      {
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${githubToken}`,
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }
    );

    if (!treeResponse.ok) {
      const errorData = await treeResponse.json();
      console.error('GitHub API error:', errorData);
      throw new Error(`Failed to fetch repository tree: ${treeResponse.statusText}`);
    }

    const data = await treeResponse.json();
    
    // Include all files
    const allFiles = data.tree.filter((item: any) => item.type === 'blob');
    
    // Build the directory tree and collect extensions
    const treeStructure = buildDirectoryTree(
      allFiles,
      `https://raw.githubusercontent.com/${owner}/${repo}/${branchToUse}`,
      subdirectory
    );

    // Get unique file extensions
    const availableFileTypes = Array.from(
      new Set(
        allFiles
          .map((file: any) => getFileExtension(file.path))
          .filter(Boolean)
      )
    ).sort();

    console.log('Available file types:', availableFileTypes);
    console.log('Subdirectory being processed:', subdirectory);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    const { data: insertedTree, error: treeError } = await supabase
      .from('repository_trees')
      .insert({
        repository_url,
        tree_structure: treeStructure,
        available_file_types: availableFileTypes,
        created_by: userId
      })
      .select()
      .single();

    if (treeError) {
      console.error('Supabase error:', treeError);
      throw treeError;
    }

    return new Response(
      JSON.stringify(insertedTree),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
