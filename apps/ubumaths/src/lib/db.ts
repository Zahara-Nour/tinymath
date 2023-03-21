import { getLogger } from '$lib/utils'

import type { UserInfo, ExtraInfo } from './type'

const { info, fail, warn } = getLogger('Automaths', 'info')
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../types/supabase'

export function addUser(supabase: SupabaseClient<Database>, profile: UserInfo) {
	return supabase.from('users').insert([profile])
}

export function updateUserInfo(
	supabase: SupabaseClient<Database>,
	id: number,
	infos: ExtraInfo,
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

	if (!classeIdsData || classesIdsError) {
		return { data: null, error: classesIdsError }
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
			'role, grade, email, firstname, lastname, id, classe_ids, school_id, teacher_id, gidouilles, vips',
		)
		.eq('role', 'student')
		.eq('teacher_id', teacher_id)
}

export async function classeStudents(
	supabase: SupabaseClient<Database>,
	classe_id: number,
) {
	return supabase
		.from('users')
		.select(
			'role, grade, email, firstname, lastname, id, classe_ids, school_id, teacher_id, gidouilles, vips',
		)
		.eq('role', 'student')
		.contains('classes', [classe_id])
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
export async function fetchSchools(supabase: SupabaseClient<Database>) {
	return supabase.from('schools').select('id, city, country, name')
}
