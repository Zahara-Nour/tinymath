import type { V } from 'vitest/dist/types-71ccd11d.js'
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
} from './grades.js'
import type {
	STATUS_BAD_FORM,
	STATUS_BAD_UNIT,
	STATUS_CORRECT,
	STATUS_EMPTY,
	STATUS_INCORRECT,
	STATUS_UNOPTIMAL_FORM,
} from './questions/correction.js'
import {
	QUESTION_TYPE_CHOICE,
	QUESTION_TYPE_CHOICES,
	QUESTION_TYPE_RESULT,
	type QUESTION_TYPE_ENONCE,
	type QUESTION_TYPE_EQUATION,
	type QUESTION_TYPE_FILL_IN,
} from './questions/questions.js'
import { isInteger, isNumeric } from './utils.js'

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

export type QuestionType =
	| typeof QUESTION_TYPE_FILL_IN
	| typeof QUESTION_TYPE_EQUATION
	| typeof QUESTION_TYPE_ENONCE
	| typeof QUESTION_TYPE_CHOICE
	| typeof QUESTION_TYPE_CHOICES
	| typeof QUESTION_TYPE_RESULT

type Subdomain = Question[]
type Domain = Record<string, Subdomain>
type Theme = Record<string, Domain>
export type Questions = Record<string, Theme>
export type AvailableLevels = Record<
	string,
	Record<string, Record<string, number[]>>
>
export type Question = {
	'result-type'?: 'decimal'
	answerFields?: string[]
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
	subdescription?: string
	testAnswerss?: string[][]
	type?: QuestionType
	units?: string[]
	variabless?: { [index: VariableName]: string }[]
}

export type QuestionResult = Question & {
	expression: string
}

export function isQuestionResult(q: Question): q is QuestionResult {
	return q.type === QUESTION_TYPE_RESULT
}

export type QuestionChoice = Question & {
	choices: Choice[]
	solutions: number[]
}

export function isQuestionChoice(q: Question): q is QuestionChoice {
	return q.type === QUESTION_TYPE_CHOICE
}

export type QuestionChoices = Question & {
	choices: Choice[]
	solutions: number[]
}

export function isQuestionChoices(q: Question): q is QuestionChoices {
	return q.type === QUESTION_TYPE_CHOICES
}

export type QuestionWithID = Question & {
	id: string
}

export type GeneratedQuestion = QuestionWithID & {
	answerField?: string
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
	testAnswers?: string[]
	unit?: string
}

export type AnsweredQuestion = GeneratedQuestion & {
	answers: (string | number)[] // pas de réponse en mode projection
	answers_latex: string[] // pas de réponse en mode projection
	options: Option[]
	time?: number
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

export type ExtraInfo = {
	firstname?: string
	lastname?: string
	fullname?: string
	user_id?: string | null // supabase user id
}
export type UserProfile = ExtraInfo & {
	id: number // users table primary key
	email: string
	role: string
	grade: string
	classes: string[]
	avatar?: string
}

export type User = UserProfile & {
	isStudent: () => boolean
	isTeacher: () => boolean
	isAdmin: () => boolean
	isGuest: () => boolean
}

export type addUserArg = {
	email: string
	role: string
	classes: string[]
	grade: string
}
