/**
 * LinguAI Database Setup Script
 * Run once to set up tables, RLS policies, and create users
 * Usage: node scripts/setup-db.mjs
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function runSQL(sql, label) {
  const { error } = await supabase.rpc('exec_sql', { sql_query: sql }).maybeSingle()
  if (error) {
    // Try via REST API if rpc not available
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ sql_query: sql }),
    })
    if (!res.ok) {
      console.warn(`  [WARN] ${label}: RPC not available, will need manual SQL`)
      return false
    }
  }
  console.log(`  [OK] ${label}`)
  return true
}

async function setupTables() {
  console.log('\n=== Setting up LinguAI Database ===\n')

  // Step 1: Clean existing data
  console.log('1. Cleaning existing data...')
  const { error: e1 } = await supabase.from('linguai_messages').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  const { error: e2 } = await supabase.from('linguai_conversations').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  console.log('  [OK] Existing data cleaned')

  // Step 2: Check if linguai_files table exists, if not log SQL
  console.log('2. Checking linguai_files table...')
  const { error: tableCheck } = await supabase.from('linguai_files').select('id').limit(1)
  if (tableCheck && tableCheck.code === '42P01') {
    console.log('  [INFO] linguai_files table does not exist yet')
    console.log('  [ACTION REQUIRED] Run this SQL in Supabase Dashboard > SQL Editor:')
    console.log(`
-- Create linguai_files table
CREATE TABLE IF NOT EXISTS linguai_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL,
  conversation_id UUID NOT NULL,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_linguai_files_message_id ON linguai_files(message_id);
CREATE INDEX IF NOT EXISTS idx_linguai_files_conversation_id ON linguai_files(conversation_id);
    `)
  } else {
    console.log('  [OK] linguai_files table exists')
  }

  // Step 3: Check conversations table user_id column type
  console.log('3. Checking user_id column type...')
  console.log('  [ACTION REQUIRED] If user_id is TEXT, run this SQL:')
  console.log(`
-- Change user_id column from TEXT to UUID
ALTER TABLE linguai_conversations DROP COLUMN IF EXISTS user_id;
ALTER TABLE linguai_conversations ADD COLUMN user_id UUID NOT NULL DEFAULT gen_random_uuid();
  `)
}

async function setupRLS() {
  console.log('\n4. RLS Policies...')
  console.log('  [ACTION REQUIRED] Run this SQL in Supabase Dashboard > SQL Editor:')
  console.log(`
-- Enable RLS
ALTER TABLE linguai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE linguai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE linguai_files ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Users view own conversations" ON linguai_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own conversations" ON linguai_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own conversations" ON linguai_conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own conversations" ON linguai_conversations FOR DELETE USING (auth.uid() = user_id);

-- Messages policies (via conversation ownership)
CREATE POLICY "Users view own messages" ON linguai_messages FOR SELECT USING (
  conversation_id IN (SELECT id FROM linguai_conversations WHERE user_id = auth.uid())
);
CREATE POLICY "Users insert own messages" ON linguai_messages FOR INSERT WITH CHECK (
  conversation_id IN (SELECT id FROM linguai_conversations WHERE user_id = auth.uid())
);

-- Files policies
CREATE POLICY "Users view own files" ON linguai_files FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users insert own files" ON linguai_files FOR INSERT WITH CHECK (user_id = auth.uid());
  `)
}

async function createUsers() {
  console.log('\n5. Creating users...')

  const users = [
    { email: 'ayla@linguai.app', password: 'Ayla2024!', name: 'AYLA' },
    { email: 'zderen@linguai.app', password: 'Zd2024!', name: 'ZDEREN' },
  ]

  for (const u of users) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true, // Skip email verification
      user_metadata: { display_name: u.name },
    })

    if (error) {
      if (error.message.includes('already been registered')) {
        console.log(`  [SKIP] ${u.name} (${u.email}) already exists`)
      } else {
        console.error(`  [ERROR] ${u.name}: ${error.message}`)
      }
    } else {
      console.log(`  [OK] ${u.name} created (${u.email}) - ID: ${data.user.id}`)
    }
  }
}

async function main() {
  await setupTables()
  await setupRLS()
  await createUsers()

  console.log('\n=== Setup Complete ===')
  console.log('\nUser credentials:')
  console.log('  AYLA:   ayla@linguai.app / Ayla2024!')
  console.log('  ZDEREN: zderen@linguai.app / Zd2024!')
  console.log('\n[!] If SQL commands were printed above, run them in Supabase Dashboard > SQL Editor')
}

main().catch(console.error)
