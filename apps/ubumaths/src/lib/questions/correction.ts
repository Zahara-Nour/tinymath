import math from 'tinycas'
import { getLogger } from '$lib/utils'
import { createCorrection, createDetailedCorrection } from './correctionItem'
import type {
	AnsweredQuestion,
	CorrectedQuestion,
	GeneratedQuestion,
	Option,
} from '$lib/type'
import {
	QUESTION_TYPE_CHOICE,
	QUESTION_TYPE_CHOICES,
	QUESTION_TYPE_FILL_IN,
} from './questions'
import type { Bool } from 'tinycas/dist/math/types'
export const STATUS_EMPTY = 'empty'
export const STATUS_CORRECT = 'correct'
export const STATUS_INCORRECT = 'incorrect'
export const STATUS_UNOPTIMAL_FORM = 'unoptimal form'
export const STATUS_BAD_FORM = 'bad form'
export const STATUS_BAD_UNIT = 'bad unit'

let { fail, trace, info } = getLogger('correction', 'info')

// VALIDATION DES REPONSES
// 1) on regarde si il y a eu une réponse -> STATUS_EMPTY
// 2) on regarde si l'expression est valide mathématiquement -> STATUS_INCORRECT
// 3) on regarde si la réponse de l'utilisateur est équivalente à la solution -> STATUS_INCORRECT
// 4) on vérifie les contraintes (options require et no-penalty) :
//   espaces, zéros inutiles, produits implicites, parenthèses superflues,
//   signes superflus, termes nuls, facteurs nuls, facteurs égaux à 1,
//   fractions réduites, unités
//   -> STATUS_BAD_FORM ou STATUS_UNOPTIMAL_FORM
// 5) si la solution n'est pas explicitement calculable un test (testAnswer) de validation
//    peut être effectué -> STATUS_INCORRECT ou STATUS_CORRECT ou inchangé (peut deja etre STATUS_UNOPTIMAL_FORM ou STATUS_BAD_FORM)
// 6) Sinon après avoir mis en ordre les termes et facteurs, on compare strictement la réponse à la solution explicite -> STATUS_BAD_FORM ou STATUS_CORRECT
// TODO: Formats

const EMPTY_ANSWER = "Tu n'as rien répondu."
const EMPTY_MULTIPLE_ANSWERS = "Tu n'as pas tout complété."
const ZEROS =
	"<span style='color:_COLORANSWER_'>Ta réponse</span> contient un ou des zéros inutiles."
const ZEROS_MULTIPLE_ANSWERS =
	'Il y a un ou des zéros inutiles dans tes réponses :'
const FACTORE_ONE =
	"Dans <span style='color:_COLORANSWER_'>ta réponse</span>, tu peux simplifier le ou les facteurs 1."
const FACTORE_ONE_MULTIPLE_ANSWERS =
	'Il y a un ou des facteurs 1 inutiles dans tes réponses :'
const FACTORE_ZERO =
	"Tu peux simplifier <span style='color:_COLORANSWER_'>ta réponse</span> qui contient un ou des facteurs nuls."
const FACTORE_ZERO_MULTIPLE_ANSWERS =
	'Dans tes réponses, tu peux simplifier un ou des facteurs nuls.'

const NULL_TERMS =
	"<span style='color:_COLORANSWER_'>Ta réponse</span> contient un terme nul que tu peux enlever."
const NULL_TERMS_MULTIPLE_ANSWERS =
	'Il y a un ou des termes nuls que tu peux enlever dans tes réponses.'
const BRACKETS =
	"<span style='color:_COLORANSWER_'>Ta réponse</span> contient des parenthèses inutiles."
const BRACKETS_MULTIPLE_ANSWERS =
	'il y a des parenthèses inutiles dans tes réponses.'
const BRACKETS_FIRST_TERM =
	"<span style='color:_COLORANSWER_'>Ta réponse</span> contient des parenthèses inutiles en début de somme."
const SPACES =
	"Les chiffres sont mal espacés dans <span style='color:_COLORANSWER_'>ta réponse</span>."
const SPACES_MULTIPLE_ANSWERS =
	'Les chiffres sont mal espacés dans tes réponses'
const SIGNS =
	"Tu peux faire des simplifications de signes dans <span style='color:_COLORANSWER_'>ta réponse</span>."
const SIGNS_MULTIPLE_ANSWERS =
	'Tu peux faire des simplifications de signes dans tes réponses.'
const MATH_INCORRECT =
	"<span style='color:_COLORANSWER_'>Ta réponse</span> n'est pas écrite correctement."
const MATH_INCORRECT_MULTIPLE_ANSWERS =
	'Une ou plusieurs de tes réponses ne sont pas écrites correctement:'
const MATH_GLOBALLY_INCORRECT =
	"L'expression obtenue n'est pas mathématiquement correcte."
