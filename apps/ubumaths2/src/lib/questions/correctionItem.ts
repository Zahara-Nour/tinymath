import {
	STATUS_BAD_FORM,
	STATUS_CORRECT,
	STATUS_INCORRECT,
	STATUS_UNOPTIMAL_FORM,
	STATUS_EMPTY,
	STATUS_BAD_UNIT,
} from './correction'
import { correct_color, incorrect_color, unoptimal_color } from '$lib/colors'
import { toMarkup, formatLatexToHtml } from '$lib/stores'
import math from 'tinycas'
import { formatToLatex, formatToTexmacs } from '$lib/utils'
import { get } from 'svelte/store'
import {
	isQuestionChoice,
	type Choice,
	type CorrectedQuestion,
	type Line,
	type LineChoice,
} from '$lib/type'
import {
	QUESTION_TYPE_CHOICE,
	QUESTION_TYPE_CHOICES,
	QUESTION_TYPE_RESULT,
} from './questions'

function createSolutionsLatex(item: CorrectedQuestion) {
	return item.solutions.length
		? item.solutions.map((solution) => {
				if (
					item.type === QUESTION_TYPE_CHOICE ||
					item.type === QUESTION_TYPE_CHOICES
				) {
					return item.choices[solution as number]
				} else {
					const e = math(solution)
					return e.latex
				}
		  })
		: []
}

