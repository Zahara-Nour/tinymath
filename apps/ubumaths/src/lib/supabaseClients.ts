import { createClient } from '@supabase/auth-helpers-sveltekit'
import {
	PUBLIC_SUPABASE_URL,
	PUBLIC_SUPABASE_ANON_KEY,
} from '$env/static/public'
import type { Database } from '../../types/supabase'

console.log('key', PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL)
const supabaseClient = createClient(
	PUBLIC_SUPABASE_URL,
	PUBLIC_SUPABASE_ANON_KEY,
)

export { supabaseClient }
