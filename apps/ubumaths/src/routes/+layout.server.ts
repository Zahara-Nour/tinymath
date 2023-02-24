import type { LayoutServerLoad } from './$types'
import { getServerSession } from '@supabase/auth-helpers-sveltekit'

// pass the user session to the client
export const load: LayoutServerLoad = async (event) => {
	return {
		session: await getServerSession(event),
	}
}
