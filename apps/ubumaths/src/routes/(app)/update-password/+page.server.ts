import { fail, redirect } from '@sveltejs/kit'
import type { Actions } from './$types'

export const actions: Actions = {
	update: async ({ request, locals }) => {
		const body = Object.fromEntries(await request.formData())
		const { error: err } = await locals.supabase.auth.updateUser({
			password: body.password as string,
		})
		if (err) {
			console.log(err.message)
			return fail(500, { error: err.message })
		} else {
			throw redirect(303, '/')
		}
	},
}
