import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ fetch, params }) => {
	const group = encodeURI(JSON.stringify([params.slug]))
	const response = await fetch(`/api/posts?tags=${group}`)

	if (response.status === 404) {
		throw error(404, {
			message: 'Not found',
		})
	} else if (response.status === 500) {
		throw error(500, {
			message: 'Internal server error',
		})
	} else {
		const posts = await response.json()
		return {
			posts,
		}
	}
}
