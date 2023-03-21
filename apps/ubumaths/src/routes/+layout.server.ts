import {
	fetchSchools,
	fetchStudentPendingAssignments,
	fetchTeacherStudents,
	fetchUserByEmail,
	fetchUserClasses,
	updateUserInfo,
} from '$lib/db'
import type {
	Assignment,
	Classe,
	ExtraInfo,
	School,
	Student,
	StudentInfo,
	UserDB,
} from '$lib/type'
import { createUser, guest } from '$lib/users'
import { isEmptyObject } from '$lib/utils'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({
	locals: { getSession, supabase, adminAuth },
}) => {
	const session = await getSession()
	const errors: string[] = []
	const FETCH_USER_ERROR =
		'Erreur lors de la récupération des données utilisateur.'
	const FETCH_CLASSES_ERROR = 'Erreur lors de la récupération des classes.'
	const FETCH_ASSIGNMENTS_ERROR = 'Erreur lors de la récupération des devoirs.'
	const FETCH_SCHOOLS_ERROR = 'Erreur lors de la récupération des écoles.'
	const FETCH_STUDENTS_ERROR = 'Erreur lors de la récupération des élèves.'
	const NOT_CREATED_ERROR =
		"Le compte n'existe pas. Il faut demander à M. Le Jolly de le créer."
	const USER_UPDATE_FAILED =
		"Les données utilisateurs n'ont pu être mises à jour."

	function addErrors(error: string) {
		if (!errors.includes(error)) errors.push(error)
	}

	let userProfile: UserDB & {
		classes?: Classe[]
		assignments?: Assignment[]
		students?: (UserDB & StudentInfo)[]
		schools?: School[]
	} = {
		role: 'guest',
		firstname: 'guest',
		lastname: 'guest',
		email: '',
		id: 0,
	}
	let classes: Classe[] = []
	let students: (UserDB & StudentInfo)[] = []
	let schools: School[] = []
	let assignments: Assignment[] = []

	if (session) {
		// get user data from supabase
		// email is set in user session
		const { data: userData, error: userError } = await fetchUserByEmail(
			supabase,
			session.user.email!,
		)

		if (userError) {
			console.log(userError.message)
			addErrors(FETCH_USER_ERROR)
			supabase.auth.signOut()
		} else if (!userData) {
			console.log('User not created')
			addErrors(NOT_CREATED_ERROR)
			supabase.auth.signOut()
			adminAuth.deleteUser(session.user.id)
		} else {
			// update user data in supabase
			const extraInfo: ExtraInfo = {}
			if (!userData.auth_id) extraInfo.auth_id = session.user.id
			console.log('extra info', extraInfo, 'data', userData, 'session', session)
			if (!isEmptyObject(extraInfo)) {
				console.log('updating user info', extraInfo)
				const { error: updateError } = await updateUserInfo(
					supabase,
					userData.id,
					extraInfo,
				)
				if (updateError) {
					console.log(USER_UPDATE_FAILED, updateError.message)
					addErrors(USER_UPDATE_FAILED)
				}
			}

			// fetch user classes
			if (userData.role === 'teacher' || userData.role === 'student') {
				const { data: dataUserClasses, error: userClassesError } =
					await fetchUserClasses(supabase, userData.id)

				if (userClassesError || !dataUserClasses) {
					console.log(
						userClassesError?.message || 'no data returned for user classes',
					)
					addErrors(FETCH_CLASSES_ERROR)
				} else {
					classes = dataUserClasses
				}
			}

			// fetch students
			if (userData.role === 'teacher') {
				const { data: studentsData, error: studentsError } =
					await fetchTeacherStudents(supabase, userData.id)
				if (studentsError || !studentsData) {
					console.log(studentsError?.message || 'no data returned for students')
					addErrors(FETCH_CLASSES_ERROR)
				} else {
					students = studentsData.map((student) => ({
						...student,
						vips: JSON.parse(student.vips as string),
					}))
				}
			}

			// fetch schools
			if (userData.role === 'admin') {
				const { data: schoolsData, error: schoolsError } = await fetchSchools(
					supabase,
				)
				if (schoolsError) {
					console.log(FETCH_SCHOOLS_ERROR, schoolsError.message)
					addErrors(FETCH_SCHOOLS_ERROR)
				} else if (!schoolsData) {
					console.log(FETCH_SCHOOLS_ERROR)
					addErrors(FETCH_SCHOOLS_ERROR)
				} else {
					schools = schoolsData
				}
			}

			// fetch pending assignments
			if (userData.role === 'student') {
				const { data: assignmentsData, error: assignmentsError } =
					await fetchStudentPendingAssignments(supabase, userData.id)
				if (assignmentsError) {
					console.log(FETCH_ASSIGNMENTS_ERROR, assignmentsError.message)
					addErrors(FETCH_ASSIGNMENTS_ERROR)
				} else if (!assignmentsData) {
					console.log(FETCH_ASSIGNMENTS_ERROR)
					addErrors(FETCH_ASSIGNMENTS_ERROR)
				} else {
					assignments = assignmentsData.map((assignment) => ({
						...assignment,
						questions: JSON.parse(assignment.questions as string),
						basket: JSON.parse(assignment.basket as string),
					}))
				}
			}
			userProfile = { ...userData }
			if (classes.length) userProfile.classes = classes
			if (students.length) userProfile.students = students
			if (schools.length) userProfile.schools = schools
			if (assignments.length) userProfile.assignments = assignments
		}
	}
	console.log('userProfile', userProfile)
	return {
		session: getSession(),
		userProfile,
		errors,
	}
}
