import { createClient } from '@supabase/auth-helpers-sveltekit'
import {
	PUBLIC_SUPABASE_URL,
	PUBLIC_SUPABASE_ANON_KEY,
} from '$env/static/public'
import { getLogger } from '$lib/utils'

import type { UserInfo, ExtraInfo } from './type'

const { info, fail, warn } = getLogger('Automaths', 'info')
const supabaseClient = createClient(
	PUBLIC_SUPABASE_URL,
	PUBLIC_SUPABASE_ANON_KEY,
)

export { supabaseClient }

export function addUser(profile: UserInfo) {
	return supabaseClient.from('users').insert([profile])
}

export function updateUserInfo(id: number, infos: ExtraInfo) {
	return supabaseClient.from('users').update(infos).eq('id', id)
}

export function getUser(id: string) {
	return supabaseClient.from('users').select('*').eq('id', id).maybeSingle()
}

export function getUserByEmail(email: string) {
	return supabaseClient
		.from('users')
		.select('*')
		.eq('email', email)
		.maybeSingle()
}

export function addUsers(list: UserInfo[]) {
	supabaseClient.from('users').insert(list)
}

export async function fetchUserClassIdsNames(id: number) {
	const result = await supabaseClient
		.from('users')
		.select('classes')
		.eq('id', id)
		.maybeSingle()

	const classeIds = result.data?.classes || []
	const { data, error } = await supabaseClient
		.from('classes')
		.select('class, id')
		.in('id', classeIds)
	if (data) {
		return {
			data: data.map((c) => ({ className: c.class, id: c.id })),
			error: null,
		}
	} else {
		return { data: null, error }
	}
}

export async function fetchClassStudentsIdsNames(classId: number) {
	return supabaseClient
		.from('users')
		.select('id, fullname, firstname, lastname')
		.eq('role', 'student')
		.contains('classes', [classId])
}
