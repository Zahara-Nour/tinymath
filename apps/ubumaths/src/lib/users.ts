import type { User, UserProfile } from './type'

export function createUser(profile: UserProfile): User {
	return {
		...profile,
		isStudent: () => profile.role === 'student',
		isTeacher: () => profile.role === 'teacher',
		isAdmin: () => profile.role === 'admin',
		isGuest: () => false,
	}
}
