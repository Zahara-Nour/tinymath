import {
	PUBLIC_SUPABASE_ANON_KEY,
	PUBLIC_SUPABASE_URL,
} from '$env/static/public'
import { createSupabaseLoadClient } from '@supabase/auth-helpers-sveltekit'
import type { LayoutLoad } from './$types'
import type { Database } from '../../types/supabase'

// The client can be accessed inside pages by $page.data.supabase or data.supabase when using export let data: PageData.
// The usage of depends tells sveltekit that this load function should be executed whenever invalidate is called to keep the page store in sync.
// createSupabaseLoadClient caches the client when running in a browser environment and therefore does not create a new client for every time the load function runs.

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
	depends('supabase:auth')

	const supabase = createSupabaseLoadClient<Database>({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
		event: { fetch },
		serverSession: data.session,
	})

	return { supabase, ...data }
}
