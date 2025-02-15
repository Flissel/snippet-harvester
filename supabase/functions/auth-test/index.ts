
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Test data
    const testUser = {
      email: `test${Date.now()}@example.com`,
      password: 'test123456',
      displayName: 'Test User'
    }

    const testOrg = {
      name: `Test Org ${Date.now()}`,
      description: 'Test Organization Description'
    }

    console.log('Starting auth test with:', { testUser, testOrg })

    // Step 1: Create organization
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .insert(testOrg)
      .select()
      .single()

    if (orgError) {
      throw new Error(`Organization creation failed: ${orgError.message}`)
    }

    console.log('Organization created:', orgData)

    // Step 2: Create user
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: testUser.email,
      password: testUser.password,
      email_confirm: true,
      user_metadata: {
        display_name: testUser.displayName
      }
    })

    if (userError) {
      throw new Error(`User creation failed: ${userError.message}`)
    }

    console.log('User created:', userData)

    // Step 3: Create organization member entry
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: orgData.id,
        user_id: userData.user.id,
        role: 'admin'
      })

    if (memberError) {
      throw new Error(`Organization member creation failed: ${memberError.message}`)
    }

    console.log('Organization member created')

    // Step 4: Update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ last_used_organization_id: orgData.id })
      .eq('id', userData.user.id)

    if (profileError) {
      throw new Error(`Profile update failed: ${profileError.message}`)
    }

    console.log('Profile updated')

    // Step 5: Test sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password,
    })

    if (signInError) {
      throw new Error(`Sign in test failed: ${signInError.message}`)
    }

    console.log('Sign in successful:', signInData)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Auth test completed successfully',
        testData: {
          user: userData.user,
          organization: orgData,
          signIn: signInData
        }
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Test failed:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
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
