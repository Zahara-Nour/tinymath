import {
	STATUS_BAD_FORM,
	STATUS_CORRECT,
	STATUS_INCORRECT,
	STATUS_UNOPTIMAL_FORM,
	STATUS_EMPTY,
	STATUS_BAD_UNIT,
} from './correction'
import {
	mdc_colors,
	correct_color,
	incorrect_color,
	unoptimal_color,
} from '$lib/colors'
import { toMarkup, formatToHtml } from '$lib/stores'
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
import { QUESTION_TYPE_CHOICE, QUESTION_TYPE_RESULT } from './questions'

function createSolutionsLatex(item: CorrectedQuestion) {
	return item.solutions.length
		? item.solutions.map((solution) => {
				if (item.type === QUESTION_TYPE_CHOICE) {
					return item.choices[solution as number]
				} else {
					// console.log('solution', solution)
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

	const lines: Line[] = []
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

	const regexExp = /&exp/g
	function replaceExp() {
		return item.expression_latex || ''
	}

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
				: get(toMarkup)('$$' + answers_latex[p1 ? p1 - 1 : 0] + '$$')) +
			'</span>'
		)
	}

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
		return item.type === 'choice'
			? (item.choices[solutions[p1 ? p1 - 1 : 0] as number].text as string)
			: `$\\textcolor{green}{` + solutions_latex[p1 ? p1 - 1 : 0] + '}$'
	}

	const regexSol = /&sol([1-9]?)/g
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
			let html
			correctionFormat.correct.forEach((format) => {
				if (format === 'image') {
					let img = choices[solutions[0] as number].imageBase64
					html = `<img src='${img}' style="max-width:400px;max-height:40vh;" alt='toto'>`
				} else {
					html = (formatToLatex(format) as string)
						.replace(regexExpression2, replaceExpression2)
						.replace(regexExpression, replaceExpression)
						.replace(regexExp2, replaceExp2)
						.replace(regexExp, replaceExp)
						.replace(regexAnswer, replaceAnswerCorrect)
						.replace(regexAns, replaceAnsCorrect)
				}

				lines.push({ html: get(formatToHtml)(formatToLatex(html)) as string })
			})
		} else {
			;(correctionFormat.uncorrect as string[]).forEach((format) => {
				let html
				let texmacs
				if (format === 'image') {
					let img = choices[solutions[0] as number].imageBase64
					html = `<img style="max-width:400px;max-height:40vh;" src='${img}' alt='toto'>`
				} else {
					html = (formatToLatex(format) as string)
						.replace(regexExpression2, replaceExpression2)
						.replace(regexExpression, replaceExpression)
						.replace(regexExp2, replaceExp2)
						.replace(regexExp, replaceExp)
						.replace(regexSolution, replaceSolution)
						.replace(regexSol, replaceSol)
					texmacs = (formatToTexmacs(format) as string)
						.replace(regexExpression2, replaceExpression2)
						.replace(regexExpression, replaceExpression)
						.replace(regexExp2, replaceExp2)
						.replace(regexExp, replaceExp)
						.replace(regexSolution, replaceSolutionTexmacs)
						.replace(regexSol, replaceSolTexmacs)
				}

				lines.push({ html: get(formatToHtml)(html) as string, texmacs })
			})

			// le commentaire avec la réponse de l'utilisateur

			if (status !== STATUS_EMPTY && item.answers.length) {
				if (correctionFormat.answer === 'image') {
					// TODO: A revoir
					let img = choices[answers[0] as number].imageBase64
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
				let html

				// if (status === STATUS_CORRECT) {
				// 	html =
				// 		`$$${expression_latex}=$$` +
				// 		`<span style="color:${correct_color}; border:2px solid ${correct_color}; border-radius: 5px;  margin:2px; padding:5px;display:inline-block">` +
				// 		'$$' +
				// 		answers_latex[0] +
				// 		'$$' +
				// 		'</span>'
				// } else if (status === STATUS_EMPTY) {
				// 	html =
				// 		`$$${expression_latex}=$$` +
				// 		`<span style="color:${correct_color}; border:2px solid ${correct_color}; border-radius: 5px;  margin:2px; padding:5px;display:inline-block">` +
				// 		'$$' +
				// 		solutions_latex[0] +
				// 		'$$' +
				// 		'</span>'
				// } else {
				html = `$$\\begin{align*}  ${expression_latex}`
				if (status === STATUS_INCORRECT) {
					html += `&= \\enclose{updiagonalstrike}[3px solid ${incorrect_color}]{${answers_latex[0]}} \\\\`
				} else if (status === STATUS_BAD_FORM || status === STATUS_BAD_UNIT) {
					html += `&= \\textcolor{${incorrect_color}}{${answers_latex[0]}} \\\\`
				} else if (status === STATUS_UNOPTIMAL_FORM) {
					html += `&= \\textcolor{${unoptimal_color}}{${answers_latex[0]}} \\\\`
				}
				if (status === STATUS_CORRECT) {
					html += `&=\\enclose{roundedbox}[2px solid ${correct_color}, padding='2']{\\textcolor{${correct_color}}{${answers_latex[0]}}}`
				} else {
					html += `&=\\enclose{roundedbox}[2px solid ${correct_color}, padding='2']{\\textcolor{${correct_color}}{${solutions_latex[0]}}}`
				}
				html += '\\end{align*}$$'
				// }
				const texmacs =
					'<math|' +
					math(expression as string).texmacs +
					`=<with|color|#66bb6a|${math(solutions[0]).texmacs}>>`

				lines.push({
					html: get(formatToHtml)(formatToLatex(html)) as string,
					texmacs,
				})

				break
			}

			case 'equation': {
				// let exp = '$$\\begin{align*}x & =5-3 \\\\  & =2\\end{align*}$$'
				let html
				html = `$$\\begin{align*}  x`
				if (status === STATUS_EMPTY) {
					html +=
						`=\\enclose{roundedbox}[3px solid ${correct_color}]{\\textcolor{${correct_color}}{${solutions_latex[0]}}}` +
						'\\end{align*}$$'
				} else if (status === STATUS_INCORRECT) {
					html +=
						`&= \\enclose{updiagonalstrike}[6px solid rgba(205, 0, 11, .4)]{\\textcolor{${incorrect_color}}{${answers_latex[0]}}}` +
						`\\\\&= \\enclose{roundedbox}[3px solid ${correct_color}]{\\textcolor{${correct_color}}{${solutions_latex[0]}}}\\end{align*}$$`
				} else if (
					status === STATUS_BAD_FORM ||
					status === STATUS_UNOPTIMAL_FORM
				) {
					html +=
						`&= \\textcolor{${unoptimal_color}}{${answers_latex[0]}}` +
						`\\\\&= \\enclose{roundedbox}[3px solid ${correct_color}]{\\textcolor{${correct_color}}{${solutions_latex[0]}}}\\end{align*}$$`
				} else {
					html += `=\\enclose{roundedbox}[3px solid ${correct_color}]{\\textcolor{${correct_color}}{${answers_latex[0]}}}\\end{align*}$$`
				}
				lines.push({ html: get(formatToHtml)(html) as string })

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
						c.image = choice.base64
					} else {
						c.text = choice.text
						c.html = get(formatToHtml)(
							formatToLatex(choice.text as string),
						) as string
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
				let html
				if (status === STATUS_CORRECT) {
					html =
						'$$' +
						(expression_latex as string).replace(
							/\\ldots/,
							`\\enclose{roundedbox}[2px solid ${correct_color}]{\\textcolor{${correct_color}}{${answers_latex[0]}}}`,
						) +
						'$$'
				} else {
					html =
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
				expression
				const texmacs =
					'<math|' +
					math(expression as string).texmacs.replace(
						/\.\.\.\.\.\./g,
						putSolutions,
					) +
					'>'
				lines.push({ html: get(formatToHtml)(html) as string, texmacs })
			}
		}
	}

	if (item.answers.length) {
		coms = coms.map((com) =>
			(get(formatToHtml)(com) as string).replace(/_COLORANSWER_/g, answerColor),
		)
	}
	item.coms = coms
	item.simpleCorrection = lines
}