const PRODUCTS =
	"Tu peux simplifier certains symboles de multiplication dans <span style='color:_COLORANSWER_'>ta réponse</span>."
const PRODUCTS_MULTIPLE_ANSWERS =
	'Tu peux simplifier certains symboles de multiplication dans tes réponses>.'
const FRACTIONS =
	"<span style='color:_COLORANSWER_'>Ta réponse</span> contient une ou des fractions non simplifiées."

const FRACTIONS_MULTIPLE_ANSWERS =
	'Il y a une ou des fractions non simplifiées dans tes réponses.'

const BAD_FORM =
	"<span style='color:_COLORANSWER_'>Ta réponse</span> n'est pas écrite sous la forme demandée."

const BAD_FORM_MULTIPLE_ANSWERS =
	"La forme demandée n'est pas respectée dans tes réponses."

const BAD_UNIT =
	"<span style='color:_COLORANSWER_'>Ta réponse</span> n'est pas écrite avec l'unité demandée."
const BAD_UNIT_MULTIPLE_ANSWERS =
	"Tes réponses n'utilisent pas l'unité demandée."

const TERMS_PERMUTATION =
	"Dans <span style='color:_COLORANSWER_'>ta réponse</span> les termes doivent être écrits dans un certain ordre."

const TERMS_PERMUTATION_MULTIPLE_ANSWERS =
	'Les termes doivent être écrits dans un certain ordre dans tes réponses.'

const FACTORS_PERMUTATION =
	"Dans <span style='color:_COLORANSWER_'>ta réponse</span> les facteurs doivent être écrits dans un certain ordre."

const FACTORS_PERMUTATION_MULTIPLE_ANSWERS =
	'Les facteurs doivent être écrits dans un certain ordre dans tes réponses.'

const TERMS_FACTORS_PERMUTATION =
	"Dans <span style='color:_COLORANSWER_'>ta réponse</span> les termes et facteurs doivent être écrits dans un certain ordre."

const TERMS_FACTORS_PERMUTATION_MULTIPLE_ANSWERS =
	'Les termes et facteurs doivent être écrits dans un certain ordre dans tes réponses.'

const INCOMPLETE_CHOICES = "Tu n'as pas choisi toutes les bonnes réponses."

// retourne un tableau des contraintes non respectées

type Com =
	| typeof EMPTY_ANSWER
	| typeof ZEROS
	| typeof FACTORE_ONE
	| typeof FACTORE_ZERO
	| typeof NULL_TERMS
	| typeof BRACKETS
	| typeof BRACKETS_FIRST_TERM
	| typeof SPACES
	| typeof SIGNS
	| typeof MATH_INCORRECT
	| typeof MATH_GLOBALLY_INCORRECT
	| typeof PRODUCTS
	| typeof FRACTIONS
	| typeof BAD_FORM
	| typeof BAD_UNIT
	| typeof TERMS_PERMUTATION
	| typeof FACTORS_PERMUTATION
	| typeof TERMS_FACTORS_PERMUTATION
	| typeof INCOMPLETE_CHOICES

type ComMultipleAnswers =
	| typeof EMPTY_MULTIPLE_ANSWERS
	| typeof ZEROS_MULTIPLE_ANSWERS
	| typeof FACTORE_ONE_MULTIPLE_ANSWERS
	| typeof FACTORE_ZERO_MULTIPLE_ANSWERS
	| typeof NULL_TERMS_MULTIPLE_ANSWERS
	| typeof BRACKETS_MULTIPLE_ANSWERS
	| typeof SPACES_MULTIPLE_ANSWERS
	| typeof SIGNS_MULTIPLE_ANSWERS
	| typeof MATH_INCORRECT_MULTIPLE_ANSWERS
	| typeof PRODUCTS_MULTIPLE_ANSWERS
	| typeof FRACTIONS_MULTIPLE_ANSWERS
	| typeof BAD_FORM_MULTIPLE_ANSWERS
	| typeof BAD_UNIT_MULTIPLE_ANSWERS
	| typeof TERMS_PERMUTATION_MULTIPLE_ANSWERS
	| typeof FACTORS_PERMUTATION_MULTIPLE_ANSWERS
	| typeof TERMS_FACTORS_PERMUTATION_MULTIPLE_ANSWERS

