import { DB_fetchDayTeacherStudents, DB_fetchTeacherStudents } from '$lib/db'
import { cleanProfile } from '$lib/users'
import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET = (async ({ locals: { supabaseService }, url }) => {
	const day = new Date().getDay()
	console.log('day', day)
	const { error: err, data } = await DB_fetchDayTeacherStudents(
		supabaseService,
		152,
		2,
	)
	if (err) {
		console.log('init-warnings Get * Error * :', err.message)
		throw error(500, ' ' + err.message)
	} else if (!data) {
		console.log('init-warnings Get : no data returned')
		throw error(500, 'init-warnings Get : no data returned')
	} else {
		const rows: { student_id: number; warnings: string[]; date: string }[] = []
		data
			.map((row) => cleanProfile(row))
			.forEach((student) => {
				rows.push({ student_id: student.id, warnings: [], date: '2023-03-29' })
			})
		if (rows.length) {
			const { error: errorInsert } = await supabaseService
				.from('warnings')
				.insert(rows)
			if (errorInsert) {
				console.log(errorInsert.message)
				throw error(500, errorInsert.message)
			} else {
				return json(rows)
			}
		} else return json('no rows')
	}
}) satisfies RequestHandler