export function createDetailedCorrection(item: CorrectedQuestion) {
	const { solutions, correctionDetails } = item

	let lines: Line[] = []
	let line
	let solutions_latex = createSolutionsLatex(item)

	const regexExpression = /&expression/g
	function replaceExpression() {
		return get(toMarkup)('$$' + item.expression_latex + '$$')
	}

	const regexExpression2 = /&expression2/g
	function replaceExpression2() {
		return get(toMarkup)('$$' + item.expression2_latex + '$$')
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
			(item.type === QUESTION_TYPE_CHOICE
				? get(formatToHtml)(
						item.choices[solutions[p1 ? p1 - 1 : 0] as number].text as string,
				  )
				: get(toMarkup)(solutions_latex[p1 ? p1 - 1 : 0] as string)) +
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
			line = `<img src='${img}' style="max-width:400px;max-height:40vh;" alt='toto'>`
		} else {
			line = detail.text
				// .replace(new RegExp('&exp2', 'g'), '$$$$'+expression2_latex+'$$$$')
				// .replace(new RegExp('&exp', 'g'), '$$$$'+expression_latex+'$$$$')
				.replace(regexExpression2, replaceExpression2)
				.replace(regexExpression, replaceExpression)
				.replace(regexExp2, replaceExp2)
				.replace(regexExp, replaceExp)
				.replace(regexSolution, replaceSolution)
				.replace(regexSol, replaceSol)
				.replace(
					'&solution',
					() =>
						`<span style="color:${correct_color}; border:2px solid ${correct_color}; border-radius: 5px;  margin:2px; padding:5px;display:inline-block">` +
						(item.type === 'choice'
							? get(formatToHtml)(
									item.choices[solutions[0] as number].text as string,
							  )
							: get(toMarkup)(solutions_latex[0] as string)) +
						'</span>',
				)
				.replace(
					new RegExp('&sol', 'g'),
					item.type === QUESTION_TYPE_CHOICE
						? (item.choices[solutions[0] as number].text as string)
						: `\\enclose{roundedbox}[3px solid ${correct_color}]{\\textcolor{${correct_color}}{` +
								solutions_latex[0] +
								'}}',
				)
		}
		lines.push(line)
	})
	lines = lines.map((l) => get(formatToHtml)(l) as string)
	return lines
}
