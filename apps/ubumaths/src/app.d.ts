// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types

import type {
	GoTrueAdminApi,
	Session,
	SupabaseClient,
} from '@supabase/supabase-js'
import { Database } from './types/supabase'

declare global {
	declare namespace App {
		interface Supabase {
			// Use the path to where you generated the types using the Supbase CLI.
			Database: Database
		}
		interface Locals {
			supabase: SupabaseClient<Database>
			getSession(): Promise<Session | null>
			adminAuth: GoTrueAdminApi
		}
		interface PageData {
			session: Session | null
		}
		// interface Error {}
		// interface Platform {}
	}
}
