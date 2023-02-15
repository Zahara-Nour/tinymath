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
	base64?: string // pourquoi les 2
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

export type Question = {
	id?: string
	description: string
	subdescription?: string
	enounces: string[]
	enounces2?: string[]
	variabless?: { [index: VariableName]: string }[]
	solutionss?: (string | number)[][]
	options?: Option[]
	correctionFormats?: CorrectionFormat[]
	defaultDelay: number
	grade: Grade
	expressions?: string[]
	expressions2?: string[]
	choicess?: Choice[][]
	correctionDetailss?: CorrectionDetail[][]
	images?: string[]
	imagesCorrection?: string[]
	conditions?: string[]
	type?: QuestionType
	units?: string[]
	'result-type'?: 'decimal'
	answerFields?: string[]
	testAnswerss?: string[][]
	letterss?: Letters[]
	help?: string
	formats?: string[]
	order_elements?: string[]
	num?: number
	limits?: {
		limits: { count?: number; limit?: number }[]
		nbuniques?: number
		nbrandoms?: number
		nbmax?: number
		reached?: number
	}
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

export type GeneratedQuestion = Question & {
	generatedVariables: Variables
	choices?: Choice[]
	solutions?: (string | number)[]
	i: number
	enounce: string
	enounce2?: string
	expression?: string
	answerField?: string
	image?: string
	imageBase64P?: Promise<string>
	unit?: string
	expression_latex?: string
	expression2_latex?: string
	correctionFormat?: CorrectionFormat
	correctionDetails?: CorrectionDetail[]
	expression2?: string
	testAnswers?: string[]
	imageCorrection?: string
	imageCorrectionBase64P?: Promise<string>
	points: number
	order_elements: string[]
}

export type AnsweredQuestion = GeneratedQuestion & {
	answers: (string | number)[] // pas de réponse en mode projection
	options: Option[]
}

export type CorrectionStatus =
	| typeof STATUS_BAD_FORM
	| typeof STATUS_BAD_UNIT
	| typeof STATUS_CORRECT
	| typeof STATUS_EMPTY
	| typeof STATUS_INCORRECT
	| typeof STATUS_UNOPTIMAL_FORM

export type CorrectedQuestion = AnsweredQuestion & {
	statuss: CorrectionStatus[]
	status: CorrectionStatus
	coms: string[]
	unoptimals: string[]
	answers: (string | number)[]
	answers_latex: string[]
	testAnswers: string[]
	solutions: (string | number)[]
	solutionsUsed: number[]
	solutionsIndexs: Record<number, number>
	choices: Choice[]
	correctionDetails: CorrectionDetail[]
	simpleCorrection: Line[]
	detailedCorrection: Line[]
}

export type ObjectWithText = { text: string }
export type FormatToLatexArg = null | object | string | Array<object | string>
export type FormatToTexmacsArg = null | object | string | Array<object | string>
export type FormatToHtmlArg = null | object | string | Array<object | string>

export type LineChoice = Choice & {
	solution?: boolean
	badge?: 'correct' | 'incorrect'
	text?: string
	image?: string
	html?: string
}
export type Line =
	| string
	| {
			html?: string
			texmacs?: string
			choices?: LineChoice[]
	  }
