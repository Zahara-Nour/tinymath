import type { User, UserInfo } from './type'

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

export const guest = createUser({
	email: '',
	role: 'guest',
	firstname: 'guest',
	lastname: 'guest',
})
export function createUser(profile: UserInfo): User {
	return Object.assign(Object.create(userPrototype), profile)
}
