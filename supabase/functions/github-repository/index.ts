
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'
import { decode as decodeJWT } from "https://deno.land/x/djwt@v2.9.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TreeNode {
  path: string;
  type: 'tree' | 'blob';
  sha: string;
  url: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { repository_url } = await req.json()
    
    // Parse GitHub URL
    const url = new URL(repository_url)
    if (!url.hostname.includes('github.com')) {
      throw new Error('Invalid GitHub URL')
    }

    // Extract owner and repo from URL
    const [_, owner, repo] = url.pathname.split('/')
    if (!owner || !repo) {
      throw new Error('Invalid GitHub repository URL format')
    }

    const githubToken = Deno.env.get('GITHUB_TOKEN')
    if (!githubToken) {
      throw new Error('GitHub token not configured')
    }

    // Extract user ID from JWT
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }
    
    const jwt = authHeader.replace('Bearer ', '')
    const [_header, payload] = jwt.split('.')
    const decodedPayload = JSON.parse(atob(payload))
    const userId = decodedPayload.sub

    console.log(`Fetching repository data for ${owner}/${repo}`)

    // Get repository tree from GitHub API
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
    
    // Filter for Python files and create tree structure
    const pythonFiles = data.tree.filter((item: TreeNode) => 
      item.type === 'blob' && item.path.endsWith('.py')
    )

    // Create tree structure
    const treeStructure = pythonFiles.map((file: TreeNode) => ({
      path: file.path,
      type: file.type,
      sha: file.sha,
      url: `https://raw.githubusercontent.com/${owner}/${repo}/main/${file.path}`
    }))

    // Store in Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabase = createClient(supabaseUrl!, supabaseKey!)

    const { data: insertedTree, error } = await supabase
      .from('repository_trees')
      .insert({
        repository_url,
        tree_structure: treeStructure,
        created_by: userId // Use the extracted user ID instead of the full JWT
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
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
