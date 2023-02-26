import type { QuestionWithID } from '$lib/type'
import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET = (async ({ url }) => {
	const theme = url.searchParams.get('theme') ?? ''
	const domain = url.searchParams.get('domain') ?? ''
	const subdomain = url.searchParams.get('subdomain') ?? ''
	const level = Number(url.searchParams.get('level')) ?? 0

	const { default: qs } = await import('$lib/questions/questions')

	const response =
		theme && domain && subdomain && level
			? json(qs.questions[theme][domain][subdomain][level])
			: null
	if (!response) throw error(404, 'Not found')
	return response
}) satisfies RequestHandler
