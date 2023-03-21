import { AuthApiError } from '@supabase/supabase-js'
import { fail, redirect } from '@sveltejs/kit'
import { SECRET_SUPABASE_SERVICE_ROLE } from '$env/static/private'
import type { Actions } from './$types'

export const actions: Actions = {
	register: async ({ request, locals }) => {
		const body = Object.fromEntries(await request.formData())

		if (
			!(
				body.email.includes('@voltairedoha.com') ||
				body.email === 'zahara.alnour@gmail.com'
			)
		) {
			return fail(401, {
				error:
					"Pour l'instant, seules les professeurs et élèves du lycée Voltaire peuvent s'inscrire !",
			})
		}
		const { data, error } = await locals.supabaseClient.auth.signUp({
			email: body.email as string,
			password: body.password as string,
		})
		if (error) {
			console.log('erreur', error)
			if (error instanceof AuthApiError) {
				return fail(error.status, { error: error.message })
			}
			return fail(500, { error: 'Server error. Please try again later' })
		}

		// need to check if the user has already been created by an admin or a teacher
		const { data: userData, error: userError } = await locals.supabaseClient
			.from('users')
			.select('*')
			.eq('email', body.email)
			.maybeSingle()
		if (userError) {
			console.log('erreur', userError)

			return fail(500, { error: 'Server error. Please try again later' })
		}
		if (!userData) {
			console.log('user id', data)
			const { error } = await locals.supabaseClient.auth.admin.deleteUser(
				SECRET_SUPABASE_SERVICE_ROLE,
				data.id,
			)

			return fail(412, {
				error:
					"L'utilisateur n'a pas été créé dans la base de données. Merci de demander à M. Le Jolly.",
			})
		}
		throw redirect(303, '/')
	},
}
