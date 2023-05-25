<script lang="ts">
	import { toMarkup, formatLatexToHtml, prepareMathlive } from '$lib/stores'
	import { afterUpdate, onDestroy, onMount, tick } from 'svelte'
	import { getLogger, formatToLatex, magnify_2xl } from '$lib/utils'
	import virtualKeyboard from '$lib/mathlive/virtualKeyboard'
	import CorrectionLine from './CorrectionLine.svelte'
	import { assessItem } from '$lib/questions/correction'
	import {
		isQuestionChoices,
		type AnsweredQuestion,
		type Commit,
		type CorrectedQuestion,
		type Line,
		isQuestionChoice,
	} from '../../types/type'
	import type { MathfieldElement } from 'tinymathlive'
	import { start } from 'xstate/lib/actions'
	import math from 'tinycas'

	export let question: AnsweredQuestion
	export let interactive = false
	export let masked = false
	export let correction = false
	export let simpleCorrection: Line[] = []
	export let detailedCorrection: Line[] = []
	export let commit: Commit
	export let immediateCommit = false

	let { fail, trace, info } = getLogger('correction', 'trace')

	let enounce: string | undefined
	let enounce2: string | undefined
	let expression: string | undefined
	let expression2: string | undefined
	let answerFields: string | undefined
	let answers: (number | string)[]
	let answers_latex: string[]
	let coms: string[] = []

	let mathField: MathfieldElement
	let field: string | null = null
	let nfields = 0
	let initialized = false
	// si le commit a été passé par la série de questions
	prepareMathlive()

	// si l'objet commit a été passé en prop
	if (commit) {
		commit.hook = commitAnswers
	} else {
		commit = {
			exec: commitAnswers,
		}
	}

	onMount(initMathField)
	afterUpdate(initMathField)
	onDestroy(removeListeners)

	$: initQuestion(question)

	$: manageInteractive(interactive)

	$: manageCorrection(correction)

	// $: setFocus($virtualKeyboardMode)

	// les corrections doivent être produites à l'initialisation
	// et à chaque fois que l'utilisatur modifie ses réponses (qcm ou chams-réponses)
	// il faut vérifier que l'update d'answers est bien triggé
	$: makeCorrection(answers)

	function manageCorrection(correction: boolean) {
		if (!correction && interactive) {
			prepareInteractive()
		} else if (correction && interactive) {
			stopInteractive()
		}
	}

	function manageInteractive(interactive: boolean) {
		if (!correction && interactive) {
			prepareInteractive()
		} else {
			stopInteractive()
		}
	}
	function isQuestionWithJustAnEnounce() {
		return !question.expression && !question.answerField
	}

	// l'utilisateur à choisi une réponse
	function onChoice(i: number) {
		if (interactive) {
			if (isQuestionChoices(question)) {
				if (answers.includes(i)) {
					answers = answers.filter((a) => a != i)
				} else {
					answers = [...answers, i]
				}
			} else {
				answers = answers[0] === i ? [] : [i]
				if (immediateCommit) commit.exec()
			}
		}
	}

	function recordAnswers() {
		mathField.getPrompts().forEach((prompt) => {
			answers_latex[parseInt(prompt, 10)] = mathField
				.getPromptValue(prompt)
				// on remplace plusieurs espaces par un seul, bizarrz normalement pas besoin
				.replace(/(\\,){2,}/g, '\\,')
				.trim()
			answers[parseInt(prompt, 10)] = mathField
				.getPromptValue(prompt, 'ascii-math')
				// .replace(/xx/g, '*')
				.replace(/÷/g, ':')
				.replace(/\((\d+(,\d+)*)\)\//g, (_, p1) => p1 + '/')
				.replace(/\(([a-z])\)\//g, (_, p1) => p1 + '/')
				.replace(/\/\((\d+(,\d+)*)\)/g, (_, p1) => '/' + p1)
				.replace(/\/\(([a-z])\)/g, (_, p1) => '/' + p1)
				.trim()
		})
	}

	function removeListeners() {
		if (mathField) {
			mathField.removeEventListener('change', onChange)
			mathField.removeEventListener('keyup', onKeystroke)
			mathField.removeEventListener('input', onInput)
		}
	}

	// onChange est appelée quand :
	// - l'utilisateur appuie sur entrée du clavier virtuel ou du clavier physique
	//  (même si le mathfield est vide)
	// - quand le mathfield perd le focus et que le contenu a changé
	function onChange(ev: Event) {
		if (mathField.hasFocus()) {
			// TODO: empêcher le commit quand le mathfield est vide
			// la touche entrée a été appuyée et il n'y a qu'un seul mathfield, on commit
			if (nfields === 1 && immediateCommit) {
				// removeListeners ????

				removeListeners()
				commit.exec()
			} else {
				// mfs[(i + 1) % mfs.length].focus()
			}
		}
	}

	function onInput(ev: Event) {
		recordAnswers()
		console.log('mf', mathField.getValue())
	}

	// keystroke on physical keyboard
	function onKeystroke(ev: KeyboardEvent) {
		const key_allowed = 'azertyuiopsdfghjklmwxcvbn0123456789,.=<>/*-+()^%€L'
		const key_allowed2 = [
			'Backspace',
			'ArrowLeft',
			'ArrowRight',
			'ArrowDown',
			'ArrowUp',
		]
		const keystroke_allowed = ['Enter', 'NumpadEnter']

		const keystroke = ev.code
		const key = ev.key
		if (
			keystroke === 'Space'
			//  &&
			// !(
			// 	answers_latex[i] &&
			// 	answers_latex[i].length >= 2 &&
			// 	answers_latex[i].slice(answers_latex[i].length - 2) === '\\,'
			// )
		) {
			// console.log('prevent space')
			// ev.preventDefault()
			mathField.insert('2\\,3')
		} else if (key === '%') {
			ev.preventDefault()
			mathField.insert('\\%')
		} else if (key === 'r') {
			ev.preventDefault()
			mathField.insert('\\sqrt')
		} else if (key === '*') {
			ev.preventDefault()
			mathField.insert('\\times ')
		} else if (key === ':') {
			ev.preventDefault()
			mathField.insert('\\div ')
			// }
		} else if (
			!key_allowed.includes(key) &&
			!key_allowed2.includes(key) &&
			!keystroke_allowed.includes(keystroke)
		) {
			ev.preventDefault()
		}
	}

	function addPlaceholder() {
		return `\\placeholder[${nfields++}]{}`
	}

	function manageFocus(ev: FocusEvent) {
		// mathField.virtualKeyboardState =
		// 	mathField.hasFocus() && $virtualKeyboardMode ? 'visible' : 'hidden'
		// console.log('focus event', ev)
	}

	// initialisation d'une nouvelle question
	function initQuestion(question: AnsweredQuestion) {
		if (interactive) stopInteractive()

		enounce = question.enounce
			? ($formatLatexToHtml(formatToLatex(question.enounce)) as string)
			: ''

		enounce2 = question.enounce2
			? ($formatLatexToHtml(formatToLatex(question.enounce2)) as string)
			: ''

		expression = question.expression_latex || ''
		expression2 = question.expression2_latex || ''
		simpleCorrection = []
		detailedCorrection = []

		answers = []
		answers_latex = []

		if (!correction && interactive) prepareInteractive()
	}

	function makeCorrection(answers: (number | string)[]) {
		// on fait un alias de la question pour être sur de ne pas trigger un update local
		const q = question
		if (interactive) {
			q.answers = answers
			q.answers_latex = answers_latex
		}
		const corrected = assessItem(q)
		coms = corrected.coms
		simpleCorrection = corrected.simpleCorrection
		detailedCorrection = corrected.detailedCorrection
	}

	function commitAnswers() {
		// pour prévenir un update de question
		const q = question
		q.answers = answers
		q.answers_latex = answers_latex
		assessItem(q)
	}

	function prepareInteractive() {
		nfields = 0

		field = question.answerField
			? question.answerField.replace(/\.\.\./g, addPlaceholder)
			: expression && expression.includes('\\ldots')
			? expression.replace(/\\ldots/g, addPlaceholder)
			: expression && !isQuestionChoice(question)
			? expression + '=' + addPlaceholder()
			: !isQuestionChoice(question)
			? addPlaceholder()
			: null
		console.log('field', field)

		// TODO : et avec un champs de plusieurs réponses ?
		if (!answers.length) {
			answers = ['']
			answers_latex = ['']
		}
		initialized = false
	}

	function stopInteractive() {
		removeListeners()
		field = null
	}

	function initMathField() {
		if (!masked && mathField && !initialized) {
			mathField.addEventListener('keypress', onKeystroke)
			mathField.addEventListener('input', onInput)
			mathField.addEventListener('change', onChange)
			mathField.addEventListener('focus', manageFocus)
			mathField.addEventListener('blur', manageFocus)
			mathField.setValue(field!)
			mathField.getPrompts().forEach((prompt) => {
				mathField.setPromptContent(
					prompt,
					answers_latex[parseInt(prompt, 10)] || '',
					{ selectionMode: 'after', focus: true },
				)
			})

			initialized = true
		}
		if (!masked && mathField && !mathField.hasFocus()) mathField.focus()
	}

	function shouldDisplayExpression(correction: boolean, interactive: boolean) {
		const test1 = !correction && !interactive
		const test2 =
			correction &&
			// l'expression n'a pas été remplacée par un mathfield
			!(
				// l'expression est remplaçable
				(
					question.expression?.includes('?') ||
					(!question.answerField && !isQuestionChoice(question))
				)
			)

		const test3 =
			!correction &&
			interactive &&
			// l'expression n'a pas été remplacée par un mathfield
			!(
				// l'expression est remplaçable
				(
					question.expression?.includes('?') ||
					(!question.answerField && !isQuestionChoice(question))
				)
			)
		const result = !!expression && (test1 || test2 || test3)
		console.log('shouldDisplayExpression', test1, test2, test3, result)

		return result
	}
</script>

<div class={`flex flex-col items-center justify-around ${$$props.class}`}>
	{#each question.order_elements as element}
		{#if element === 'enounce' && enounce}
			<div
				id="enounce"
				class={(correction ? 'text-base text-tertiary-500' : '') +
					' text-center max-w-4xl leading-normal'}
			>
				{@html enounce}
			</div>
		{:else if element === 'enounce2' && enounce2}
			<div
				id="enounce2"
				class={(correction ? 'text-base text-tertiary-500' : '') +
					' text-center max-w-4xl leading-normal'}
			>
				{@html enounce2}
			</div>
		{:else if element === 'enounce-image' && question.image}
			{#if correction && question.imageCorrection}
				{#await question.imageCorrectionBase64P}
					loading image
				{:then base64}
					<div style="display:inline-block;background-color:white;">
						<img
							src={base64}
							class="my-3 w-full max-w-lg"
							style="max-height:40vh; object-fit: contain;"
							alt="Alright Buddy!"
						/>
					</div>
				{:catch error}
					{error}
				{/await}
			{:else}
				{#await question.imageBase64P}
					loading image
				{:then base64}
					<div style="display:inline-block;background-color:white;">
						<img
							src={base64}
							class="my-3 w-full max-w-lg"
							style="max-height:40vh; object-fit: contain;"
							alt="Alright Buddy!"
						/>
					</div>
				{:catch error}
					{error}
				{/await}
			{/if}
		{:else if element === 'expression' && shouldDisplayExpression(correction, interactive)}
			<div
				id="expressions"
				class=" flex flex-col items-center justify-center"
				style={`font-size:${magnify_2xl};`}
			>
				<div
					id={`expression-${question.num}${masked ? '-masked' : ''}`}
					class={correction ? 'my-1' : 'my-3'}
					style="display:flex; align-items: baseline;max-width:100%"
				>
					{@html $toMarkup(expression)}
				</div>
				<!-- {#if expression2 && !(!interactive && question.type === 'equation')}
					<div
						id={`expression2-${question.num}${masked ? '-masked' : ''}`}
						class={correction ? 'my-1' : 'my-3'}
					>
						{@html expression2}
					</div>
				{/if} -->
			</div>
		{:else if !correction && element === 'choices' && isQuestionChoice(question)}
			<div
				class="mt-3 flex flex-wrap justify-around"
				style={`font-size:${magnify_2xl};`}
			>
				{#each question.choices as choice, i}
					<button
						class={'rounded-lg  m-2 p-2 border-4 ' +
							(interactive && answers.includes(i)
								? 'border-primary-500'
								: 'border-tertiary-500')}
						style={'min-width:2em'}
						on:click={() => onChoice(i)}
					>
						{#if choice.image}
							{#await choice.imageBase64P}
								loading image
							{:then base64}
								<img
									class="white"
									src={base64}
									style="max-width:min(400px,80%);max-height:40vh;"
									alt={`choice ${i}`}
								/>
							{:catch error}
								{error}
							{/await}
						{/if}
						{#if choice.text}
							<div>
								{@html $formatLatexToHtml(formatToLatex(choice.text))}
							</div>
						{/if}
					</button>
				{/each}
			</div>
		{/if}
	{/each}
	{#if !correction && field !== null}
		<math-field readOnly={!!field} bind:this={mathField} />
	{/if}
	{#if !correction && interactive && (isQuestionChoices(question) || nfields > 1) && immediateCommit}
		<button
			on:click={() => {
				commit.exec()
			}}
			class="mt-3 p-1 variant-filled-primary">Valider</button
		>
	{/if}

	{#if correction}
		<div class="mt-3" style={`font-size:${magnify_2xl};`}>
			{#each simpleCorrection as line}
				<div
					class=" my-1 z-0 relative"
					style={`word-break: break-word ;white-space: normal;`}
				>
					<CorrectionLine {line} />
				</div>
			{/each}
		</div>

		{#if coms && interactive}
			<div>
				{#each coms as com}
					{@html com}
				{/each}
			</div>
		{/if}
	{/if}
</div>

<style>
	math-field {
		min-width: 2em;
		color: black;
		background: white;
		font-size: 32px;
		/* margin: 3em; */
		padding: 4px;
		border-radius: 4px;
		/* border: 1px solid rgba(0, 0, 0, 0.3); */
		/* box-shadow: 0 0 8px rgba(0, 0, 0, 0.2); */
		--caret-color: red;
		--selection-background-color: lightgoldenrodyellow;
		--selection-color: darkblue;
		--contains-highlight-backround-color: green;
		--placeholder-color: violet;
	}
	math-field:focus-within {
		/* outline: 4px solid #d7170b; */
		outline: none;
		border-radius: 4px;
		/* background: rgba(251, 187, 182, 0.1); */
	}
</style>
