/**
 * Check Current Authenticated User
 *
 * 실행: node scripts/check-current-user.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables manually
const envPath = resolve(__dirname, '../.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const trimmed = line.trim()
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=')
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '')
    }
  }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase credentials not found in .env.local')
  process.exit(1)
}

console.log('🔧 Connecting to Supabase with anon key...')
console.log('URL:', supabaseUrl)

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkCurrentUser() {
  try {
    console.log('\n👤 Checking current authenticated user...')

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      console.error('❌ Error getting current user:', error.message)
      console.log('\n⚠️  No user is currently authenticated.')
      console.log('💡 This script needs to run in a browser context with an active session.')
      return
    }

    if (!user) {
      console.log('⚠️  No user is currently authenticated.')
      console.log('💡 Please log in through the web app first.')
      return
    }

    console.log('\n✅ Current authenticated user:')
    console.log('   User ID:', user.id)
    console.log('   Email:', user.email)
    console.log('   Created:', new Date(user.created_at).toLocaleString('ko-KR'))
    console.log('   Last sign in:', user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('ko-KR') : 'N/A')

    console.log('\n📋 Checking if this user matches expected user_id...')
    const expectedUserId = '19c1cd9e-1e83-41b8-a1e5-b72c5be15e8f'

    if (user.id === expectedUserId) {
      console.log('✅ User ID matches expected value')
    } else {
      console.log('⚠️  User ID DOES NOT match!')
      console.log('   Expected:', expectedUserId)
      console.log('   Actual:  ', user.id)
      console.log('\n💡 This might explain why documents are not being saved.')
      console.log('   Update the user_id in your code to:', user.id)
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

checkCurrentUser()
