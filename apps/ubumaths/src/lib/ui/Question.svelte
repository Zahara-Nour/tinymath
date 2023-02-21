<script lang="ts">
	import {
		toMarkup,
		formatLatexToHtml,
		mathfieldElement,
		virtualKeyboardMode,
		prepareMathlive,
	} from '$lib/stores'
	import { afterUpdate, onDestroy, onMount, tick } from 'svelte'
	import {
		getLogger,
		formatToLatex,
		magnify_3xl,
		magnify_xl,
		magnify_2xl,
	} from '$lib/utils'
	import virtualKeyboard from '$lib/mathlive/virtualKeyboard'
	import CorrectionLine from './CorrectionLine.svelte'
	import { assessItem } from '$lib/questions/correction'
	import {
		isQuestionChoices,
		type AnsweredQuestion,
		type Commit,
		type CorrectedQuestion,
		type Line,
	} from '$lib/type'
	import type { MathfieldElement } from 'tinymathlive'

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
	let mfs: MathfieldElement[] = []
	let nmfs = 0
	let answers: (number | string)[]
	let answers_latex: string[]
	let answerField: string | undefined
	let keyListeners: ((ev: KeyboardEvent) => void)[] = []
	let inputListeners: ((ev: Event) => void)[] = []
	let changeListeners: ((ev: Event) => void)[] = []
	let fieldsNb = 0
	let coms: string[] = []

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

	onMount(insertMathFields)
	afterUpdate(insertMathFields)
	onDestroy(() => {
		blurMathfields()
		removeListeners()
	})

	$: initQuestion(question)

	$: if (question && !correction && interactive) {
		prepareInteractive()
	} else {
		stopInteractive()
	}

	$: setFocus($virtualKeyboardMode)

	// les corrections doivent être produites à l'initialisation
	// et à chaque fois que l'utilisatur modifie ses réponses (qcm ou chams-réponses)
	// il faut vérifier que l'update d'answers est bien triggé
	$: makeCorrection(answers)

	function setFocus(virtualKeyboard: boolean) {
		if (virtualKeyboard && mfs && mfs.length) {
			mfs[0].focus()
		}
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

	function recordAnswer(i: number) {
		answers_latex[i] = mfs[i]
			.getValue()
			// on remplace plusieurs espaces par un seul, bizarrz normalement pas besoin
			.replace(/(\\,){2,}/g, '\\,')
			.trim()
		answers[i] = mfs[i]
			.getValue('ascii-math')
			// .replace(/xx/g, '*')
			.replace(/÷/g, ':')
			.replace(/\((\d+(,\d+)*)\)\//g, (_, p1) => p1 + '/')
			.replace(/\(([a-z])\)\//g, (_, p1) => p1 + '/')
			.replace(/\/\((\d+(,\d+)*)\)/g, (_, p1) => '/' + p1)
			.replace(/\/\(([a-z])\)/g, (_, p1) => '/' + p1)
			.trim()
	}

	function blurMathfields() {
		// on enlève le focus des mathfields . Bug ?
		if (mfs.length) {
			mfs.forEach((mf) => {
				if (mf.hasFocus() && mf.blur) {
					mf.blur()
				}
			})
		}
	}

	function removeListeners() {
		// listeners
		keyListeners.forEach((listener, i) =>
			mfs[i].removeEventListener('keyup', listener),
		)
		inputListeners.forEach((listener, i) =>
			mfs[i].removeEventListener('input', listener),
		)
		changeListeners.forEach((listener, i) =>
			mfs[i].removeEventListener('change', listener),
		)
		keyListeners = []
		inputListeners = []
		changeListeners = []
	}

	// onChange est appelée quand :
	// - l'utilisateur appuie sur entrée du clavier virtuel ou du clavier physique
	//  (même si le mathfield est vide)
	// - quand le mathfield perd le focus et que le contenu a changé
	function onChange(ev: Event, i: number) {
		if (mfs[i].hasFocus()) {
			// TODO: empêcher le commit quand le mathfield est vide
			// la touche entrée a été appuyée et il n'y a qu'un seul mathfield, on commit
			if (mfs.length === 1 && immediateCommit) {
				// removeListeners ????
				blurMathfields()
				removeListeners()
				commit.exec()
			} else {
				// mfs[(i + 1) % mfs.length].focus()
			}
		}
	}

	function onInput(ev: Event, i: number) {
		recordAnswer(i)
	}

	// keystroke on physical keyboard
	function onKeystroke(ev: KeyboardEvent, i: number) {
		const mf = mfs[i]
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
			mfs[i].insert('2\\,3')
		} else if (key === '%') {
			ev.preventDefault()
			mf.insert('\\%')
		} else if (key === 'r') {
			ev.preventDefault()
			mf.insert('\\sqrt')
		} else if (key === '*') {
			ev.preventDefault()
			mf.insert('\\times ')
		} else if (key === ':') {
			ev.preventDefault()
			mf.insert('\\div ')
			// }
		} else if (
			!key_allowed.includes(key) &&
			!key_allowed2.includes(key) &&
			!keystroke_allowed.includes(keystroke)
		) {
			ev.preventDefault()
		}
	}

	function addMathfield() {
		let id = `mf-${question.num}-${nmfs}`
		if (masked) id = id + '-masked'
		nmfs++
		return `<span id='${id}'}/>`
	}

	function manageFocus(ev: FocusEvent) {
		mfs.forEach((mfe) => {
			mfe.virtualKeyboardState =
				mfe.hasFocus() && $virtualKeyboardMode ? 'visible' : 'hidden'
		})
	}

	// initialisation d'une nouvelle question
	function initQuestion(question: AnsweredQuestion) {
		// on enlève les listeners de la question précédente
		blurMathfields()
		removeListeners()

		// mathfields
		mfs = []
		nmfs = 0

		simpleCorrection = []
		detailedCorrection = []

		answers = []
		answers_latex = []

		enounce = question.enounce
			? ($formatLatexToHtml(formatToLatex(question.enounce)) as string)
			: ''

		enounce2 = question.enounce2
			? ($formatLatexToHtml(formatToLatex(question.enounce2)) as string)
			: ''
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
		mfs = []
		nmfs = 0

		expression = question.expression_latex
		expression2 = question.expression2_latex

		// pour ajouter un champs réponse dans l'expression à calculer
		if (expression && question.type === 'result' && !question.answerField) {
			expression += '=\\ldots'
		}

		answerField = question.answerField
		// cas des question où il n'y a que l'énoncé et pas de champs réponse particulier
		// ... est transformé en \\ldots qui sera markupé par mathlive
		//  et le markup sera remplacé par un mathfield
		if (
			!answerField &&
			!expression &&
			question.type !== 'choice' &&
			question.type !== 'choices'
		) {
			answerField = '$$...$$'
		}

		if (answerField) {
			answerField = (
				$formatLatexToHtml(answerField.replace(/\.\.\./g, '\\ldots')) as string
			).replace(/…/g, addMathfield)
		}

		if (expression) {
			expression = $toMarkup(expression)
			if (question.type !== 'choice' && question.type !== 'choices') {
				expression = expression.replace(/…/g, addMathfield)
			}
		}

		if (expression2) {
			expression2 = $toMarkup(expression2)
		}

		// TODO : et avec un champs de plusieurs réponses ?
		if (!answers.length) {
			answers = ['']
			answers_latex = ['']
		}
	}

	function stopInteractive() {
		blurMathfields()
		removeListeners()
		mfs = []

		// on réinitialise pour se débarasser des mathfields
		expression = question.expression_latex
		expression2 = question.expression2_latex
		answerField = question.answerField

		if (answerField) {
			answerField = $formatLatexToHtml(
				answerField.replace(/\.\.\./g, '\\; \\ldots \\;'),
			) as string
		}

		if (expression) {
			expression = $toMarkup(expression)
		}

		if (expression2) {
			expression2 = $toMarkup(expression2)
		}

		// pourquoi ? à cause du focus des mathfields ?
	}

	function insertMathFields() {
		const elements: HTMLElement[] = []

		if (answerField) {
			const DOMElements =
				document
					.querySelector(
						`#answerField-${question.num}${masked ? '-masked' : ''}`,
					)
					?.querySelectorAll('*') || []
			for (let i of DOMElements) {
				if (/^mf/g.test(i.id)) {
					elements.push(i as HTMLElement)
				}
			}
		} else if (expression) {
			const expressionElements =
				document
					.querySelector(
						`#expression-${question.num}${masked ? '-masked' : ''}`,
					)
					?.querySelectorAll('*') || []
			if (expressionElements) {
				for (let i of expressionElements) {
					if (/^mf/g.test(i.id)) {
						elements.push(i as HTMLElement)
					}
				}
			}
			if (expression2) {
				const expression2Elements =
					document
						.querySelector(
							`#expression2-${question.num}${masked ? '-masked' : ''}`,
						)
						?.querySelectorAll('*') || []

				for (let i of expression2Elements) {
					if (/^mf/g.test(i.id)) {
						elements.push(i as HTMLElement)
					}
				}
			}
		}

		let added = false
		elements.forEach((elt, i) => {
			if (!elt.hasChildNodes()) {
				const mfe = new $mathfieldElement!()
				mfe.setOptions({
					soundsDirectory: '/sounds',
					// virtualKeyboardMode: 'onfocus',
					virtualKeyboardMode: 'off',
					// virtualKeyboardMode: 'manual',
					decimalSeparator: ',',
					...virtualKeyboard,
					inlineShortcuts: {
						xx: '',
					},
					keypressSound: null,
					keypressVibration: false,
					removeExtraneousParentheses: false,
					smartFence: false,
					// superscript: false,
					mathModeSpace: '\\,',
				})

				mfs.push(mfe)
				// answers.push('')
				// answers_latex.push('')
				elt.appendChild(mfe)
				elt.style.display = 'inline-block'
				elt.style.minWidth = '2em'
				mfe.style.overflow = 'unset'
				mfe.style.paddingLeft = '2px'
				mfe.style.paddingRight = '2px'
				elt.style.border = '2px dashed grey'
				elt.style.borderRadius = '5px'
				// const i = mfs.length - 1
				if (!masked) {
					const keyListener = (ev: KeyboardEvent) => onKeystroke(ev, i)
					const inputListener = (ev: Event) => onInput(ev, i)
					const changeListener = (ev: Event) => onChange(ev, i)
					keyListeners.push(keyListener)
					inputListeners.push(inputListener)
					changeListeners.push(changeListener)
					mfe.addEventListener('keypress', keyListener)
					mfe.addEventListener('input', inputListener)
					mfe.addEventListener('change', changeListener)
					mfe.addEventListener('focus', manageFocus)
					mfe.addEventListener('blur', manageFocus)
				}
				added = true
			}
		})

		mfs.forEach((mfe, i) => {
			if (answers_latex[i]) {
				// mfe.value = answers_latex[i]
				mfe.setValue(answers_latex[i], { selectionMode: 'after', focus: true })
			}
		})
		if (added && !masked) {
			// if (!mfs[0].hasFocus()) {
			mfs[0].focus()
			// }
		}

		fieldsNb = mfs.length || 0
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
		{:else if element === 'expression' && expression && (!correction || question.answerField || (question.type !== 'result' && question.type !== 'fill in'))}
			<div
				id="expressions"
				class=" flex flex-col items-center justify-center "
				style={`font-size:${magnify_2xl};`}
			>
				<div
					id={`expression-${question.num}${masked ? '-masked' : ''}`}
					class={correction ? 'my-1' : 'my-3'}
					style="display:flex; align-items: baseline;max-width:100%"
				>
					{@html expression}
				</div>
				{#if expression2 && !(!interactive && question.type === 'equation')}
					<div
						id={`expression2-${question.num}${masked ? '-masked' : ''}`}
						class={correction ? 'my-1' : 'my-3'}
					>
						{@html expression2}
					</div>
				{/if}
			</div>
		{:else if !correction && element === 'choices' && question.choices}
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
	{#if (!correction && question.answerField && question.type === 'fill in') || (!correction && answerField && question.answerField !== '$$...$$')}
		<div
			id={`answerField-${question.num}${masked ? '-masked' : ''}`}
			class="my-3 flex flex-col items-center justify-center"
			style={`font-size:${magnify_2xl};`}
		>
			<div
				id={`answerField-${question.num}${masked ? '-masked' : ''}`}
				class="my-3"
			>
				{@html answerField}
			</div>
		</div>
	{/if}
	{#if !correction && interactive && (question.type === 'choices' || fieldsNb > 1) && immediateCommit}
		<button
			on:click={() => {
				commit.exec()
			}}
			class="mt-3 p-1 variant-filled-primary">Valider 2</button
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
