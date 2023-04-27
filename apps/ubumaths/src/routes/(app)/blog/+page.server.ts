import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ fetch }) => {
	const tags = encodeURI(JSON.stringify(['Histoire', 'Personnalité', '5A']))
	const response = await fetch(`/api/posts?tags=${tags}`)

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