export function createCorrection(item: CorrectedQuestion) {
	const {
		expression,
		expression_latex,
		solutions,
		answers,
		answers_latex = [],
		correctionFormat,
		status = STATUS_EMPTY,
		choices,
	} = item

	if (!solutions.length && !item.testAnswers.length) return

	let lines: Line[] = []
	let coms = item.coms || []

	let answerColor = correct_color
	if (
		status === STATUS_BAD_FORM ||
		status === STATUS_INCORRECT ||
		status === STATUS_BAD_UNIT
	) {
		answerColor = incorrect_color
	} else if (status === STATUS_UNOPTIMAL_FORM) {
		answerColor = unoptimal_color
	}

	let solutions_latex = createSolutionsLatex(item)

	const regexExpression = /&expression/g
	function replaceExpression() {
		return '$$' + item.expression_latex + '$$'
	}

	const regexExpression2 = /&expression2/g
	function replaceExpression2() {
		return '$$' + item.expression2_latex + '$$'
	}

	// &exp est déjà dans une expression LaTeX : on ne rajoute pas les $$
	const regexExp = /&exp/g
	function replaceExp() {
		return item.expression_latex || ''
	}

	// &exp2 est déjà dans une expression LaTeX : on ne rajoute pas les $$
	const regexExp2 = /&exp2/g
	function replaceExp2() {
		return item.expression2_latex || ''
	}

	const regexAnswer = /&answer([1-9]?)/g
	function replaceAnswerCorrect(match: string, p1: number) {
		return (
			`<span style="color:${correct_color}; border:2px solid ${correct_color}; border-radius: 5px;  margin:2px; padding:5px;display:inline-block">` +
			(item.type === 'choice'
				? item.choices[item.answers[p1 ? p1 - 1 : 0] as number].text
				: '$$' + answers_latex[p1 ? p1 - 1 : 0] + '$$') +
			'</span>'
		)
	}

	// &ans est déjà dans une expression LaTeX : on ne rajoute pas les $$
	const regexAns = /&ans([1-9]?)/g
	function replaceAnsCorrect(match: string, p1: number) {
		return (
			`\\enclose{roundedbox}[3px solid ${correct_color}, padding="auto"]{\\textcolor{${correct_color}}{` +
			answers_latex[p1 ? p1 - 1 : 0] +
			'}}'
		)
	}

	const regexSolution = /&solution([1-9]?)/g
	function replaceSolution(match: string, p1: number) {
		return (
			`<span style="color:${correct_color}; border:2px solid ${correct_color}; border-radius: 5px; margin:2px;padding:5px;display:inline-block">` +
			(item.type === 'choice'
				? item.choices[solutions[p1 ? p1 - 1 : 0] as number].text
				: '$$' + (solutions_latex[p1 ? p1 - 1 : 0] as string) + '$$') +
			'</span>'
		)
	}

	function replaceSolutionTexmacs(match: string, p1: number) {
		return item.type === 'choice' || item.type === 'choices'
			? (item.choices[solutions[p1 ? p1 - 1 : 0] as number].text as string)
			: `$\\textcolor{green}{` + solutions_latex[p1 ? p1 - 1 : 0] + '}$'
	}

	const regexSol = /&sol([1-9]?)/g
	// &sol est déjà dans une expression LaTeX : on ne rajoute pas les $$
	function replaceSol(match: string, p1: number) {
		return item.type === 'choice'
			? (item.choices[solutions[p1 ? p1 - 1 : 0] as number].text as string)
			: `\\enclose{roundedbox}[3px solid ${correct_color}, padding="6"]{\\textcolor{${correct_color}}{` +
					solutions_latex[p1 ? p1 - 1 : 0] +
					'}}'
	}

	function replaceSolTexmacs(match: string, p1: number) {
		return item.type === 'choice'
			? (item.choices[solutions[p1 ? p1 - 1 : 0] as number].text as string)
			: `\\textcolor{green}{` + solutions_latex[p1 ? p1 - 1 : 0] + '}'
	}

	function replaceAnswerUncorrect(match: string, p1: number) {
		return (
			`<span style="color:${
				item.statuss[p1 ? p1 - 1 : 0] === STATUS_UNOPTIMAL_FORM
					? unoptimal_color
					: item.statuss[p1 ? p1 - 1 : 0] === STATUS_CORRECT
					? correct_color
					: incorrect_color
			};display:inline-block">` +
			(item.type === 'choice'
				? item.choices[item.answers[p1 ? p1 - 1 : 0] as number].text
				: '$$' + answers_latex[p1 ? p1 - 1 : 0] + '$$') +
			'</span>'
		)
	}

	function replaceAnsUncorrect(match: string, p1: number) {
		return (
			`\\textcolor{${
				item.statuss[p1 ? p1 - 1 : 0] === STATUS_UNOPTIMAL_FORM
					? unoptimal_color
					: item.statuss[p1 ? p1 - 1 : 0] === STATUS_CORRECT
					? correct_color
					: incorrect_color
			}}{` +
			answers_latex[p1 ? p1 - 1 : 0] +
			'}'
		)
	}

	if (correctionFormat) {
		// la correction
		if (status === STATUS_CORRECT) {
			correctionFormat.correct.forEach((format) => {
				if (format === 'image') {
					const img = choices[solutions[0] as number].imageBase64
					const html = `<img src='${img}' style="max-width:400px;max-height:40vh;" alt='toto'>`
					lines.push({
						html,
					})
				} else {
					const text = (formatToLatex(format) as string)
						.replace(regexExpression2, replaceExpression2)
						.replace(regexExpression, replaceExpression)
						.replace(regexExp2, replaceExp2)
						.replace(regexExp, replaceExp)
						.replace(regexAnswer, replaceAnswerCorrect)
						.replace(regexAns, replaceAnsCorrect)
					lines.push({
						text,
					})
				}
			})
		} else {
			;(correctionFormat.uncorrect as string[]).forEach((format) => {
				if (format === 'image') {
					let img = choices[solutions[0] as number].imageBase64
					const html = `<img style="max-width:400px;max-height:40vh;" src='${img}' alt='toto'>`
					lines.push({ html })
				} else {
					const text = (formatToLatex(format) as string)
						.replace(regexExpression2, replaceExpression2)
						.replace(regexExpression, replaceExpression)
						.replace(regexExp2, replaceExp2)
						.replace(regexExp, replaceExp)
						.replace(regexSolution, replaceSolution)
						.replace(regexSol, replaceSol)
					const texmacs = (formatToTexmacs(format) as string)
						.replace(regexExpression2, replaceExpression2)
						.replace(regexExpression, replaceExpression)
						.replace(regexExp2, replaceExp2)
						.replace(regexExp, replaceExp)
						.replace(regexSolution, replaceSolutionTexmacs)
						.replace(regexSol, replaceSolTexmacs)
					lines.push({ text, texmacs })
				}
			})

			// le commentaire avec la réponse de l'utilisateur

			if (status !== STATUS_EMPTY && item.answers.length) {
				if (correctionFormat.answer === 'image') {
					// TODO: A revoir
					const img = choices[answers[0] as number].imageBase64
					coms.unshift(
						`<img src='${img}' style="padding:2px; border: 2px solid ${incorrect_color} ;max-width:400px;max-height:40vh;" alt='toto'>`,
					)
					coms.unshift('Ta réponse:')
				} else {
					coms.unshift(
						'Ta réponse : ' +
							(correctionFormat.answer as string)
								// .replace(new RegExp('&exp2', 'g'), '$$$$'+expression2_latex+'$$$$')
								// .replace(new RegExp('&exp', 'g'), '$$$$'+expression_latex+'$$$$')
								.replace(regexExpression2, replaceExpression2)
								.replace(regexExpression, replaceExpression)
								.replace(regexExp2, replaceExp2)
								.replace(regexExp, replaceExp)
								.replace(regexAnswer, replaceAnswerUncorrect)
								.replace(regexAns, replaceAnsUncorrect),
					)
				}
			}
		}
	} else {
		switch (item.type) {
			case QUESTION_TYPE_RESULT: {
				let text = `$$\\begin{align*}  ${expression_latex}`
				if (status === STATUS_INCORRECT) {
					text += `&= \\enclose{updiagonalstrike}[3px solid ${incorrect_color}]{${answers_latex[0]}} \\\\`
				} else if (status === STATUS_BAD_FORM || status === STATUS_BAD_UNIT) {
					text += `&= \\textcolor{${incorrect_color}}{${answers_latex[0]}} \\\\`
				} else if (status === STATUS_UNOPTIMAL_FORM) {
					text += `&= \\textcolor{${unoptimal_color}}{${answers_latex[0]}} \\\\`
				}
				if (status === STATUS_CORRECT) {
					text += `&=\\enclose{roundedbox}[2px solid ${correct_color}, padding='2']{\\textcolor{${correct_color}}{${answers_latex[0]}}}`
				} else {
					text += `&=\\enclose{roundedbox}[2px solid ${correct_color}, padding='2']{\\textcolor{${correct_color}}{${solutions_latex[0]}}}`
				}
				text += '\\end{align*}$$'
				// }
				const texmacs =
					'<math|' +
					math(expression as string).texmacs +
					`=<with|color|#66bb6a|${math(solutions[0]).texmacs}>>`

				lines.push({
					text,
					texmacs,
				})

				break
			}

			case 'equation': {
				// let exp = '$$\\begin{align*}x & =5-3 \\\\  & =2\\end{align*}$$'
				let text
				text = `$$\\begin{align*}  x`
				if (status === STATUS_EMPTY) {
					text +=
						`=\\enclose{roundedbox}[3px solid ${correct_color}]{\\textcolor{${correct_color}}{${solutions_latex[0]}}}` +
						'\\end{align*}$$'
				} else if (status === STATUS_INCORRECT) {
					text +=
						`&= \\enclose{updiagonalstrike}[3px solid ${incorrect_color}]{${answers_latex[0]}}` +
						`\\\\&= \\enclose{roundedbox}[3px solid ${correct_color}]{\\textcolor{${correct_color}}{${solutions_latex[0]}}}\\end{align*}$$`
				} else if (
					status === STATUS_BAD_FORM ||
					status === STATUS_UNOPTIMAL_FORM
				) {
					text +=
						`&= \\textcolor{${unoptimal_color}}{${answers_latex[0]}}` +
						`\\\\&= \\enclose{roundedbox}[3px solid ${correct_color}]{\\textcolor{${correct_color}}{${solutions_latex[0]}}}\\end{align*}$$`
				} else {
					text += `=\\enclose{roundedbox}[3px solid ${correct_color}]{\\textcolor{${correct_color}}{${answers_latex[0]}}}\\end{align*}$$`
				}
				lines.push({ text })

				break
			}
			case 'choice':
			case 'choices': {
				// line = '<div class="flex flex-wrap justify-start">'
				let choices: LineChoice[] = []
				item.choices.forEach((choice, i) => {
					const c: LineChoice = {}

					if (solutions.includes(i)) {
						c.solution = true
						if (answers.includes(i)) {
							c.badge = 'correct'
						}
					} else if (answers.includes(i)) {
						c.badge = 'incorrect'
					}

					if (choice.image) {
						c.image = choice.imageBase64
					} else {
						c.text = choice.text
					}
					if (answers.length || c.solution) {
						choices.push(c)
					}
				})

				lines.push({ choices })
				break
			}

			case 'fill in': {
				//TODO : empty ?
				let text
				if (status === STATUS_CORRECT) {
					text =
						'$$' +
						(expression_latex as string).replace(
							/\\ldots/,
							`\\enclose{roundedbox}[2px solid ${correct_color}]{\\textcolor{${correct_color}}{${answers_latex[0]}}}`,
						) +
						'$$'
				} else {
					text =
						'$$' +
						(expression_latex as string).replace(
							/\\ldots/,
							`\\enclose{roundedbox}[2px solid ${correct_color}]{\\textcolor{${correct_color}}{${solutions_latex[0]}}}`,
						) +
						'$$'

					if (status === STATUS_INCORRECT || status === STATUS_BAD_FORM) {
						coms.unshift(
							'Ta réponse : $$' +
								(expression_latex as string).replace(
									/\\ldots/,
									`\\textcolor{${incorrect_color}}{${answers_latex[0]}}`,
								) +
								'$$',
						)
					} else if (status === STATUS_UNOPTIMAL_FORM) {
						coms.unshift(
							'Ta réponse : $$' +
								(expression_latex as string).replace(
									/\\ldots/,
									`\\textcolor{${unoptimal_color}}{${answers_latex[0]}}`,
								) +
								'$$',
						)
					}
				}
				let i = -1
				const putSolutions = () => {
					i++
					return `<with|color|#66bb6a|${math(solutions[i]).texmacs}>`
				}

				const texmacs =
					'<math|' +
					math(expression as string).texmacs.replace(
						/\.\.\.\.\.\./g,
						putSolutions,
					) +
					'>'
				lines.push({ text, texmacs })
			}
		}
	}

	if (item.answers.length) {
		// mode projection
		coms = coms.map((com) =>
			(get(formatLatexToHtml)(com) as string).replace(
				/_COLORANSWER_/g,
				answerColor,
			),
		)
	}
	lines = lines.map((l) => {
		if (l.text) {
			return {
				...l,
				html: get(formatLatexToHtml)(l.text) as string,
			}
		} else if (l.choices) {
			return {
				...l,
				choices: l.choices.map((c) =>
					c.text ? { ...c, html: get(formatLatexToHtml)(c.text) as string } : c,
				),
			}
		} else return l
	})
	item.coms = coms
	item.simpleCorrection = lines
}

