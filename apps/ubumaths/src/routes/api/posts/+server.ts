import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { DB_fetchPost, DB_fetchPostsByTags } from '$lib/db'

export const GET = (async ({ locals: { supabaseService }, url }) => {
	const url_param_post_id = url.searchParams.get('post_id')
	const url_param_tags = url.searchParams.get('tags')
	console.log('url_param_tags', url_param_tags)
	const post_id = url_param_post_id ? parseInt(url_param_post_id, 10) : null
	const tags = url_param_tags ? JSON.parse(decodeURI(url_param_tags)) : null
	console.log('tags', tags)

	if (post_id) {
		const { data, error: err } = await DB_fetchPost(supabaseService, post_id)
		if (err) {
			console.log('error', err.message)
			throw error(500, ' ' + err.message)
		} else if (!data) {
			console.log('no data returned')
			throw error(404, 'Not found')
		} else {
			return json(data)
		}
	} else if (tags) {
		const { data, error: err } = await DB_fetchPostsByTags(
			supabaseService,
			tags,
		)
		if (err) {
			console.log('error', err.message)
			throw error(500, ' ' + err.message)
		} else if (!data) {
			console.log('no data returned')
			throw error(404, 'Not found')
		} else {
			return json(data)
		}
	} else {
		throw error(404, 'Not found')
	}
}) satisfies RequestHandler
