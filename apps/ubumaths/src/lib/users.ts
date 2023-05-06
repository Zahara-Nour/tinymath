import {
	isStudentData,
	isStudentProfile,
	isTeacherData,
	type StudentProfile,
	type User,
	type UserData,
	type UserProfile,
} from '../types/type'

import cardPool from './vips/cards'

const userPrototype = {
	isStudent(this: User) {
		return this.role === 'student'
	},
	isTeacher(this: User) {
		return this.role === 'teacher'
	},
	isAdmin(this: User) {
		return this.role === 'admin'
	},
	isGuest(this: User) {
		return !(this.isStudent() || this.isAdmin() || this.isTeacher())
	},
}

export const guestProfile: UserProfile = {
	id: 0,
	email: '',
	role: 'guest',
	firstname: 'guest',
	lastname: 'guest',
	auth_id: null,
}
export const guest = createUser(guestProfile)
export function createUser(profile: UserProfile): User {
	return Object.assign(Object.create(userPrototype), profile)
}

export function cleanProfile(dirtyProfile: UserData) {
	// I want to get rid off the empty properties
	// can't find a good way to do it
	const profile: UserProfile = { ...guestProfile }
	profile.id = dirtyProfile.id
	profile.firstname = dirtyProfile.firstname
	profile.lastname = dirtyProfile.lastname
	profile.email = dirtyProfile.email
	profile.role = dirtyProfile.role as 'admin' | 'teacher' | 'student'
	profile.auth_id = dirtyProfile.auth_id
	if (isStudentData(dirtyProfile)) {
		const studentProfile = profile as StudentProfile
		studentProfile.grade = dirtyProfile.grade!
		studentProfile.school_id = dirtyProfile.school_id!
		studentProfile.classe_ids = dirtyProfile.classe_ids!
		studentProfile.gidouilles = dirtyProfile.gidouilles!
		studentProfile.vips = []
		const vips = JSON.parse(dirtyProfile.vips as string) as Record<
			string,
			number
		>
		Object.entries(vips).forEach(([name, count]) => {
			studentProfile.vips.push({
				card: cardPool.find((card) => card.name === name)!,
				count,
			})
		})
		return studentProfile
	} else if (isTeacherData(dirtyProfile)) {
		profile.school_id = dirtyProfile.school_id!
		profile.classe_ids = dirtyProfile.classe_ids!
	}

	return profile
}
