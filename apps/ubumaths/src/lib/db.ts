import { getLogger } from '$lib/utils'

const { info, fail, warn } = getLogger('db', 'info')
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'
import {
	isStudentProfile,
	type Assignment,
	type UserProfile,
	type StudentProfile,
	type InsertUserData,
	type CardWallet,
} from '../types/type'
import { createClient } from '@supabase/supabase-js'
import {
	PUBLIC_SUPABASE_URL,
	PUBLIC_SUPABASE_ANON_KEY,
} from '$env/static/public'

const db = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY)
export default db

export function DB_insertUser(
	supabase: SupabaseClient<Database>,
	profile: UserProfile,
) {
	const row = isStudentProfile(profile)
		? {
				...profile,
				vips: JSON.stringify(convertArrayWalletToObjectWallet(profile.vips)),
		  }
		: profile
	return supabase.from('users').insert(row)
}

// general update with user profile
export function DB_updateUser(
	supabase: SupabaseClient<Database>,
	profile: UserProfile,
) {
	const row = isStudentProfile(profile)
		? {
				...profile,
				vips: JSON.stringify(convertArrayWalletToObjectWallet(profile.vips)),
		  }
		: profile
	return supabase.from('users').update(row).eq('id', profile.id)
}

export async function DB_updateStudentGidouille(
	supabase: SupabaseClient<Database>,
	student_id: number,
	gidouilles: number,
) {
	return supabase.from('users').update({ gidouilles }).eq('id', student_id)
}

export async function DB_updateStudentVipWallet(
	supabase: SupabaseClient<Database>,
	student_id: number,
	vips: CardWallet,
) {
	const row: InsertUserData = {
		vips: JSON.stringify(convertArrayWalletToObjectWallet(vips)),
		gidouilles: 13,
	}
	console.log('row', row, supabase)
	console.log('student_id', student_id)
	// return supabase.from('users').update(row).eq('id', 156)
	return supabase.from('users').update(row).eq('id', student_id)
}

export function DB_fetchUser(
	supabase: SupabaseClient<Database>,
	user_id: string,
) {
	return supabase
		.from('users')
		.select(
			'id, firstname, lastname, role, email, school_id, teacher_id, grade, auth_id, classe_ids, gidouilles, vips',
		)
		.eq('id', user_id)
		.maybeSingle()
}

export function DB_fetchUserByEmail(
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
export async function DB_fetchUserClasses(
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

export async function DB_fetchStudentPendingAssignments(
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

export async function DB_fetchTeacherStudents(
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

export async function DB_fetchDayTeacherStudents(
	supabase: SupabaseClient<Database>,
	teacher_id: number,
	day: number,
) {
	const request = await DB_fetchUserClasses(supabase, teacher_id)
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

export async function DB_fetchClasseStudents(
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

export async function DB_fetchSchoolClasses(
	supabase: SupabaseClient<Database>,
	school_id: number,
) {
	return supabase
		.from('classes')
		.select('id, name, grade, school_id, schedule')
		.eq('school_id', school_id)
}

export function DB_insertClass(
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

export async function DB_fetchSchools(supabase: SupabaseClient<Database>) {
	return supabase.from('schools').select('id, city, country, name')
}

export async function DB_fetchSchoolTeachers(
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

export async function DB_fetchTeacherAssessments(
	supabase: SupabaseClient<Database>,
	teacher_id: number,
) {
	return supabase
		.from('assessments')
		.select('id, title, questions, teacher_id')
		.eq('teacher_id', teacher_id)
}

export async function DB_fetchAssessment(
	supabase: SupabaseClient<Database>,
	assessment_id: number,
) {
	return supabase
		.from('assessments')
		.select('id, questions, title, teacher_id')
		.eq('id', assessment_id)
		.maybeSingle()
}

export async function DB_insertAssignments(
	supabase: SupabaseClient<Database>,
	assignments: Assignment[],
) {
	return supabase.from('assignments').insert(
		assignments.map(({ id, basket, ...infos }) => ({
			...infos,
			basket: JSON.stringify(basket),
		})),
	)
}

export async function DB_fetchDayStudentsTeacherWarnings(
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

export async function DB_fetchStudentWarnings(
	supabase: SupabaseClient<Database>,
	student_id: number,
) {
	return supabase
		.from('warnings')
		.select('id, date, student_id, warnings')
		.eq('student_id', student_id)
		.order('date', { ascending: false })
}

export async function DB_fetchStudentWarningsFromDateToDate(
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

export async function DB_fetchPlayer(
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

export async function DB_insertPlayer(
	supabase: SupabaseClient<Database>,
	{ id, ...rest }: Database['public']['Tables']['navadra_players']['Insert'],
) {
	return supabase.from('navadra_players').insert(rest).select().single()
}

export async function DB_updatePlayer(
	supabase: SupabaseClient<Database>,
	row: Database['public']['Tables']['navadra_players']['Update'],
) {
	return supabase.from('navadra_players').update(row).eq('id', row.id)
}

export async function DB_fetchMonster(
	supabase: SupabaseClient<Database>,
	monster_id: number,
) {
	return supabase
		.from('navadra_monsters')
		.select('id, name, element, level, category, position, dead, nb_hunters')
		.eq('id', monster_id)
		.maybeSingle()
}

export async function DB_insertMonster(
	supabase: SupabaseClient<Database>,
	{ id, ...rest }: Database['public']['Tables']['navadra_monsters']['Insert'],
) {
	return supabase.from('navadra_monsters').insert(rest).select().single()
}

export async function DB_updateMonster(
	supabase: SupabaseClient<Database>,
	row: Database['public']['Tables']['navadra_monsters']['Update'],
) {
	return supabase.from('navadra_monsters').update(row).eq('id', row.id)
}

export async function DB_insertPost(
	supabase: SupabaseClient<Database>,
	row: Database['public']['Tables']['posts']['Insert'],
) {
	return supabase.from('posts').insert(row).select().single()
}

export async function DB_updatePost(
	supabase: SupabaseClient<Database>,
	row: Database['public']['Tables']['posts']['Update'],
) {
	return supabase.from('posts').update(row).eq('id', row.id)
}

export async function DB_fetchPost(
	supabase: SupabaseClient<Database>,
	post_id: number,
) {
	return supabase
		.from('posts')
		.select(
			'id, title, content, tags, summary, metadescription, updated_at, published_at',
		)
		.eq('id', post_id)
		.maybeSingle()
}

export async function DB_fetchPosts(supabase: SupabaseClient<Database>) {
	return supabase
		.from('posts')
		.select(
			'id, title, content, tags, summary, metadescription, updated_at, published_at',
		)
}

export async function DB_fetchPostsByTags(
	supabase: SupabaseClient<Database>,
	tags: string[],
) {
	const filter = tags.map((tag) => `tags.cs.{"${tag}"}`).join(',')
	let promise = supabase
		.from('posts')
		.select(
			'id, title, content, tags, summary, metadescription, updated_at, published_at',
		)
		.or(filter)
	return promise
}

export async function DB_fetchTags(supabase: SupabaseClient<Database>) {
	return supabase.from('tags').select('id, name')
}

function convertArrayWalletToObjectWallet(wallet: CardWallet) {
	return wallet.reduce((wallet, { card, count }) => {
		wallet[card.name] = count
		return wallet
	}, {} as Record<string, number>)
}
