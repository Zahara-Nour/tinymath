import {
	fetchDayTeacherStudents,
	fetchStudentWarnings,
	fetchStudentWarningsFromDateToDate,
	fetchTeacherStudents,
} from '$lib/db'
import { cleanProfile } from '$lib/users'
import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import type { StudentProfile } from '../../../types/type'

export const GET = (async ({ locals: { supabaseService }, url }) => {
	const day = new Date().getDay()
	console.log('day', day)
	const { error: err, data } = await fetchTeacherStudents(supabaseService, 152)
	if (err) {
		console.log('grant-gidouilles Get * Error * :', err.message)
		throw error(500, ' ' + err.message)
	} else if (!data) {
		console.log('grant-gidouilles Get : no data returned')
		throw error(500, 'grant-gidouilles Get : no data returned')
	} else {
		data
			.map((profile) => cleanProfile(profile) as StudentProfile)
			.forEach(async ({ id: student_id, gidouilles }) => {
				const { error: err, data } = await fetchStudentWarningsFromDateToDate(
					supabaseService,
					student_id,
					'2021-03-29',
					'2023-03-29',
				)

				if (err) {
					console.log('grant-gidouilles Get * Error * :', err.message)
					throw error(500, ' ' + err.message)
				} else if (!data) {
					console.log('grant-gidouilles Get : no data returned')
					throw error(500, 'grant-gidouilles Get : no data returned')
				} else {
					const warningss = data.map(({ warnings }) => warnings)
					const granted = warningss.every(
						(warnings) =>
							warningss.length === 0 ||
							(warnings.length === 1 && warnings[0] === 'Absent'),
					)
					if (granted) {
						const { error: errorUpdate } = await supabaseService
							.from('users')
							.update({ gidouilles: gidouilles + 1 })
							.eq('id', student_id)
						if (errorUpdate) {
							console.log(errorUpdate.message)
							throw error(500, errorUpdate.message)
						}
					}
				}
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
