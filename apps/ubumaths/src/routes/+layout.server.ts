import {
	DB_fetchPlayer,
	DB_fetchSchools,
	DB_fetchStudentPendingAssignments,
	DB_fetchTeacherStudents,
	DB_fetchUserByEmail,
	DB_fetchUserClasses,
	DB_updateUser,
} from '$lib/db'
import {
	isAdminProfile,
	isStudentProfile,
	isTeacherProfile,
	type Assignment,
	type Basket,
	type StudentProfile,
	type TeacherProfile,
	type UserProfile,
} from '../types/type'
import { cleanProfile, createUser, guest, guestProfile } from '$lib/users'
import type { LayoutServerLoad } from './$types'
import { playersManager } from './navadra/js/player'
import type { Player } from '../types/navadra_types'

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
	const FETCH_PLAYER_ERROR =
		'Erreur lors de la récupération des joueur navadra.'
	const NOT_CREATED_ERROR =
		"Le compte n'existe pas. Il faut demander à M. Le Jolly de le créer."
	const USER_UPDATE_FAILED =
		"Les données utilisateurs n'ont pu être mises à jour."

	function addErrors(error: string) {
		if (!errors.includes(error)) errors.push(error)
	}

	let profile: UserProfile = guestProfile
	let player: Player | null = null
	let assignments: Assignment[] = []

	if (session) {
		// get user data from supabase
		// email is set in user session
		const { data: userData, error: userError } = await DB_fetchUserByEmail(
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
			// supabase.auth.signOut()
			// adminAuth.deleteUser(session.user.id)
		} else {
			profile = cleanProfile(userData)
			if (!userData.auth_id) {
				profile.auth_id = session.user.id
				// update supabase id
				const { error: updateError } = await DB_updateUser(supabase, profile)
				if (updateError) {
					console.log(USER_UPDATE_FAILED, updateError.message)
					addErrors(USER_UPDATE_FAILED)
				}
			}

			// fetch user classes
			if (isTeacherProfile(profile) || isStudentProfile(profile)) {
				const { data: userClassesData, error: userClassesError } =
					await DB_fetchUserClasses(supabase, profile.id)

				if (userClassesError || !userClassesData) {
					console.log(
						userClassesError?.message || 'no data returned for user classes',
					)
					addErrors(FETCH_CLASSES_ERROR)
				} else {
					profile.classes = userClassesData
				}
			}

			// fetch teacher students
			if (isTeacherProfile(profile)) {
				const classes = profile.classes
				profile.students = {}

				const { data: studentsData, error: studentsError } =
					await DB_fetchTeacherStudents(supabase, profile.id)
				if (studentsError || !studentsData) {
					console.log(studentsError?.message || 'no data returned for students')
					addErrors(FETCH_CLASSES_ERROR)
				} else {
					classes.forEach((classe) => {
						;(profile as TeacherProfile).students[classe.id] = studentsData
							.map((profile) => cleanProfile(profile) as StudentProfile)
							.filter((student) => student.classe_ids.includes(classe.id))
							.map((student) => ({
								...student,
								classes: [],
								assignments: [],
							}))
					})
				}
			}

			// fetch schools
			if (isAdminProfile(profile)) {
				const { data: schoolsData, error: schoolsError } =
					await DB_fetchSchools(supabase)
				if (schoolsError) {
					console.log(FETCH_SCHOOLS_ERROR, schoolsError.message)
					addErrors(FETCH_SCHOOLS_ERROR)
				} else if (!schoolsData) {
					console.log(FETCH_SCHOOLS_ERROR)
					addErrors(FETCH_SCHOOLS_ERROR)
				} else {
					profile.schools = schoolsData
				}
			}

			// fetch pending assignments
			if (isStudentProfile(profile)) {
				const { data: assignmentsData, error: assignmentsError } =
					await DB_fetchStudentPendingAssignments(supabase, profile.id)
				if (assignmentsError) {
					console.log(FETCH_ASSIGNMENTS_ERROR, assignmentsError.message)
					addErrors(FETCH_ASSIGNMENTS_ERROR)
				} else if (!assignmentsData) {
					console.log(FETCH_ASSIGNMENTS_ERROR)
					addErrors(FETCH_ASSIGNMENTS_ERROR)
				} else {
					assignments = assignmentsData.map((assignment) => ({
						...assignment,
						questions: null,
						basket: JSON.parse(assignment.basket as string) as Basket,
					}))
					profile.assignments = assignments
				}
			}

			// fetch pending assignments
			if (isStudentProfile(profile)) {
				const { data: assignmentsData, error: assignmentsError } =
					await DB_fetchStudentPendingAssignments(supabase, profile.id)
				if (assignmentsError) {
					console.log(FETCH_ASSIGNMENTS_ERROR, assignmentsError.message)
					addErrors(FETCH_ASSIGNMENTS_ERROR)
				} else if (!assignmentsData) {
					console.log(FETCH_ASSIGNMENTS_ERROR)
					addErrors(FETCH_ASSIGNMENTS_ERROR)
				} else {
					assignments = assignmentsData.map((assignment) => ({
						...assignment,
						questions: null,
						basket: JSON.parse(assignment.basket as string) as Basket,
					}))
					profile.assignments = assignments
				}
			}

			// fetch navadra Player
			if (isStudentProfile(profile)) {
				player = await playersManager.loadDB(profile.id)
			}
		}
	}
	return {
		session: getSession(),
		userProfile: profile,
		playerProfile: player?.profile,
		monstersProfiles: player?.monsters.map((monster) => monster.profile),
		errors,
	}
}
