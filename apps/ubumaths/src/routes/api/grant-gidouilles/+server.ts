import {
	fetchDayTeacherStudents,
	fetchStudentWarnings,
	fetchStudentWarningsFromDateToDate,
	fetchTeacherStudents,
} from '$lib/db'
import { DateTime } from 'luxon'
import { cleanProfile } from '$lib/users'
import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import type { StudentProfile } from '../../../types/type'

export const GET = (async ({ locals: { supabaseService }, url }) => {
	// first fetch all my students
	const { error: err, data } = await fetchTeacherStudents(supabaseService, 152)
	if (err) {
		console.log('grant-gidouilles Get * Error * :', err.message)
		throw error(500, ' ' + err.message)
	} else if (!data) {
		console.log('grant-gidouilles Get : no data returned')
		throw error(500, 'grant-gidouilles Get : no data returned')
	} else {
		// then get their warnings and update gidouilles number if they have no warnings
		// updates is supposed to be done each saturday 5:00 AM
		// luxon: weeks begin on monday(1) and end on sunday(7)
		const Today = DateTime.now()
		const beginning = Today.startOf('week').minus({ days: 1 })
		const end = Today.startOf('week').plus({ days: 4 })
		console.log('begining', beginning.toISODate(), 'end', end.toISODate())
		data
			.map((profile) => cleanProfile(profile) as StudentProfile)
			.forEach(async ({ id: student_id, gidouilles, firstname }) => {
				try {
					const { error: err, data } = await fetchStudentWarningsFromDateToDate(
						supabaseService,
						student_id,
						beginning.toISODate(),
						end.toISODate(),
					)

					if (err) {
						console.log('grant-gidouilles Get * Error * :', err.message)
						throw error(500, ' ' + err.message)
					} else if (!data) {
						console.log('grant-gidouilles Get : no data returned')
						throw error(500, 'grant-gidouilles Get : no data returned')
					} else {
						const warningss = data.map(({ warnings }) => warnings)
						const granted =
							warningss.every(
								(warnings) =>
									warnings.length === 0 ||
									(warnings.length === 1 && warnings[0] === 'Absent'),
							) &&
							warningss.filter(
								(warnings) => warnings.length === 1 && warnings[0] === 'Absent',
							).length <= 1
						if (granted) {
							console.log('student', firstname, 'is granted 1 gidouille')
							const { error: errorUpdate } = await supabaseService
								.from('users')
								.update({ gidouilles: gidouilles + 1 })
								.eq('id', student_id)
							if (errorUpdate) {
								console.log(errorUpdate.message)
								throw error(500, errorUpdate.message)
							}
						} else {
							console.log('student', firstname, 'is NOT granted ', warningss)
						}
					}
				} catch (e) {
					console.log('error for student', firstname, e)
				}
			})

		// const rows: { student_id: number; warnings: string[]; date: string }[] = []
		// data
		// 	.map((row) => cleanProfile(row))
		// 	.forEach((student) => {
		// 		rows.push({ student_id: student.id, warnings: [], date: '2023-03-29' })
		// 	})
		// if (rows.length) {
		// 	const { error: errorInsert } = await supabaseService
		// 		.from('warnings')
		// 		.insert(rows)
		// 	if (errorInsert) {
		// 		console.log(errorInsert.message)
		// 		throw error(500, errorInsert.message)
		// 	} else {
		// 		return json(rows)
		// 	}
		// } else return json('no rows')
		console.log('gidouilles granted')
		return json('gidouilles granted')
	}
}) satisfies RequestHandler
