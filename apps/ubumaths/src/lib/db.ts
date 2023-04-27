import { getLogger } from '$lib/utils'

const { info, fail, warn } = getLogger('db', 'info')
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'
import type { Assignment, UserProfile } from '../types/type'
import { createClient } from '@supabase/supabase-js'
import {
	PUBLIC_SUPABASE_URL,
	PUBLIC_SUPABASE_ANON_KEY,
} from '$env/static/public'

const db = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY)
export default db

export function addUser(
	supabase: SupabaseClient<Database>,
	profile: UserProfile,
) {
	return supabase.from('users').insert([
		{
			...profile,
			vips: profile.vips ? JSON.stringify(profile.vips) : null,
		},
	])
}

export function updateUserProfile(
	supabase: SupabaseClient<Database>,
	{ id, ...infos }: UserProfile,
) {
	return supabase
		.from('users')
		.update({ ...infos, vips: infos.vips ? JSON.stringify(infos.vips) : null })
		.eq('id', id)
}

export function fetchUser(supabase: SupabaseClient<Database>, user_id: string) {
	return supabase
		.from('users')
		.select(
			'id, firstname, lastname, role, email, school_id, teacher_id, grade, auth_id, classe_ids, gidouilles, vips',
		)
		.eq('id', user_id)
		.maybeSingle()
}

export function fetchUserByEmail(
	supabase: SupabaseClient<Database>,
	email: string,
) {
	return supabase
		.from('users')
		.select(
			'id, firstname, lastname, role, email, school_id, teacher_id, grade, auth_id, classe_ids, gidouilles, vips',
		)
		.eq('email', email)
		.maybeSingle()
}

// fetch teacher and students classes
export async function fetchUserClasses(
	supabase: SupabaseClient<Database>,
	user_id: number,
) {
	// fetch classes Ids of user
	const { data: classeIdsData, error: classesIdsError } = await supabase
		.from('users')
		.select('classe_ids')
		.eq('id', user_id)
		.maybeSingle()

	if (classesIdsError) {
		return { data: null, error: classesIdsError }
	} else if (!classeIdsData || !classeIdsData.classe_ids) {
		return {
			data: null,
			error: null,
		}
	}

	const classe_ids = classeIdsData.classe_ids
	return supabase
		.from('classes')
		.select('name, id, grade, school_id, schedule')
		.in('id', classe_ids)
}

export async function fetchStudentPendingAssignments(
	supabase: SupabaseClient<Database>,
	student_id: number,
) {
	return supabase
		.from('assignments')
		.select(
			'id, teacher_id, student_id, status, total, mark, questions, basket, title',
		)
		.match({ student_id, status: 'pending' })
}

export async function fetchTeacherStudents(
	supabase: SupabaseClient<Database>,
	teacher_id: number,
) {
	return supabase
		.from('users')
		.select(
			'auth_id, role, grade, email, firstname, lastname, id, classe_ids, school_id, teacher_id, gidouilles, vips',
		)
		.eq('role', 'student')
		.eq('teacher_id', teacher_id)
}

export async function fetchDayTeacherStudents(
	supabase: SupabaseClient<Database>,
	teacher_id: number,
	day: number,
) {
	const request = await fetchUserClasses(supabase, teacher_id)
	if (request.error) {
		console.log('fetchDayTeacherStudents * Error * :', request.error.message)
		return request
	} else if (!request.data) {
		console.log('fetchDayTeacherStudents :', 'no classes returned')
		return request
	} else {
		const classe_ids = request.data
			.filter((c) => c.schedule.includes(day))
			.map((c) => c.id)
		return supabase
			.from('users')
			.select('*')
			.containedBy('classe_ids', classe_ids)
			.eq('role', 'student')
	}
}

export async function fetchClasseStudents(
	supabase: SupabaseClient<Database>,
	classe_id: number,
) {
	return supabase
		.from('users')
		.select(
			'auth_id, role, grade, email, firstname, lastname, id, classe_ids, school_id, teacher_id, gidouilles, vips',
		)
		.eq('role', 'student')
		.contains('classe_ids', [classe_id])
}

export async function fetchSchoolClasses(
	supabase: SupabaseClient<Database>,
	school_id: number,
) {
	return supabase
		.from('classes')
		.select('id, name, grade, school_id, schedule')
		.eq('school_id', school_id)
}

export function addClass(
	supabase: SupabaseClient<Database>,
	{
		name,
		grade,
		school_id,
	}: {
		name: string
		grade: string
		school_id: number
	},
) {
	return supabase.from('classes').insert([{ name, grade, school_id }])
}

export async function fetchSchools(supabase: SupabaseClient<Database>) {
	return supabase.from('schools').select('id, city, country, name')
}

export async function fetchSchoolTeachers(
	supabase: SupabaseClient<Database>,
	school_id: number,
) {
	return supabase
		.from('users')
		.select(
			'auth_id, role, email, firstname, lastname, id, classe_ids, school_id',
		)
		.eq('role', 'teacher')
		.eq('school_id', school_id)
}

