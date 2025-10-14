/**
 * Supabase Documents 테이블 확인 스크립트
 *
 * 실행: node scripts/check-supabase-documents.js
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables manually (no dotenv dependency)
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
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase credentials not found in .env.local')
  process.exit(1)
}

console.log('🔧 Connecting to Supabase...')
console.log('URL:', supabaseUrl)

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkDocuments() {
  try {
    // 1. 인증된 사용자 확인 (실제 앱에서 사용하는 user_id)
    const userId = '19c1cd9e-1e83-41b8-a1e5-b72c5be15e8f'
    console.log('\n👤 Checking for user_id:', userId)

    // 2. RLS 정책 없이 모든 documents 조회 (service role key 사용)
    console.log('\n📊 Querying ALL documents (bypassing RLS)...')
    const { data: allDocs, error: allError } = await supabase
      .from('documents')
      .select('*')

    if (allError) {
      console.error('❌ Error fetching all documents:', allError)
    } else {
      console.log(`✅ Total documents in database: ${allDocs?.length || 0}`)
      if (allDocs && allDocs.length > 0) {
        console.log('\n📄 All documents:')
        allDocs.forEach((doc, index) => {
          console.log(`  ${index + 1}. ID: ${doc.id}`)
          console.log(`     Title: ${doc.title}`)
          console.log(`     User ID: ${doc.user_id}`)
          console.log(`     Project ID: ${doc.project_id}`)
          console.log(`     Type: ${doc.type}`)
          console.log(`     Created: ${doc.created_at}`)
          console.log('')
        })
      }
    }

    // 3. 특정 user_id의 documents 조회
    console.log(`\n🔍 Querying documents for user_id: ${userId}...`)
    const { data: userDocs, error: userError } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)

    if (userError) {
      console.error('❌ Error fetching user documents:', userError)
    } else {
      console.log(`✅ User documents found: ${userDocs?.length || 0}`)
      if (userDocs && userDocs.length > 0) {
        console.log('\n📄 User documents:')
        userDocs.forEach((doc, index) => {
          console.log(`  ${index + 1}. ${doc.title} (${doc.type})`)
          console.log(`     Project: ${doc.project_id}`)
        })
      }
    }

    // 4. RLS 정책 확인 (pg_policies 테이블)
    console.log('\n🔐 Checking RLS policies for documents table...')
    const { data: policies, error: policyError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'documents')

    if (policyError) {
      console.log('⚠️  Could not fetch RLS policies (might need service role key)')
      console.log('    Error:', policyError.message)
    } else if (policies && policies.length > 0) {
      console.log(`✅ Found ${policies.length} RLS policies:`)
      policies.forEach((policy, index) => {
        console.log(`  ${index + 1}. ${policy.policyname}`)
        console.log(`     Command: ${policy.cmd}`)
        console.log(`     Using: ${policy.qual}`)
        console.log('')
      })
    } else {
      console.log('⚠️  No RLS policies found for documents table')
    }

    // 5. 최근 생성된 문서 확인
    console.log('\n📅 Checking most recently created documents...')
    const { data: recentDocs, error: recentError } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (recentError) {
      console.error('❌ Error fetching recent documents:', recentError)
    } else if (recentDocs && recentDocs.length > 0) {
      console.log(`✅ Last ${recentDocs.length} documents:`)
      recentDocs.forEach((doc, index) => {
        const createdDate = new Date(doc.created_at).toLocaleString('ko-KR')
        console.log(`  ${index + 1}. ${doc.title}`)
        console.log(`     Created: ${createdDate}`)
        console.log(`     User: ${doc.user_id}`)
        console.log(`     Project: ${doc.project_id}`)
        console.log('')
      })
    } else {
      console.log('📭 No documents found in the database')
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

checkDocuments()
