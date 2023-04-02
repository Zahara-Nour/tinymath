import {
	PUBLIC_SUPABASE_URL,
	PUBLIC_SUPABASE_ANON_KEY,
} from '$env/static/public'
import { SECRET_SUPABASE_SERVICE_ROLE } from '$env/static/private'
import type { Handle } from '@sveltejs/kit'
import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit'
import { createClient } from '@supabase/supabase-js'

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createSupabaseServerClient({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
		event,
	})

	event.locals.adminAuth = createClient(
		PUBLIC_SUPABASE_URL,
		SECRET_SUPABASE_SERVICE_ROLE,
		{
			auth: {
				autoRefreshToken: false,
				persistSession: false,
			},
		},
	).auth.admin

	event.locals.supabaseService = createClient(
		PUBLIC_SUPABASE_URL,
		SECRET_SUPABASE_SERVICE_ROLE,
	)

	/**
	 * a little helper that is written for convenience so that instead
	 * of calling `const { data: { session } } = await supabase.auth.getSession()`
	 * you just call this `await getSession()`
	 */
	event.locals.getSession = async () => {
		const {
			data: { session },
		} = await event.locals.supabase.auth.getSession()
		return session
	}

	return resolve(event, {
		/**
		 * There´s an issue with `filterSerializedResponseHeaders` not working when using `sequence`
		 *
		 * https://github.com/sveltejs/kit/issues/8061
		 */
		filterSerializedResponseHeaders(name) {
			return name === 'content-range'
		},
	})
}
