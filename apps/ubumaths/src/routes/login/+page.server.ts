import { AuthApiError, type Provider } from '@supabase/supabase-js'
import { fail, redirect } from '@sveltejs/kit'
import type { Actions } from './$types'

// const OAUTH_PROVIDERS = ['google', 'discord', 'github']
const OAUTH_PROVIDERS = ['google']

export const actions: Actions = {
	login: async ({ request, locals, url }) => {
		const provider = url.searchParams.get('provider') as Provider

		if (provider) {
			if (!OAUTH_PROVIDERS.includes(provider)) {
				return fail(400, {
					error: 'Provider not supported.',
				})
			}
			const { data, error: err } =
				await locals.supabaseClient.auth.signInWithOAuth({
					provider: provider,
				})

			if (err) {
				console.log(err)
				return fail(400, {
					message: 'Something went wrong.',
				})
			}

			console.log('data', data)
			// redirect to supabase oauth provider
			throw redirect(303, data.url)
		}

		const body = Object.fromEntries(await request.formData())
		const { data, error: err } =
			await locals.supabaseClient.auth.signInWithPassword({
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
