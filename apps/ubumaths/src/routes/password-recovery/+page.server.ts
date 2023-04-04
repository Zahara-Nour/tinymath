import { AuthApiError, type Provider } from '@supabase/supabase-js'
import { fail, redirect } from '@sveltejs/kit'
import type { Actions } from './$types'

export const actions: Actions = {
	recovery: async ({ request, locals }) => {
		const body = Object.fromEntries(await request.formData())
		const { error: err } = await locals.supabase.auth.resetPasswordForEmail(
			body.email as string,
			{ redirectTo: 'https://ubumaths.net/update-password' },
		)
		if (err) {
			console.log(err.message)
			return fail(500, { error: err.message })
		}

		return { success: true }
	},
}
