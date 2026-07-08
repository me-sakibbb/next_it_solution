const { createClient } = require('@supabase/supabase-js')
const path = require('path')
const dotenv = require('dotenv')

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase variables in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})

async function runTest() {
  const email = 'nexai6720@gmail.com'
  console.log(`Generating password recovery link for: ${email}`)

  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'recovery',
    email: email,
    options: {
      redirectTo: 'http://localhost:3000/auth/confirm?next=/auth/reset-password'
    }
  })

  if (error) {
    console.error('Error generating link:', error.message)
    process.exit(1)
  }

  console.log('Successfully generated link details:')
  console.log(JSON.stringify(data, null, 2))

  const properties = data.properties
  const tokenHash = properties.hashed_token

  if (!tokenHash) {
    console.error('No hashed_token returned in properties')
    process.exit(1)
  }

  console.log(`\nTesting verifyOtp for type: recovery, token_hash: ${tokenHash}`)

  // Create a separate client (anon key) to simulate the client/server route handler verifyOtp call
  const supabaseAnon = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  const { data: verifyData, error: verifyError } = await supabaseAnon.auth.verifyOtp({
    type: 'recovery',
    token_hash: tokenHash
  })

  if (verifyError) {
    console.error('verifyOtp verification failed:', verifyError.message)
  } else {
    console.log('verifyOtp verification succeeded!')
    console.log(JSON.stringify(verifyData, null, 2))
  }
}

runTest().catch((err) => {
  console.error('Unexpected test failure:', err)
})
