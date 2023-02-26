import { createClient } from '@supabase/auth-helpers-sveltekit'
import {
	PUBLIC_SUPABASE_URL,
	PUBLIC_SUPABASE_ANON_KEY,
} from '$env/static/public'
import type { addUserArg, ExtraInfo } from './type'

console.log('key', PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL)
const supabaseClient = createClient(
	PUBLIC_SUPABASE_URL,
	PUBLIC_SUPABASE_ANON_KEY,
)

export { supabaseClient }

export function addUser(profile: addUserArg) {
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

export function addUsers(list: addUserArg[]) {
	supabaseClient.from('users').insert(list)
}
