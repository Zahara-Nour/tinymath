import type { Database } from './supabase'
import type {
	CP,
	CM1,
	CM2,
	SIXIEME,
	SECONDE,
	CINQUIEME,
	QUATRIEME,
	CE1,
	CE2,
	TROISIEME,
	PREMIERE_SPE_MATHS,
	TERMINALE_SPE_MATHS,
} from '../lib/grades.js'
import type {
	STATUS_BAD_FORM,
	STATUS_BAD_UNIT,
	STATUS_CORRECT,
	STATUS_EMPTY,
	STATUS_INCORRECT,
	STATUS_UNOPTIMAL_FORM,
} from '../lib/questions/correction.js'
import { isInteger, isNumeric } from '../lib/utils.js'

export type Option =
	| 'enounce-no-spaces'
	| 'exp-no-spaces'
	| 'require-correct-spaces'
	| 'no-penalty-for-incorrect-spaces'
	| 'require-implicit-products'
	| 'no-penalty-for-explicit-products'
	| 'require-no-extraneaous-brackets'
	| 'no-penalty-for-extraneous-brackets'
	| 'no-penalty-for-extraneous-brackets-in-first-negative-term'
	| 'exp-allow-unecessary-zeros'
	| 'require-no-extraneaous-zeros'
	| 'no-penalty-for-extraneous-zeros'
	| 'require-no-extraneaous-signs'
	| 'no-penalty-for-extraneous-signs'
	| 'require-no-factor-one'
	| 'no-penalty-for-factor-one'
	| 'require-no-factor-zero'
	| 'no-penalty-for-factor-zero'
	| 'require-no-null-terms'
	| 'no-penalty-for-null-terms'
	| 'require-reduced-fractions'
	| 'no-penalty-for-non-reduced-fractions'
	| 'require-specific-unit'
	| 'no-penalty-for-not-respected-unit'
	| 'disallow-terms-permutation'
	| 'disallow-factors-permutation'
	| 'disallow-terms-and-factors-permutation'
	| 'penalty-for-terms-and-factors-permutation'
	| 'penalty-for-terms-permutation'
	| 'penalty-for-factors-permutation'
	| 'shuffle-terms'
	| 'shuffle-factors'
	| 'shuffle-terms-and-factors'
	| 'shallow-shuffle-terms'
	| 'shallow-shuffle-factors'
	| 'exp-remove-unecessary-brackets'
	| 'no-shuffle-choices'
	| 'allow-same-expression'
	| 'allow-same-enounce'
	| 'remove-null-terms'
	| 'exhaust'
	| 'solutions-order-not-important'
	| 'multiples'
	| 'one-single-form-solution'

export type VariableName = `&${number}`

export function isVariableName(e: string): e is VariableName {
	return !!e && e.startsWith('&') && isInteger(e.substring(1))
}

export type Variables = Record<VariableName, string>
export type CorrectionFormat = {
	correct: string[]
	uncorrect?: string[]
	answer?: string
}

type Grade =
	| typeof CP
	| typeof CM1
	| typeof CM2
	| typeof SIXIEME
	| typeof SECONDE
	| typeof CINQUIEME
	| typeof QUATRIEME
	| typeof CE1
	| typeof CE2
	| typeof TROISIEME
	| typeof PREMIERE_SPE_MATHS
	| typeof TERMINALE_SPE_MATHS

export type Choice = {
	text?: string
	image?: string
	imageBase64?: string
	imageBase64P?: Promise<string>
}

export type CorrectionDetail = {
	text: string
	type?: string
	base64?: string
}

export type Letters = Record<string, string>

type Subdomain = QuestionBase[]
type Domain = Record<string, Subdomain>
type Theme = Record<string, Domain>
export type Questions = Record<string, Theme>
export type AvailableLevels = Record<
	string,
	Record<string, Record<string, number[]>>
>
export type QuestionBase = {
	'result-type'?: 'decimal'
	answerFields?: string[]
	answerFormats?: string[]
	choicess?: Choice[][]
	conditions?: string[]
	correctionDetailss?: CorrectionDetail[][]
	correctionFormats?: CorrectionFormat[]
	defaultDelay: number
	description: string
	enounces: string[]
	enounces2?: string[]
	expressions?: string[]
	expressions2?: string[]
	formats?: string[]
	grade: Grade
	help?: string
	images?: string[]
	imagesCorrection?: string[]
	letterss?: Letters[]
	limits?: {
		limits: { count?: number; limit?: number }[]
		nbuniques?: number
		nbrandoms?: number
		nbmax?: number
		reached?: number
	}
	num?: number
	options?: Option[]
	order_elements?: string[]
	solutionss?: (string | number)[][]
	prefilleds?: string[][]
	subdescription?: string
	testAnswerss?: string[][]
	units?: string[]
	variabless?: { [index: VariableName]: string }[]
	multipleAnswers?: boolean
}

