// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types

import type { TypedSupabaseClient } from '@supabase/auth-helpers-sveltekit'
import type { Session } from '@supabase/supabase-js'

declare global {
	declare namespace App {
		interface Supabase {
			// Use the path to where you generated the types using the Supbase CLI.
			Database: import('../types/supabase').Database
			SchemaName: 'public'
		}
		interface Locals {
			supabaseClient: TypedSupabaseClient
			session: Session | null
		}
		interface PageData {
			session: import('@supabase/supabase-js').Session | null
		}
		// interface PageData {}
		// interface Error {}
		// interface Platform {}
	}
}
