
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
  fileType?: 'python' | 'yaml' | 'toml' | 'requirements' | 'setup';
}

interface DirectoryNode {
  name: string;
  type: 'directory';
  children: (DirectoryNode | FileNode)[];
}

function getFileType(filename: string): FileNode['fileType'] | undefined {
  if (filename.endsWith('.py')) return 'python';
  if (filename.endsWith('.yml') || filename.endsWith('.yaml')) return 'yaml';
  if (filename.endsWith('.toml')) return 'toml';
  if (filename === 'requirements.txt') return 'requirements';
  if (filename === 'setup.py') return 'setup';
  return undefined;
}

function buildDirectoryTree(files: { path: string; type: string; sha: string }[], baseUrl: string): DirectoryNode {
  const root: DirectoryNode = { name: '', type: 'directory', children: [] };

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
    currentNode.children.push({
      name: fileName,
      type: 'file',
      path: file.path,
      sha: file.sha,
      url: `${baseUrl}/${file.path}`,
      fileType: getFileType(fileName)
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
    
    // Filter Python and configuration files
    const relevantFiles = data.tree.filter((item: any) => 
      item.type === 'blob' && (
        item.path.endsWith('.py') ||
        item.path.endsWith('.yml') ||
        item.path.endsWith('.yaml') ||
        item.path.endsWith('.toml') ||
        item.path === 'requirements.txt' ||
        item.path === 'setup.py'
      )
    )

    // Build the directory tree
    const treeStructure = buildDirectoryTree(
      relevantFiles,
      `https://raw.githubusercontent.com/${owner}/${repo}/main`
    );

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabase = createClient(supabaseUrl!, supabaseKey!)

    const { data: insertedTree, error: treeError } = await supabase
      .from('repository_trees')
      .insert({
        repository_url,
        tree_structure: treeStructure,
        created_by: userId
      })
      .select()
      .single()

    if (treeError) {
      console.error('Supabase error:', treeError)
      throw treeError
    }

    // Fetch and store configuration files
    for (const file of relevantFiles) {
      const fileType = getFileType(file.path)
      if (fileType && fileType !== 'python') {
        const contentResponse = await fetch(
          `https://raw.githubusercontent.com/${owner}/${repo}/main/${file.path}`,
          {
            headers: {
              'Authorization': `Bearer ${githubToken}`,
            }
          }
        )

        if (contentResponse.ok) {
          const content = await contentResponse.text()
          
          const { error: configError } = await supabase
            .from('configuration_templates')
            .insert({
              name: file.path.split('/').pop(),
              file_path: file.path,
              content,
              template_type: fileType,
              repository_tree_id: insertedTree.id,
              created_by: userId
            })

          if (configError) {
            console.error('Error storing configuration template:', configError)
          }
        }
      }
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