type Check = {
	option: Option[]
	com: Com
	comMultipleAnswers: ComMultipleAnswers
	text: string
	function: (item: CorrectedQuestion) => number[]
}
function checkConstraints(item: CorrectedQuestion) {
	const checks: Check[] = [
		{
			option: ['no-penalty-for-incorrect-spaces', 'require-correct-spaces'],
			function: checkSpaces,
			com: SPACES,
			comMultipleAnswers: SPACES_MULTIPLE_ANSWERS,
			text: 'spaces',
		},
		{
			option: ['no-penalty-for-explicit-products', 'require-implicit-products'],
			function: checkProducts,
			com: PRODUCTS,
			comMultipleAnswers: PRODUCTS_MULTIPLE_ANSWERS,
			text: 'implicits products',
		},
		{
			option: [
				'no-penalty-for-extraneous-brackets',
				'require-no-extraneaous-brackets',
			],
			function: checkBrackets,
			com: BRACKETS,
			comMultipleAnswers: BRACKETS_MULTIPLE_ANSWERS,
			text: 'extraneous brackets',
		},

		// la vérifiaction pour le premiet terme se fait dans check_brackets

		// {
		//     option: [
		//         'no-penalty-for-extraneous-brackets-in-first-negative-term',
		//         'require-no-extraneaous-brackets',
		//     ],
		//     function: checkBrackets,
		//     com: BRACKETS_FIRST_TERM,
		// },
		{
			option: [
				'no-penalty-for-extraneous-zeros',
				'require-no-extraneaous-zeros',
			],
			function: checkZeros,
			com: ZEROS,
			comMultipleAnswers: ZEROS_MULTIPLE_ANSWERS,
			text: 'extraneous zeros',
		},
		{
			option: [
				'no-penalty-for-extraneous-signs',
				'require-no-extraneaous-signs',
			],
			function: checkSigns,
			com: SIGNS,
			comMultipleAnswers: SIGNS_MULTIPLE_ANSWERS,
			text: 'extraneous signs',
		},
		{
			option: ['no-penalty-for-factor-one', 'require-no-factor-one'],
			function: checkFactorsOne,
			com: FACTORE_ONE,
			comMultipleAnswers: FACTORE_ONE_MULTIPLE_ANSWERS,
			text: 'factor one',
		},
		{
			option: ['no-penalty-for-factor-zero', 'require-no-factor-zero'],
			function: checkFactorsZero,
			com: FACTORE_ZERO,
			comMultipleAnswers: FACTORE_ZERO_MULTIPLE_ANSWERS,
			text: 'factor zero',
		},
		{
			option: ['no-penalty-for-null-terms', 'require-no-null-terms'],
			function: checkNullTerms,
			com: NULL_TERMS,
			comMultipleAnswers: NULL_TERMS_MULTIPLE_ANSWERS,
			text: 'null term',
		},
		{
			option: [
				'no-penalty-for-non-reduced-fractions',
				'require-reduced-fractions',
			],
			function: checkFractions,
			com: FRACTIONS,
			comMultipleAnswers: FRACTIONS_MULTIPLE_ANSWERS,
			text: 'non reduced fraction',
		},
		{
			option: ['no-penalty-for-not-respected-unit', 'require-specific-unit'],
			function: checkUnits,
			com: BAD_UNIT,
			comMultipleAnswers: BAD_UNIT_MULTIPLE_ANSWERS,
			text: 'bad unit',
		},
	]

	// on doit checker chaque contrainte si require est positionnée ou si no-penalty n'est pas positionnée
	// (les 2 ne peuvent pas etre positionnées en même temps)
	//
	checks.forEach((check) => {
		if (!item.options.includes(check.option[0])) {
			const problematicAnswers = check.function(item)
			if (problematicAnswers.length) {
				item.unoptimals.push(check.text)
				item.coms.push(
					item.answers.length === 1 ? check.com : check.comMultipleAnswers,
				)
				problematicAnswers.forEach((i) => {
					if (i === -1) {
						item.status =
							!item.options.includes(check.option[1]) &&
							item.status !== STATUS_BAD_FORM
								? STATUS_UNOPTIMAL_FORM
								: STATUS_BAD_FORM
					} else {
						item.statuss[i] =
							!item.options.includes(check.option[1]) &&
							item.statuss[i] !== STATUS_BAD_FORM
								? STATUS_UNOPTIMAL_FORM
								: STATUS_BAD_FORM
					}
				})
			}
		}
	})
}

