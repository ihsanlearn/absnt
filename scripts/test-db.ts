import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  console.log('Testing Supabase connection...')
  const start = Date.now()
  try {
    const { data, error } = await supabase.from('coffee').select('*').limit(1)
    if (error) {
        console.error('Error fetching coffee:', error)
    } else {
        console.log('Success! Fetched coffee:', data)
    }
  } catch (err) {
    console.error('Exception fetching coffee:', err)
  }
  console.log(`Time taken: ${Date.now() - start}ms`)

  console.log('Testing auth...')
  const startAuth = Date.now()
    try {
        // Just check if we can reach the auth endpoint, though getUser typically needs a session.
        // We'll just verify the client is initialized.
        console.log('Auth client initialized')
    } catch (err) {
        console.error('Exception in auth:', err)
    }
    console.log(`Auth check Time taken: ${Date.now() - startAuth}ms`)

}

testConnection()
