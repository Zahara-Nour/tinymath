import { AuthApiError, type Provider } from '@supabase/supabase-js'
import { fail, redirect } from '@sveltejs/kit'
import type { Actions } from './$types'

export const actions: Actions = {
	login: async ({ request, locals }) => {
		const body = Object.fromEntries(await request.formData())
		const { data, error: err } = await locals.supabase.auth.signInWithPassword({
			email: body.email as string,
			password: body.password as string,
		})
		if (err) {
			if (err instanceof AuthApiError) {
				return fail(err.status, { error: err.status + ' : ' + err.message })
			}
			return fail(500, { error: 'Server error. Please try again later' })
		}

		throw redirect(303, '/')
	},
}