export function createDetailedCorrection(item: CorrectedQuestion) {
	const { solutions, correctionDetails } = item

	let lines: Line[] = []
	let line: Line
	let solutions_latex = createSolutionsLatex(item)

	const regexExpression = /&expression/g
	function replaceExpression() {
		return '$$' + item.expression_latex + '$$'
	}

	const regexExpression2 = /&expression2/g
	function replaceExpression2() {
		return '$$' + item.expression2_latex + '$$'
	}

	const regexExp = /&exp/g
	function replaceExp() {
		return item.expression_latex || ''
	}

	const regexExp2 = /&exp/g
	function replaceExp2() {
		return item.expression2_latex || ''
	}

	const regexSolution = /&solution([1-9]?)/g
	function replaceSolution(match: string, p1: number) {
		return (
			`<span style="color:${correct_color}; border:2px solid ${correct_color}; border-radius: 5px; margin:2px;padding:5px;display:inline-block">` +
			(item.type === QUESTION_TYPE_CHOICE || item.type === QUESTION_TYPE_CHOICES
				? (item.choices[solutions[p1 ? p1 - 1 : 0] as number].text as string)
				: '$$' + solutions_latex[p1 ? p1 - 1 : 0] + '$$') +
			'</span>'
		)
	}

	const regexSol = /&sol([1-9]?)/g
	function replaceSol(match: string, p1: number) {
		return isQuestionChoice(item)
			? (item.choices[solutions[p1 ? p1 - 1 : 0] as number].text as string)
			: `\\enclose{roundedbox}[3px solid ${correct_color}]{\\textcolor{${correct_color}}{` +
					solutions_latex[p1 ? p1 - 1 : 0] +
					'}}'
	}

	correctionDetails.forEach((detail) => {
		if (detail.type === 'image') {
			// le base64 de l'image a été préparé lors de la génération de la question
			let img = detail.base64
			line = {
				html: `<img src='${img}' style="max-width:400px;max-height:40vh;" alt='toto'>`,
			}
		} else {
			line = {
				text: detail.text
					// .replace(new RegExp('&exp2', 'g'), '$$$$'+expression2_latex+'$$$$')
					// .replace(new RegExp('&exp', 'g'), '$$$$'+expression_latex+'$$$$')
					.replace(regexExpression2, replaceExpression2)
					.replace(regexExpression, replaceExpression)
					.replace(regexExp2, replaceExp2)
					.replace(regexExp, replaceExp)
					.replace(regexSolution, replaceSolution)
					.replace(regexSol, replaceSol),
			}
		}
		lines.push(line)
	})
	lines = lines.map((l) => ({
		...l,
		html: get(formatLatexToHtml)(l.text!) as string,
	}))

	item.detailedCorrection = lines
	return lines
}