export type QuestionWithID = QuestionBase & {
	id: string
}

export type GeneratedQuestion = QuestionWithID & {
	answerField?: string
	answerFormat?: string
	answerFormat_latex?: string
	choices?: Choice[]
	correctionDetails?: CorrectionDetail[]
	correctionFormat?: CorrectionFormat
	delay: number
	enounce: string
	enounce2?: string
	expression_latex?: string
	expression?: string
	expression2_latex?: string
	expression2?: string
	generatedVariables: Variables
	i: number
	image?: string
	imageBase64P?: Promise<string>
	imageCorrection?: string
	imageCorrectionBase64P?: Promise<string>
	order_elements: string[]
	points: number
	solutions?: (string | number)[]
	prefilled?: string[]
	testAnswers?: string[]
	unit?: string
}

export type QuestionChoice = GeneratedQuestion & {
	choices: Choice[]
	solutions: number[]
}

export type QuestionChoices = QuestionChoice & {
	multipleAnswers: true
}

export type QuestionFillIn = GeneratedQuestion & {
	expression: string
	expression_latex: string
}

export type QuestionResultOrRewrite = GeneratedQuestion & {
	expression: string
	expression_latex: string
	answerFormat: string
	answerFormat_latex: string
}

export type QuestionAnswerField = GeneratedQuestion & {
	answerField: string
}

export function isQuestionChoice(q: Question): q is QuestionChoice {
	return !!q.choicess && !q.multipleAnswers
}

export function isQuestionChoices(q: Question): q is QuestionChoices {
	return !!q.choicess && !!q.multipleAnswers
}

export function isQuestionFillIn(q: Question): q is QuestionFillIn {
	return !!q.expression?.includes('?')
}

export function isQuestionAnswerField(q: Question): q is QuestionAnswerField {
	return !!q.answerField
}

export function isQuestionResultOrRewrite(
	q: Question,
): q is QuestionResultOrRewrite {
	return !(
		isQuestionChoice(q) ||
		isQuestionFillIn(q) ||
		isQuestionAnswerField(q) ||
		isQuestionChoices(q)
	)
}

export type Question =
	| QuestionChoice
	| QuestionChoices
	| QuestionFillIn
	| QuestionResultOrRewrite
	| QuestionAnswerField

export type AnsweredQuestionBase = Question & {
	answers_latex: string[] // pas de réponse en mode projection
	options: Option[]
	time?: number
	prefilled: string[]
}

export type AnsweredQuestionChoice = AnsweredQuestionBase & {
	answers: number[] // pas de réponse en mode projection
}

export type AnsweredQuestionOther = AnsweredQuestionBase & {
	answers: string[] // pas de réponse en mode projection
}

export type AnsweredQuestion = AnsweredQuestionChoice | AnsweredQuestionOther

export function isAnsweredQuestionChoice(
	q: AnsweredQuestion,
): q is AnsweredQuestionChoice {
	return isQuestionChoice(q) || isQuestionChoices(q)
}

export type CorrectionStatus =
	| typeof STATUS_BAD_FORM
	| typeof STATUS_BAD_UNIT
	| typeof STATUS_CORRECT
	| typeof STATUS_EMPTY
	| typeof STATUS_INCORRECT
	| typeof STATUS_UNOPTIMAL_FORM

export type CorrectedQuestion = AnsweredQuestion & {
	answers_latex: string[]
	answers: (string | number)[]
	choices: Choice[]
	coms: string[]
	correctionDetails: CorrectionDetail[]
	detailedCorrection: Line[]
	simpleCorrection: Line[]
	solutions: (string | number)[]
	solutionsIndexs: Record<number, number>
	solutionsUsed: number[]
	status: CorrectionStatus
	statuss: CorrectionStatus[]
	testAnswers: string[]
	unoptimals: string[]
}

export type ObjectWithText = { text: string }
export type FormatToLatexArg =
	| undefined
	| null
	| object
	| string
	| Array<object | string>
export type FormatToTexmacsArg = null | object | string | Array<object | string>
export type FormatToHtmlArg = null | object | string | Array<object | string>

export type LineChoice = Choice & {
	solution?: boolean
	badge?: 'correct' | 'incorrect'
	text?: string
	image?: string
	html?: string
}
export type Line = {
	text?: string
	latex?: string
	html?: string
	texmacs?: string
	choices?: LineChoice[]
}

export type Links = Array<{
	url: string
	tooltip: string
	text: string
}>

export type BasketItem = {
	count: number
	enounceAlone?: boolean
	delay: number
	id: string
}
export type Basket = Array<BasketItem>

export type Ids = Record<
	string,
	{
		theme: string
		domain: string
		subdomain: string
		level: number
	}
>

