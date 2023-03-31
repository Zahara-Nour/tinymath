import { getLogger } from '$lib/utils'

const { info, fail, warn } = getLogger('db', 'info')
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../types/supabase'
import type { UserBasicProfile, UserProfile } from './type'
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
	return supabase.from('users').insert([profile])
}

export function updateUserProfile(
	supabase: SupabaseClient<Database>,
	{ id, ...infos }: UserProfile,
) {
	return supabase.from('users').update(infos).eq('id', id)
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
		.select('name, id, grade, school_id')
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
		.select('id, name, grade, school_id')
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
