<script lang="ts">
	import generate, {
		generateQuestionsFromBasket,
	} from '$lib/questions/generateQuestion'
	import { afterUpdate, onDestroy, onMount, setContext } from 'svelte'
	import questions, {
		questions_ids,
		getQuestion,
	} from '$lib/questions/questions.js'
	import { convertToTime, getLogger, shuffle } from '$lib/utils'
	import { createTimer } from '$lib/timer'
	import { page } from '$app/stores'
	import { virtualKeyboardMode, touchDevice, mathliveReady } from '$lib/stores'
	import { fly } from 'svelte/transition'

	import Correction from './Correction.svelte'
	import type {
		AnsweredQuestion,
		Basket,
		Commit,
		Time,
		Timer,
	} from '../../../../types/type'
	import Spinner from '$lib/ui/Spinner.svelte'
	import QuestionCard from '$lib/ui/QuestionCard.svelte'
	import CircularProgress from '$lib/ui/CircularProgress.svelte'
	import {
		assessItem,
		prepareAnsweredQuestion,
	} from '$lib/questions/correction'
	import IconRocket from '$lib/icones/IconRocket.svelte'
	import IconRestart from '$lib/icones/IconRestart.svelte'
	import IconKeyboard from '$lib/icones/IconKeyboard.svelte'
	import IconHome from '$lib/icones/IconHome.svelte'
	import { toastStore } from '@skeletonlabs/skeleton'

	export let data

	let { info, fail, trace } = getLogger('Assessment', 'trace')
	let current: number
	let delay: number
	let elapsed: number
	let start: number
	let percentage: number
	let timer: Timer
	let finish = false
	let subdomain: string
	let domain: string
	let theme: string
	let level: number
	// let choices
	let correct = false
	let restart = false
	let classroom = false
	let flash = false
	let courseAuxNombres = false
	let pause = false
	let previous: number
	let showExemple = false
	let showCorrection = false
	let alert = false
	let cards: AnsweredQuestion[]
	let card: AnsweredQuestion
	let generatedExemple: AnsweredQuestion
	let basket: Basket
	let go = false
	let assignmentId: number
	let training = true

	const testParams: TestParams = {}
	const commit: Commit = {
		exec: function () {
			if (this.hook) {
				this.hook()
			}
			if (!courseAuxNombres) {
				change()
			}
		},
	}
	let commits: Commit[] = []
	let remaining: Time

	let query: string

	type TestParams = {
		courseAuxNombres?: boolean
		flash?: boolean
		classroom?: boolean
	}

	const magnifyClassroom = '2em'
	const classBtnIconMagnify = 'btn aspect-square  rounded-full'

	setContext('test-params', testParams)

	onDestroy(() => {
		if (timer) timer.stop()
	})

	initTest()

	// le bouton restart a été appuyé après la correction
	$: if (restart) {
		initTest()
	}
	$: virtualKeyboardMode.set($touchDevice)

	function changeDelay(newDelay: number) {
		delay = newDelay
		if (timer) timer.changeDelay(delay)
	}

	function decodeUrlParam(param: string): any {
		const urlParam = $page.url.searchParams.get(param)
		if (urlParam === null) return null
		return JSON.parse(decodeURI(urlParam))
	}

	function top(secondsRemaining: number) {
		// top toutes les 1s
		alert = secondsRemaining <= 5
		elapsed++
		remaining = convertToTime(secondsRemaining * 1000)
	}

	function tick(msRemaining: number) {
		// top toutes les 10ms
		// en ms
		percentage = ((msRemaining / 1000) * 100) / delay
	}

	async function initTest() {
		info('init test')
		current = -1
		restart = false
		finish = false
		go = false

		cards = []
		classroom = decodeUrlParam('classroom') === true
		flash = decodeUrlParam('flash') === true
		courseAuxNombres = decodeUrlParam('courseAuxNombres') === true
		assignmentId =
			decodeUrlParam('assessment') &&
			parseInt(decodeUrlParam('assessment') as string)
		console.log('assignmentId', assignmentId)
		training = decodeUrlParam('training') === true
		console.log('training', training)
		testParams.courseAuxNombres = courseAuxNombres
		testParams.classroom = classroom
		testParams.flash = flash

		basket = decodeUrlParam('questions')

		// si c'est une évaluation programmée
		if (!basket) {
			const { data: basketData, error } = await data.supabase
				.from('assignments')
				.select('basket')
				.eq('id', assignmentId)
				.maybeSingle()

			if (error) {
				fail('error while fetching assignment', error)
				toastStore.trigger({
					message:
						"Une erreur est survenue lors de la récupération de l'évaluation",
					background: 'bg-error-500',
				})
			} else if (!basketData) {
				fail('no data while fetching assignment')
				toastStore.trigger({
					message:
						"Une erreur est survenue lors de la récupération de l'évaluation",
					background: 'bg-error-500',
				})
			} else {
				basket = JSON.parse(basketData.basket as string)
				console.log('basket', basket)
			}
		}

		showCorrection = !classroom
		if (!basket) basket = []
		generateQuestionsFromBasket(basket, cards)
		if (!basket) basket = []
		if (basket.length === 1) {
			;({ theme, domain, subdomain, level } = questions_ids[basket[0].id])
			query = encodeURI(
				`?theme=${theme}&domain=${domain}&subdomain=${subdomain}&level=${level}`,
			)
		}
		shuffle(cards)

		cards.forEach((q, i) => {
			q.num = i + 1
		})

		if (classroom && basket.length === 1) {
			showExemple = true
			generateExemple()
		}

		info('Begining test with questions :', cards)
		if (flash) {
			beginTest()
		}
	}

	function generateExemple() {
		const { theme, domain, subdomain, level } = questions_ids[basket[0].id]
		const question = getQuestion(theme, domain, subdomain, level)
		console.log('getQuestion', question)
		const generated = generate(question)
		console.log('generatedExemple', generated)
		generatedExemple = prepareAnsweredQuestion(generated)
		console.log('generatedExemple', generatedExemple)
	}

	function beginTest() {
		showExemple = false
		go = true
		if (courseAuxNombres) {
			const tick = (seconds: number) => {
				remaining = convertToTime(seconds)
			}
			timer = createTimer({ delay: 7 * 60, tick, timeout: () => commit.exec() })
			timer.start()
		} else {
			// on passe à la première question
			change()
		}
	}

	function previousCard() {
		if (current > 0) {
			current--
			card = cards[current]
		}
	}
	// on passe à la question suivante
	async function change() {
		if (timer) timer.stop()

		if (current < cards.length - 1) {
			current++
			card = cards[current]

			if (!flash) {
				let time = Math.min(Math.round(elapsed / 1000), delay)
				if (time === 0) time = 1
				card.time = time

				delay = card.delay || card.defaultDelay || 20
				percentage = 0
				alert = false
				start = Date.now()
				previous = 0
				elapsed = 0
				timer = createTimer({
					delay,
					top,
					tick,
					timeout: () => commit.exec(), //pour garder le this sur commit
				})
				timer.start()
			}
		} else if (!flash) {
			finish = true
		}
	}

	function togglePause() {
		if (pause) {
			timer.resume()
		} else {
			timer.pause()
		}
		pause = !pause
	}

	function handleKeydown(ev: KeyboardEvent) {
		if (classroom) {
			ev.preventDefault()
			if (ev.code === 'Space') {
				togglePause()
			} else if (ev.code === 'ArrowRight') {
				change()
			}
		} else if (flash) {
			ev.preventDefault()
			switch (ev.code) {
				case 'ArrowRight':
					change()
					break

				case 'ArrowLeft':
					previousCard()
					break
			}
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />
<div class="container mx-auto px-2 h-full">
	{#if !$mathliveReady}
		<div class="h-full flex justify-center items-center">
			<Spinner />
		</div>
	{:else if showExemple}
		<div
			class="h-full flex flex-col justify-center items-center"
			style={classroom ? `font-size:${magnifyClassroom};` : ''}
		>
			<div style="width:900px">
				<QuestionCard card={generatedExemple} flashcard />
			</div>
			<div class="mt-4">
				<button
					on:click={generateExemple}
					class={classBtnIconMagnify + ' variant-filled-primary mx-2'}
					><IconRestart /></button
				>
				<button
					on:click={beginTest}
					class={classBtnIconMagnify + ' variant-filled-primary mx-2'}
					><IconRocket /></button
				>
			</div>
		</div>
	{:else if finish}
		{#if showCorrection}
			<div style={classroom ? `font-size: ${magnifyClassroom};` : ''}>
				<Correction
					items={cards.map(assessItem)}
					{query}
					{classroom}
					{assignmentId}
					bind:restart
					db={data.supabase}
					{training}
				/>
			</div>
		{:else}
			<div class="h-full flex justify-center items-center">
				<button
					on:click={() => {
						showCorrection = true
					}}
					class="p-4 variant-filled-primary text-xl"
					>Afficher la correction</button
				>
			</div>
		{/if}
	{:else if !go}
		<div class="h-full flex justify-center items-center">
			<button
				on:click={() => {
					beginTest()
				}}
				class=" p-4 variant-filled-primary text-xl">Let's go !</button
			>
		</div>
	{:else if courseAuxNombres}
		Course aux nombres
		{#if remaining}
			{`${remaining.minutes}:${remaining.seconds < 10 ? '0' : ''}${
				remaining.seconds
			}`}
		{/if}
		<div class="flex justify-center">
			<div id="cards-container" style={`width:600px`}>
				{#each cards as card}
					<div class="card">
						<div class=" p-2 rounded-lg">
							<QuestionCard
								{card}
								interactive={true}
								commit={(() => {
									const c = { ...commit }
									commits.push(c)
									return c
								})()}
							/>
						</div>
					</div>
				{/each}
			</div>
		</div>
		<div class="flex justify-center items-center">
			<button
				on:click={() => {
					timer.stop()
					commits.forEach((commit) => commit.exec())
					finish = true
				}}
				class="variant-filled-primary">Valider</button
			>
		</div>
	{:else if card}
		<div style={classroom ? `font-size: ${magnifyClassroom};` : ''}>
			{#if !flash}
				<div class={' my-1 flex justify-start items-center'}>
					{#if classroom}
						<div class="flex">
							<button
								class="mx-2 btn-icon variant-filled-tertiary"
								on:click={() => {
									if (delay > 5) changeDelay(delay - 5)
								}}>-5s</button
							>
							<button
								class="mx-2 btn-icon variant-filled-tertiary"
								on:click={() => {
									if (delay <= 55) changeDelay(delay + 5)
								}}>+5s</button
							>
						</div>
					{/if}
					{#if !classroom && card.type !== 'choice' && card.type !== 'choices'}
						<button
							on:click={() => {
								virtualKeyboardMode.update(
									(virtualKeyboard) => !virtualKeyboard,
								)
							}}
							class={'btn-icon ' +
								($virtualKeyboardMode
									? 'variant-filled-primary'
									: 'variant-filled-tertiary')}><IconKeyboard /></button
						>
					{/if}
					<div class="flex grow" />

					<CircularProgress number={current + 1} {percentage} pulse={alert} />
				</div>
			{/if}

			<div id="cards-container" class="m-auto">
				{#key card}
					<div
						in:fly={{ x: 500, duration: 500, delay: 200 }}
						out:fly={{ x: -500, duration: 500 }}
						class="flex justify-center"
					>
						<QuestionCard
							class={classroom ? 'max-w-3xl' : 'max-w-xl'}
							{card}
							interactive={!classroom && !flash}
							{commit}
							immediateCommit={true}
							flashcard={flash}
						/>
					</div>
				{/key}
			</div>
			<div>
				<a href={`/automaths${query}`}>
					<button class="btn-icon variant-filled-primary"><IconHome /></button>
				</a>
			</div>
		</div>
	{:else}
		Pas de questions
	{/if}
</div>

<style>
	#cards-container {
		margin-top: 20px;
		margin-bottom: 20px;
		position: relative;
		display: grid;
		grid-template-rows: 1fr;
		grid-template-columns: 1fr;
		/* display: flex; */
		/* flex-direction: column; */
		/* overflow-x: hidden; */
		/* height: 500px; */
		/* max-height: 70vh; */
		/* width: 100%; */
	}

	#cards-container > * {
		grid-row: 1;
		grid-column: 1;
	}
</style>
