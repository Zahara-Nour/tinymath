import { error, redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ locals }) => {
	const { error: err } = await locals.supabase.auth.signOut()
	if (err) {
		throw error(
			500,
			'Something went wrong logging you out. Please try again later',
		)
	}
	throw redirect(303, '/')
}