function checkTermsAndFactors(item: CorrectedQuestion) {
	if (item.solutions.length) {
		let sols = item.solutions.map((solution) => math(solution))
		sols = sols.map((solution) =>
			solution
				.removeZerosAndSpaces()
				.reduceFractions()
				.simplifyNullProducts()
				.removeNullTerms()
				.removeFactorsOne()
				.removeSigns()
				.removeUnecessaryBrackets()
				.removeMultOperator(),
		)
		item.answers.forEach((answer, i) => {
			if (
				item.statuss[i] !== STATUS_EMPTY &&
				item.statuss[i] !== STATUS_INCORRECT
			) {
				let e = math(answer)

				// Les tests de contraintes ont été faits. Il faut simplifier la réponse pour pouvoir
				// la comparer à la solution : on enlève les parenthèses inutiles, les signes inutiles....
				e = e
					.removeZerosAndSpaces()
					.reduceFractions()
					.simplifyNullProducts()
					.removeNullTerms()
					.removeFactorsOne()
					.removeSigns()
					.removeUnecessaryBrackets()
					.removeMultOperator()

				// item.cleanedExp = e.string
				// item.cleanedSolutions = sols.map((s) => s.string)
				// }

				if (
					item.options.includes('disallow-terms-and-factors-permutation') ||
					item.options.includes('penalty-for-terms-and-factors-permutation')
				) {
					if (!sols[i].strictlyEquals(e)) {
						if (
							item.options.includes(
								'penalty-for-terms-and-factors-permutation',
							) &&
							item.statuss[i] !== STATUS_BAD_FORM &&
							item.statuss[i] !== STATUS_BAD_UNIT
						) {
							item.unoptimals.push('terms and factors unordered')
							item.statuss[i] = STATUS_UNOPTIMAL_FORM
							item.coms.push(
								item.answers.length === 1
									? TERMS_FACTORS_PERMUTATION
									: TERMS_FACTORS_PERMUTATION_MULTIPLE_ANSWERS,
							)
						} else {
							item.statuss[i] = STATUS_BAD_FORM
							item.coms.push(
								item.answers.length === 1
									? BAD_FORM
									: BAD_FORM_MULTIPLE_ANSWERS,
							)
						}
					}
				} else if (
					item.options.includes('disallow-terms-permutation') ||
					item.options.includes('penalty-for-terms-permutation')
				) {
					e = e.sortFactors()
					sols = sols.map((solution) => solution.sortFactors())
					if (!sols[i].strictlyEquals(e)) {
						if (
							item.options.includes('penalty-for-terms-permutation') &&
							item.statuss[i] !== STATUS_BAD_FORM &&
							item.statuss[i] !== STATUS_BAD_UNIT
						) {
							item.unoptimals.push('terms unordered')
							item.statuss[i] = STATUS_UNOPTIMAL_FORM
							item.coms.push(
								item.answers.length === 1
									? TERMS_PERMUTATION
									: TERMS_PERMUTATION_MULTIPLE_ANSWERS,
							)
						} else {
							item.statuss[i] = STATUS_BAD_FORM
							item.coms.push(
								item.answers.length === 1
									? BAD_FORM
									: BAD_FORM_MULTIPLE_ANSWERS,
							)
						}
					}
				} else if (
					item.options.includes('disallow-factors-permutation') ||
					item.options.includes('penalty-for-factors-permutation')
				) {
					e = e.sortTerms()
					sols = sols.map((solution) => solution.sortTerms())
					if (!sols[i].strictlyEquals(e)) {
						if (
							item.options.includes('penalty-for-factors-permutation') &&
							item.statuss[i] !== STATUS_BAD_FORM &&
							item.statuss[i] !== STATUS_BAD_UNIT
						) {
							item.unoptimals.push('factors unordered')
							item.statuss[i] = STATUS_UNOPTIMAL_FORM
							item.coms.push(
								item.answers.length === 1
									? FACTORS_PERMUTATION
									: FACTORS_PERMUTATION_MULTIPLE_ANSWERS,
							)
						} else {
							item.statuss[i] = STATUS_BAD_FORM
							item.coms.push(
								item.answers.length === 1
									? BAD_FORM
									: BAD_FORM_MULTIPLE_ANSWERS,
							)
						}
					}
				}
			}
		})
	}
}

function checkUnits(item: CorrectedQuestion) {
	const result: number[] = []
	if (item.unit) {
		item.answers.forEach((answer, i) => {
			if (
				item.statuss[i] !== STATUS_EMPTY &&
				item.statuss[i] !== STATUS_INCORRECT
			) {
				const e = math(answer)

				if (
					(item.unit === 'HMS' && !e.isTime()) ||
					(item.unit !== 'HMS' && !e.unit) ||
					(item.unit !== 'HMS' && e.unit && e.unit.string !== item.unit)
				)
					result.push(i)
			}
		})
	}

	return result
}

function checkProducts(item: CorrectedQuestion) {
	const result: number[] = []
	item.answers.forEach((answer, i) => {
		if (
			item.statuss[i] !== STATUS_EMPTY &&
			item.statuss[i] !== STATUS_INCORRECT
		) {
			const e = math(answer)
			if (e.removeMultOperator().string !== e.string) result.push(i)
		}
	})
	return result
}

function checkFractions(item: CorrectedQuestion) {
	const result: number[] = []
	item.answers.forEach((answer, i) => {
		if (
			item.statuss[i] !== STATUS_EMPTY &&
			item.statuss[i] !== STATUS_INCORRECT
		) {
			const e = math(answer)
			if (e.reduceFractions().string !== e.string) result.push(i)
		}
	})
	return result
}