export type Timer = {
	status(): string
	start(): void
	pause(): void
	stop(): void
	resume(): void
	getTime(): {
		days: number
		hours: number
		minutes: number
		seconds: number
	}
	getSeconds(): number
	changeDelay(newDelay: number): void
}

export type Time = {
	days: number
	hours: number
	minutes: number
	seconds: number
}

export type Commit = {
	hook?: () => void
	exec: () => void
}

// creation d'un nouvel utilisateur

export type UserBasicProfile = {
	email: string
	role: string
	firstname: string
	lastname: string
	id: number
	auth_id: string | null
	classe_ids?: number[]
	school_id?: number
	teacher_id?: number
	grade?: string
	classes?: Classe[]
	avatar?: string
	gidouilles?: number
	students?: Record<number, StudentProfile[]>
}

export type GuestProfile = UserBasicProfile & {
	email: ''
	role: 'guest'
	firstname: 'guest'
	lastname: 'guest'
}

export type AdminProfile = UserBasicProfile & {
	schools: School[]
	role: 'admin'
}

export type StudentProfile = UserBasicProfile & {
	role: 'student'
	grade: string
	classe_ids: number[]
	classes: Classe[]
	school_id: number
	teacher_id: number
	gidouilles: number
	vips: CardWallet
	assignments: Assignment[]
}

export type TeacherProfile = UserBasicProfile & {
	role: 'teacher'
	classe_ids: number[]
	classes: Classe[]
	school_id: number
	student_ids: number[]
	students: Record<number, StudentProfile[]>
}

export type UserProto = {
	isStudent: () => boolean
	isTeacher: () => boolean
	isAdmin: () => boolean
	isGuest: () => boolean
}

export type UserProfile =
	| AdminProfile
	| StudentProfile
	| TeacherProfile
	| GuestProfile
export type Admin = AdminProfile & UserProto
export type Student = StudentProfile & UserProto
export type Teacher = TeacherProfile & UserProto
export type Guest = GuestProfile & UserProto
export type User = Admin | Student | Teacher | Guest

export function isAdminProfile(u: UserProfile): u is AdminProfile {
	return u.role === 'admin'
}

export function isTeacherProfile(u: UserProfile): u is TeacherProfile {
	return u.role === 'teacher'
}

export function isStudentProfile(u: UserProfile): u is StudentProfile {
	return u.role === 'student'
}

export function isGuestProfile(u: UserProfile): u is GuestProfile {
	return u.role === 'guest'
}

export function isAdmin(u: User): u is Admin {
	return u.role === 'admin'
}

export function isTeacher(u: User): u is Teacher {
	return u.role === 'teacher'
}

export function isStudent(u: User): u is Student {
	return u.role === 'student'
}

export function isGuest(u: User): u is Guest {
	return u.role === 'guest'
}

export type School = {
	id: number
	name: string
	city: string
	country: string
}

export type Classe = {
	id: number
	name: string
	school_id: number
	grade: string
	schedule: number[]
}

export type Assessment = {
	id: number
	title: string
	questions: Basket
	teacher_id: number
}

export type Assignment = {
	id: number
	teacher_id: number
	student_id: number
	questions?: CorrectedQuestion[] | null
	basket: Basket
	mark: number
	status: string
	total: number
	title: string
}

export type StudentData = Omit<
	Database['public']['Tables']['users']['Row'],
	'created_at' | 'updated_at' | 'teacher_uuid'
>

export type TeacherData = Omit<
	Database['public']['Tables']['users']['Row'],
	| 'created_at'
	| 'updated_at'
	| 'vips'
	| 'teacher_id'
	| 'gidouilles'
	| 'grade'
	| 'teacher_uuid'
>

export type AdminData = Omit<
	Database['public']['Tables']['users']['Row'],
	| 'created_at'
	| 'updated_at'
	| 'vips'
	| 'teacher_id'
	| 'gidouilles'
	| 'grade'
	| 'classe_ids'
	| 'school_id'
	| 'teacher_uuid'
>

export type UserData = StudentData | TeacherData | AdminData

export type InsertUserData = Database['public']['Tables']['users']['Insert']

export function isAdminData(data: UserData): data is AdminData {
	return data.role === 'admin'
}

export function isTeacherData(data: UserData): data is TeacherData {
	return data.role === 'teacher'
}

export function isStudentData(data: UserData): data is StudentData {
	return data.role === 'student'
}
export type VipCard = {
	name: string
	title: string
	text: string
	rarity: 'common' | 'uncommon' | 'rare' | 'legendary'
	effect?: {
		name: string
		param: number
	}
}

export type CardWallet = {
	card: VipCard
	count: number
}[]

export type Post = {
	id: number
	title: string
	summary: string
	content: string
	tags: string[]
	metadescription: string
	published_at: string
	updated_at: string
}

export type Tag = {
	id: number
	name: string
}
