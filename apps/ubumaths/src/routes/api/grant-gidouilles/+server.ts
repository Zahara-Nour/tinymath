import {
	fetchDayTeacherStudents,
	fetchStudentWarnings,
	fetchTeacherStudents,
} from '$lib/db'
import { cleanProfile } from '$lib/users'
import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET = (async ({ locals: { supabaseService }, url }) => {
	const day = new Date().getDay()
	console.log('day', day)
	const { error: err, data } = await fetchTeacherStudents(supabaseService, 152)
	if (err) {
		console.log('grant-gidouilles Get * Error * :', err.message)
		throw error(500, ' ' + err.message)
	} else if (!data) {
		console.log('grant-gidouilles Get : no data returned')
		throw error(500, 'init-warnings Get : no data returned')
	} else {
		data.forEach(async ({ id: student_id }) => {
			const warnings = await fetchStudentWarnings(supabaseService, student_id)
		})

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