function checkNullTerms(item: CorrectedQuestion) {
	const result: number[] = []
	item.answers.forEach((answer, i) => {
		if (
			item.statuss[i] !== STATUS_EMPTY &&
			item.statuss[i] !== STATUS_INCORRECT
		) {
			const e = math(answer)
			if (e.removeNullTerms().string !== e.string) result.push(i)
		}
	})
	return result
}

function checkBrackets(item: CorrectedQuestion) {
	const result: number[] = []
	const allowBracketsInFirstNegativeTerm = item.options.includes(
		'no-penalty-for-extraneous-brackets-in-first-negative-term',
	)

	if (item.type === 'fill in' && item.expression && !item.answerFields) {
		let i = -1
		const putAnswers = () => {
			i++
			return item.answers[i] as string
		}

		const exp = math(item.expression.replace(/\?/g, putAnswers))

		if (
			exp.removeUnecessaryBrackets(allowBracketsInFirstNegativeTerm).string !==
			exp.string
		) {
			result.push(-1)
		}
	} else {
		item.answers.forEach((answer, i) => {
			if (
				item.statuss[i] !== STATUS_EMPTY &&
				item.statuss[i] !== STATUS_INCORRECT
			) {
				const e = math(answer)
				if (
					e.removeUnecessaryBrackets(allowBracketsInFirstNegativeTerm)
						.string !== e.string
				) {
					result.push(i)
				}
			}
		})
	}
	return result
}

function checkSigns(item: CorrectedQuestion) {
	const result: number[] = []
	item.answers.forEach((answer, i) => {
		if (
			item.statuss[i] !== STATUS_EMPTY &&
			item.statuss[i] !== STATUS_INCORRECT
		) {
			// pourquoi tout ce bordel déjà ??????
			const e1 = math(answer)
				.reduceFractions()
				.simplifyNullProducts()
				.removeNullTerms()
				.removeFactorsOne()
				.removeUnecessaryBrackets()
				.removeMultOperator()
				.removeSigns()
			const e2 = math(answer)
				.reduceFractions()
				.simplifyNullProducts()
				.removeNullTerms()
				.removeFactorsOne()
				.removeUnecessaryBrackets()
				.removeMultOperator()
			// il faut enlever les * inutiles
			if (e1.string !== e2.string) result.push(i)
		}
	})
	return result
}

function checkFactorsOne(item: CorrectedQuestion) {
	const result: number[] = []
	item.answers.forEach((answer, i) => {
		if (
			item.statuss[i] !== STATUS_EMPTY &&
			item.statuss[i] !== STATUS_INCORRECT
		) {
			const e = math(answer)
			if (e.removeFactorsOne().string !== e.string) result.push(i)
		}
	})
	return result
}

function checkFactorsZero(item: CorrectedQuestion) {
	const result: number[] = []
	item.answers.forEach((answer, i) => {
		if (
			item.statuss[i] !== STATUS_EMPTY &&
			item.statuss[i] !== STATUS_INCORRECT
		) {
			const e = math(answer)
			if (e.simplifyNullProducts().string !== e.string) result.push(i)
		}
	})
	return result
}

// retourne true si la vérification est OK
function checkSpaces(item: CorrectedQuestion) {
	//  TODO: a Remplacer par searchMisplacedSpaces
	// la sortie asciimaths du mathfield ne garde pas les espaces

	const result: number[] = []
	item.answers_latex.forEach((answer, i) => {
		if (
			item.statuss[i] !== STATUS_EMPTY &&
			item.statuss[i] !== STATUS_INCORRECT
		) {
			const a = answer.replace(/\\,/g, ' ').replace('{,}', '.').trim()
			const regex = /\d+[\d\s]*(\.[\d\s]*\d+)?/g
			const matches = a.match(regex)
			const regexsInt = [
				/\d{4}/,
				/\s$/,
				/\s\d{2}$/,
				/\s\d{2}\s/,
				/\s\d$/,
				/\s\d\s/,
			]
			const regexsDec = [
				/\d{4}/,
				/^\s/,
				/^\d{2}\s/,
				/\s\d{2}\s/,
				/^\d\s/,
				/\s\d\s/,
			]
			const findIncorrectSpace = (s: string) => {
				let [int, dec] = s.split('.')
				// Dans le cas des entiers, il peut y a voir un espace à la fin,
				// il faut l'enlever
				int = int.trim()

				if (
					regexsInt.some((regex) => int.match(regex)) ||
					(dec && regexsDec.some((regex) => dec.match(regex)))
				) {
					return true
				}

				return false
			}
			// on a trouvé des nombres
			if (matches && matches.some(findIncorrectSpace)) {
				result.push(i)
			}
		}
	})
	return result
}

// function checkOrder() {
//     return true
// }