export async function fetchTeacherAssessments(
	supabase: SupabaseClient<Database>,
	teacher_id: number,
) {
	return supabase
		.from('assessments')
		.select('id, title, questions, teacher_id')
		.eq('teacher_id', teacher_id)
}

export async function fetchAssessment(
	supabase: SupabaseClient<Database>,
	assessment_id: number,
) {
	return supabase
		.from('assessments')
		.select('id, questions, title, teacher_id')
		.eq('id', assessment_id)
		.maybeSingle()
}

export async function updateGidouille(
	supabase: SupabaseClient<Database>,
	student_id: number,
	gidouilles: number,
) {
	return supabase.from('users').update({ gidouilles }).eq('id', student_id)
}

export async function updateVip(
	supabase: SupabaseClient<Database>,
	student_id: number,
	vips: Record<string, number>,
) {
	return supabase
		.from('users')
		.update({ vips: JSON.stringify(vips) })
		.eq('id', student_id)
}

export async function addAssignments(
	supabase: SupabaseClient<Database>,
	assignments: Assignment[],
) {
	return db.from('assignments').insert(
		assignments.map(({ id, basket, ...infos }) => ({
			...infos,
			basket: JSON.stringify(basket),
		})),
	)
}

export async function fetchDayStudentsTeacherWarnings(
	supabase: SupabaseClient<Database>,
	teacher_id: number,
	date: string,
) {
	return supabase
		.from('warnings')
		.select('id, date, student_id, warnings, users(teacher_id)')
		.eq('users.teacher_id', teacher_id)
		.eq('date', date)
}

export async function fetchStudentWarnings(
	supabase: SupabaseClient<Database>,
	student_id: number,
) {
	return supabase
		.from('warnings')
		.select('id, date, student_id, warnings')
		.eq('student_id', student_id)
		.order('date', { ascending: false })
}

export async function fetchStudentWarningsFromDateToDate(
	supabase: SupabaseClient<Database>,
	student_id: number,
	begining: string,
	end: string,
) {
	return supabase
		.from('warnings')
		.select('id, date, student_id, warnings')
		.eq('student_id', student_id)
		.lte('date', end)
		.gte('date', begining)
}

/**
 * Navadra
 */

export async function fetchPlayer(
	supabase: SupabaseClient<Database>,
	user_id: number,
) {
	return supabase
		.from('navadra_players')
		.select(
			'id,sex,pseudo,avatar,level,xp,fire_pyrs,wind_pyrs,water_pyrs,earth_pyrs,spent_fire_pyrs,spent_wind_pyrs,spent_water_pyrs,spent_earth_pyrs,prestige,tutor, position, monsters_ids, tuto',
		)
		.eq('user_id', user_id)
		.maybeSingle()
}

export async function insertPlayer(
	supabase: SupabaseClient<Database>,
	{ id, ...rest }: Database['public']['Tables']['navadra_players']['Insert'],
) {
	return supabase.from('navadra_players').insert(rest).select().single()
}

export async function updatePlayer(
	supabase: SupabaseClient<Database>,
	row: Database['public']['Tables']['navadra_players']['Update'],
) {
	return supabase.from('navadra_players').update(row).eq('id', row.id)
}

export async function fetchMonster(
	supabase: SupabaseClient<Database>,
	monster_id: number,
) {
	return supabase
		.from('navadra_monsters')
		.select('id, name, element, level, category, position, dead, nb_hunters')
		.eq('id', monster_id)
		.maybeSingle()
}

export async function insertMonster(
	supabase: SupabaseClient<Database>,
	{ id, ...rest }: Database['public']['Tables']['navadra_monsters']['Insert'],
) {
	return supabase.from('navadra_monsters').insert(rest).select().single()
}

export async function updateMonster(
	supabase: SupabaseClient<Database>,
	row: Database['public']['Tables']['navadra_monsters']['Update'],
) {
	return supabase.from('navadra_monsters').update(row).eq('id', row.id)
}

export async function insertPost(
	supabase: SupabaseClient<Database>,
	row: Database['public']['Tables']['posts']['Insert'],
) {
	return supabase.from('posts').insert(row).select().single()
}

export async function updatePost(
	supabase: SupabaseClient<Database>,
	row: Database['public']['Tables']['posts']['Update'],
) {
	return supabase.from('posts').update(row).eq('id', row.id)
}

export async function fetchPost(
	supabase: SupabaseClient<Database>,
	post_id: number,
) {
	return supabase
		.from('posts')
		.select('id, title, content, tags, summary, metadescription')
		.eq('id', post_id)
		.maybeSingle()
}

export async function fetchPosts(supabase: SupabaseClient<Database>) {
	return supabase
		.from('posts')
		.select('id, title, content, tags, summary, metadescription')
}

export async function fetchPostsByTags(
	supabase: SupabaseClient<Database>,
	tags: string[],
) {
	const filter = tags.map((tag) => `tags.cs.{"${tag}"}`).join(',')
	let promise = supabase
		.from('posts')
		.select('id, title, content, tags, summary, metadescription')
		.or(filter)
	return promise
}

export async function fetchTags(supabase: SupabaseClient<Database>) {
	return supabase.from('tags').select('id, name')
}
