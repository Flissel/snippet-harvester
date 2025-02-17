
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

function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

function buildDirectoryTree(files: { path: string; type: string; sha: string }[], baseUrl: string): DirectoryNode {
  const root: DirectoryNode = { name: '', type: 'directory', children: [] };
  const extensions = new Set<string>();

  for (const file of files) {
    const parts = file.path.split('/');
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
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { repository_url } = await req.json()
    
    const url = new URL(repository_url)
    if (!url.hostname.includes('github.com')) {
      throw new Error('Invalid GitHub URL')
    }

    const [_, owner, repo] = url.pathname.split('/')
    if (!owner || !repo) {
      throw new Error('Invalid GitHub repository URL format')
    }

    const githubToken = Deno.env.get('GITHUB_TOKEN')
    if (!githubToken) {
      throw new Error('GitHub token not configured')
    }

    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }
    
    const jwt = authHeader.replace('Bearer ', '')
    const [_header, payload] = jwt.split('.')
    const decodedPayload = JSON.parse(atob(payload))
    const userId = decodedPayload.sub

    const githubResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`,
      {
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${githubToken}`,
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }
    )

    if (!githubResponse.ok) {
      const errorData = await githubResponse.json()
      console.error('GitHub API error:', errorData)
      throw new Error(`GitHub API error: ${githubResponse.statusText}`)
    }

    const data = await githubResponse.json()
    
    // Include all files
    const allFiles = data.tree.filter((item: any) => item.type === 'blob');
    
    // Build the directory tree and collect extensions
    const treeStructure = buildDirectoryTree(
      allFiles,
      `https://raw.githubusercontent.com/${owner}/${repo}/main`
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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabase = createClient(supabaseUrl!, supabaseKey!)

    const { data: insertedTree, error: treeError } = await supabase
      .from('repository_trees')
      .insert({
        repository_url,
        tree_structure: treeStructure,
        available_file_types: availableFileTypes,
        created_by: userId
      })
      .select()
      .single()

    if (treeError) {
      console.error('Supabase error:', treeError)
      throw treeError
    }

    return new Response(
      JSON.stringify(insertedTree),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})