function checkZeros(item: CorrectedQuestion) {
	const result: number[] = []
	item.answers.forEach((answer, i) => {
		if (
			item.statuss[i] !== STATUS_EMPTY &&
			item.statuss[i] !== STATUS_INCORRECT
		) {
			const e = math(answer)
			if (e.searchUnecessaryZeros()) result.push(i)
		}
	})
	return result
}

function checkForm(item: CorrectedQuestion) {
	if (!item.testAnswers.length && item.solutions.length) {
		if (item.options.includes('one-single-form-solution')) {
			item.answers.forEach((answer, i) => {
				if (
					item.statuss[i] !== STATUS_EMPTY &&
					item.statuss[i] !== STATUS_INCORRECT
				) {
					let e = math(answer)
					const indexSolution = item.options.includes(
						'solutions-order-not-important',
					)
						? item.solutionsIndexs[i]
						: i

					let solution = math(item.solutions[indexSolution])
					// trouver une solution pour les unités
					if (!e.unit && !e.strictlyEquals(solution)) {
						item.statuss[i] = STATUS_BAD_FORM
						item.coms.push(
							item.answers.length === 1 ? BAD_FORM : BAD_FORM_MULTIPLE_ANSWERS,
						)
					}
				}
			})
		} else {
			// const result = []
			item.answers.forEach((answer, i) => {
				if (
					item.statuss[i] !== STATUS_EMPTY &&
					item.statuss[i] !== STATUS_INCORRECT
				) {
					// A REVOIR
					let e = math(answer)
						.removeZerosAndSpaces()
						.reduceFractions()
						.simplifyNullProducts()
					// if (!item.options.includes('no-penalty-for-null-terms')) {
					e = e.removeNullTerms()
					// }
					e = e
						.removeFactorsOne()

						.removeUnecessaryBrackets()
						.removeMultOperator()
						.sortTermsAndFactors()

					const indexSolution = item.options.includes(
						'solutions-order-not-important',
					)
						? item.solutionsIndexs[i]
						: i

					// pourquoi le faire pour solutions ?
					// la solution est censé est écrite sous une forme correcte.
					// oui mais pas toujours sous sorme optimale
					let solution = math(item.solutions[indexSolution])
						.removeZerosAndSpaces()
						.reduceFractions()
						.simplifyNullProducts()
					// if (!item.options.includes('no-penalty-for-null-terms')) {
					solution = solution.removeNullTerms()
					// }
					solution = solution
						.removeFactorsOne()
						.removeSigns()
						.removeUnecessaryBrackets()
						.removeMultOperator()
						.sortTermsAndFactors()

					// il faut trouver une autre solution quand il y a des unités
					if (!e.unit && !e.strictlyEquals(solution)) {
						item.statuss[i] = STATUS_BAD_FORM
						item.coms.push(
							item.answers.length === 1 ? BAD_FORM : BAD_FORM_MULTIPLE_ANSWERS,
						)
					}
				}
			})
		}
		// return result
	}
}

