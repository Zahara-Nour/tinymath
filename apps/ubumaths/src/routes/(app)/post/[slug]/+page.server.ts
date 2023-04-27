import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, fetch }) => {
	const post_id = parseInt(params.slug, 10)
	const response = await fetch(`/api/posts?post_id=${post_id}`)
	if (response.status === 404) {
		throw error(404, {
			message: 'Not found',
		})
	} else if (response.status === 500) {
		throw error(500, {
			message: 'Internal server error',
		})
	} else {
		const post = response.json()

		return {
			post,
		}
	}
}