// on évalue la réponse de l'utilisateur en donnant un statut à chaque élément de la réponse,
// ainsi qu'à la réponse globale
export function assessItem(item: AnsweredQuestion) {
	// TODO: vérifier que les options sont intialisées à [] dans generateQuestion
	const correctedItem: CorrectedQuestion = prepareCorrectedQuestion(item)
	// essentiellement pour les tests
	if (!correctedItem.answers_latex.length && correctedItem.answers.length) {
		correctedItem.answers_latex = correctedItem.answers.map((answer) =>
			math(answer).toLatex({ addSpaces: false }),
		)
	}

	if (!correctedItem.answers.length) {
		// mode projection en classe : pas de réponse
		correctedItem.status = STATUS_EMPTY
		correctedItem.statuss = [STATUS_EMPTY]
	} else {
		// le statut de chaque réponse si il y a plusieurs champs réponses
		// initialisée à CORRECT ou EMPTY
		correctedItem.statuss = correctedItem.answers.map((answer) =>
			((correctedItem.type === QUESTION_TYPE_CHOICE ||
				correctedItem.type === QUESTION_TYPE_CHOICES) &&
				answer !== '' &&
				answer >= 0) ||
			answer
				? STATUS_CORRECT
				: STATUS_EMPTY,
		)
		// si toutes les réponses sont vides, pas besoin d'aller plus loin
		if (correctedItem.statuss.every((status) => status === STATUS_EMPTY)) {
			if (correctedItem.answers) correctedItem.coms.push(EMPTY_ANSWER)
			correctedItem.status = STATUS_EMPTY
		}
		// le cas simple à traiter des réponses à choix (multiples ou non)
		else if (
			correctedItem.type === QUESTION_TYPE_CHOICE &&
			correctedItem.solutions.toString() !== correctedItem.answers.toString()
		) {
			correctedItem.statuss = [STATUS_INCORRECT]
			correctedItem.status = STATUS_INCORRECT
		}
		// choix multiples
		else if (
			correctedItem.type === QUESTION_TYPE_CHOICES &&
			correctedItem.solutions.toString() !== correctedItem.answers.toString()
		) {
			// on veut compter une partie des points si la ou les réponses choisies
			// sont correctes mais qu'il en manque
			correctedItem.answers.forEach((answer, i) => {
				if (!correctedItem.solutions.includes(answer as number)) {
					correctedItem.statuss[i] = STATUS_INCORRECT
					correctedItem.status = STATUS_INCORRECT
				}
			})
			if (correctedItem.status !== STATUS_INCORRECT) {
				correctedItem.status = STATUS_UNOPTIMAL_FORM
				correctedItem.coms.push(INCOMPLETE_CHOICES)
			}
		}
		// cas général
		else {
			if (correctedItem.statuss.some((status) => status === STATUS_EMPTY)) {
				correctedItem.coms.push(EMPTY_MULTIPLE_ANSWERS)
			}

			// On vérifie que les réponses sont écrites correctement
			// dans le cas d'une expression à trou, il faut vérifier que l'expression globale est
			// écrite correctement
			// TODO: ne faudrait-il pas mettre toutes les égalités à compléter dans un answerFields ?
			if (item.type === QUESTION_TYPE_FILL_IN) {
				let i = -1
				const putAnswers = () => {
					i++
					return correctedItem.answers[i] as string
				}

				// if (item.answerFields) {
				// dans ce cas c'est un answerFields qu'il faut compléter, et il correspond à une
				// expression mathématique. La différence c'est que le champs réponse peut contenir une expression
				//  qui n'est pas une expression mathématique correcte mais juste un symboel par exemple.
				// donc pas besoin de positionner item.statuss[i]

				// ENFAIT, c'est trop compliqué car l'expression est en latex
				// {
				// 	const regex = /\$\$.*?\.\.\..*?\$\$/g
				// 	const matched = item.answerFields.match(regex)
				// 	matched.forEach((match) => {
				// 		// on enlève les $$ au début et à la fin
				// 		match = match.replace(/\$\$/g, '')
				// 		const exp = match.replace(/\.\.\./g, putAnswers)
				// 		console.log('exp', exp)
				// 		if (math(exp).isIncorrect()) {
				// 			item.status = STATUS_INCORRECT
				// 			item.coms.push(
				// 				"L'expression $$" + exp + "$$ n'est pas écrite correctement.",
				// 			)
				// 		}
				// 	})
				// }
				// }
				// c'est une expression à compléter
				// else {
				if (correctedItem.expression && !correctedItem.answerFields) {
					let incorrectForm = false
					correctedItem.answers.forEach((answer, i) => {
						if (
							correctedItem.statuss[i] !== STATUS_EMPTY &&
							math(answer).isIncorrect()
						) {
							correctedItem.statuss[i] = STATUS_INCORRECT
							correctedItem.status = STATUS_INCORRECT
							incorrectForm = true
						}
					})
					const exp = math(correctedItem.expression.replace(/\?/g, putAnswers))
					if (exp.isIncorrect()) {
						correctedItem.status = STATUS_INCORRECT
						if (!incorrectForm) correctedItem.coms.push(MATH_GLOBALLY_INCORRECT)
					}
					if (incorrectForm && correctedItem.answers.length === 1) {
						correctedItem.coms.push(MATH_INCORRECT)
					} else if (incorrectForm) {
						correctedItem.coms.push(MATH_INCORRECT_MULTIPLE_ANSWERS)
					}
				}
			} else {
				const answer = correctedItem.answers[0]
				if (
					correctedItem.status !== STATUS_EMPTY &&
					math(answer).isIncorrect()
				) {
					correctedItem.status = STATUS_INCORRECT
					correctedItem.coms.push(MATH_INCORRECT)
				}

				// correctedItem.answers.forEach((answer, i) => {
				// 	if (
				// 		correctedItem.statuss[i] !== STATUS_EMPTY &&
				// 		math(answer).isIncorrect()
				// 	) {
				// 		correctedItem.statuss[i] = STATUS_INCORRECT
				// 		correctedItem.status = STATUS_INCORRECT
				// 	}
				// })
			}

			if (
				!correctedItem.statuss.every(
					(status) => status === STATUS_INCORRECT || status === STATUS_EMPTY,
				)
			) {
				// Premièrement, vérification que la ou les réponses sont seulement équivalentes à la solution
				//  ou vérifient le critère de validation
				if (correctedItem.testAnswers.length) {
					correctedItem.answers.forEach((answer, i) => {
						if (
							(correctedItem.testAnswers[i] &&
								correctedItem.statuss[i] !== STATUS_EMPTY &&
								correctedItem.statuss[i] !== STATUS_INCORRECT) ||
							(correctedItem.statuss[0] !== STATUS_EMPTY &&
								correctedItem.statuss[0] !== STATUS_INCORRECT)
						) {
							const t =
								correctedItem.testAnswers[i] || correctedItem.testAnswers[0]
							const tests = t
								.replace(/&answer/g, answer as string)
								.replace(/,/g, '.')
								.split('&&')
							const failed = tests.some((test) => {
								const failure =
									math(test).isIncorrect() ||
									(math(test).eval() as Bool).isFalse()
								return failure
							})
							if (failed) {
								correctedItem.statuss[i] = STATUS_INCORRECT
								correctedItem.status = STATUS_INCORRECT
							}
						}
					})
				}
				// les solutions sont explicites et sont dans item.solutions
				else if (correctedItem.type === QUESTION_TYPE_FILL_IN) {
					let i = -1
					const putAnswers = () => {
						i++
						return correctedItem.answers[i] as string
					}

					const exp = math(
						(correctedItem.expression as string).replace(/\?/g, putAnswers),
					)

					// TODO: est ce qu'une question de type FILL IN propose toujours une (in)égalité à compléter ?
					if ((exp.eval() as Bool).isFalse()) {
						correctedItem.status = STATUS_INCORRECT
					}
				} else {
					correctedItem.answers.forEach((answer, i) => {
						if (
							correctedItem.statuss[i] !== STATUS_EMPTY &&
							correctedItem.statuss[i] !== STATUS_INCORRECT
						) {
							if (
								correctedItem.options.includes('solutions-order-not-important')
							) {
								const index = correctedItem.solutions.findIndex(
									(solution, j) =>
										!correctedItem.solutionsUsed.includes(j) &&
										math(answer).equals(math(solution)),
								)
								if (index === -1) {
									correctedItem.statuss[i] = STATUS_INCORRECT
									correctedItem.status = STATUS_INCORRECT
								} else {
									correctedItem.solutionsUsed.push(index)
									correctedItem.solutionsIndexs[i] = index
								}
							} else if (
								!math(answer).equals(math(correctedItem.solutions[i]))
							) {
								correctedItem.statuss[i] = STATUS_INCORRECT
								correctedItem.status = STATUS_INCORRECT
							}
						}
					})
				}

				//  A ce stade,le status chaque élément de réponse est STATUS_EMPTY, STATUS_CORRECT
				// ou STATUS_INCORRECT
				// les question 'fill in' peuvent aussi avoir un STATUS_INCORRECT
				// On vérifie les contraintes de formes
				if (
					correctedItem.status !== STATUS_EMPTY &&
					correctedItem.status !== STATUS_INCORRECT
				) {
					checkConstraints(correctedItem)
					checkTermsAndFactors(correctedItem)
					// TODO : tester les formats
					checkForm(correctedItem)

					if (
						correctedItem.statuss.some((status) => status === STATUS_BAD_FORM)
					) {
						correctedItem.status = STATUS_BAD_FORM
					} else if (
						correctedItem.statuss.some(
							(status) => status === STATUS_UNOPTIMAL_FORM,
						) ||
						(correctedItem.statuss.filter((status) => status === STATUS_EMPTY)
							.length > 0 &&
							correctedItem.statuss.filter((status) => status === STATUS_EMPTY)
								.length <=
								correctedItem.statuss.length / 2)
					) {
						correctedItem.status = STATUS_UNOPTIMAL_FORM
					} else if (
						correctedItem.statuss.filter((status) => status === STATUS_EMPTY)
							.length > 0
					) {
						correctedItem.status = STATUS_INCORRECT
					} else if (
						correctedItem.type === QUESTION_TYPE_CHOICES &&
						correctedItem.answers &&
						correctedItem.answers.length &&
						correctedItem.answers.length >=
							correctedItem.solutions.length / 2 &&
						correctedItem.answers.length < correctedItem.solutions.length
					) {
						// pour les qcm ou on accorde un demi point si au moins la moitié des bonnes
						//  ont été sélectionnées (sans erreur à côté)
						correctedItem.status = STATUS_UNOPTIMAL_FORM
					}
				}
			}
		}
	}

	createCorrection(correctedItem)
	createDetailedCorrection(correctedItem)
	console.log('assessed item', correctedItem)
	return correctedItem
}

export function prepareAnsweredQuestion(
	q: GeneratedQuestion,
): AnsweredQuestion {
	return {
		...q,
		answers: [],
		answers_latex: [],
		options: q.options || [],
	}
}

export function prepareCorrectedQuestion(
	q: AnsweredQuestion,
): CorrectedQuestion {
	return {
		answers_latex: [],
		testAnswers: [],
		solutions: [],
		choices: [],
		correctionDetails: [],
		...q,
		status: STATUS_CORRECT,
		statuss: [],
		coms: [],
		unoptimals: [],
		solutionsIndexs: {},
		solutionsUsed: [],
		simpleCorrection: [],
		detailedCorrection: [],
	}
}
