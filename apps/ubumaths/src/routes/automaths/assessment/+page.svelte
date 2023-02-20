<script lang="ts">
	import generate from '$lib/questions/generateQuestion'
	import { afterUpdate, onDestroy, onMount, setContext } from 'svelte'
	import datas, { getQuestion } from '$lib/questions/questions.js'
	import { convertToTime, getLogger, shuffle } from '$lib/utils'
	import { createTimer } from '$lib/timer'
	import { page } from '$app/stores'
	import {
		virtualKeyboardMode,
		touchDevice,
		mathliveReady,
		fontSize,
	} from '$lib/stores'

	import Correction from './Correction.svelte'
	import type {
		AnsweredQuestion,
		Basket,
		Commit,
		CorrectedQuestion,
		Time,
		Timer,
	} from '$lib/type'
	import Spinner from '$lib/ui/Spinner.svelte'
	import QuestionCard from '$lib/ui/QuestionCard.svelte'
	import { RangeSlider } from '@skeletonlabs/skeleton'
	import CircularProgress from '$lib/ui/CircularProgress.svelte'
	import {
		assessItem,
		prepareAnsweredQuestion,
		prepareCorrectedQuestion,
	} from '$lib/questions/correction'

	const ids = datas.ids
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
	let slider = 0
	let min = 5,
		max = 60
	let cards: AnsweredQuestion[]
	let card: AnsweredQuestion
	let generatedExemple: CorrectedQuestion
	let basket: Basket
	let go = false
	const testParams: TestParams = {}
	let commit: Commit = {
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
	const classBtnIconMagnify = 'btn magnify-icon aspect-square  rounded-full'

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

	function changeDelay(delay: number) {
		if (timer) timer.changeDelay(delay)
	}
	$: changeDelay(slider)

	function decodeUrlParam(param: string): any {
		const urlParam = $page.url.searchParams.get(param)
		if (urlParam === null) return null
		return JSON.parse(decodeURI(urlParam))
	}

	function top(remaining: number) {
		// top toutes les 1s
		alert = remaining < 5
	}

	function tick(remaining: number) {
		// top toutes les 10ms
		// en ms
		percentage = ((remaining / 1000) * 100) / delay
	}

	function initTest() {
		info('init test')
		current = -1
		restart = false
		finish = false
		go = false

		cards = []
		classroom = decodeUrlParam('classroom') === true
		flash = decodeUrlParam('flash') === true
		courseAuxNombres = decodeUrlParam('courseAuxNombres') === true
		testParams.courseAuxNombres = courseAuxNombres
		testParams.classroom = classroom
		testParams.flash = flash

		basket = decodeUrlParam('questions')

		showCorrection = !classroom

		let offset = 0
		basket.forEach((q) => {
			const { theme, domain, subdomain, level } = ids[q.id]
			const question = getQuestion(theme, domain, subdomain, level)
			let delay = q.delay || question.defaultDelay
			//  check that delay is a multiple of five
			const rest = delay % 5
			delay = delay + 5 - rest

			for (let i = 0; i < q.count; i++) {
				const generated = generate(question, cards, q.count, offset)
				generated.delay = delay

				cards.push(prepareAnsweredQuestion(generated))
			}
			offset += q.count
		})
		if (basket.length === 1) {
			;({ theme, domain, subdomain, level } = ids[basket[0].id])
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
		const { theme, domain, subdomain, level } = ids[basket[0].id]
		const question = getQuestion(theme, domain, subdomain, level)
		generatedExemple = prepareCorrectedQuestion(
			prepareAnsweredQuestion(generate(question)),
		)
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
				slider = delay

				// slider = Math.max(5, slider)
				// slider = Math.min(slider, 60)
				percentage = 0
				alert = false
				start = Date.now()
				previous = 0
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

{#if !$mathliveReady}
	<div class="flex justify-center items-center" style="height:75vh">
		<Spinner />
	</div>
{:else if showExemple}
	<div
		class=" flex flex-col justify-center items-center"
		style={'min-height: calc(100vh - 146px);' +
			(classroom ? `font-size:${magnifyClassroom};` : '')}
	>
		<div style="width:900px">
			<QuestionCard card={generatedExemple} flashcard />
		</div>
		<div class="mt-4">
			<button
				on:click={generateExemple}
				class={classBtnIconMagnify + ' variant-filled-primary mx-2'}
				><iconify-icon icon="mdi:restart" /></button
			>
			<button
				on:click={beginTest}
				class={classBtnIconMagnify + ' variant-filled-primary mx-2'}
				><iconify-icon icon="mdi:rocket-launch-outline" /></button
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
				bind:restart
			/>
		</div>
	{:else}
		<div style="height:90vh" class=" flex justify-center items-center">
			<button
				on:click={() => {
					showCorrection = true
				}}
				class="p-4  variant-filled-primary text-xl"
				>Afficher la correction</button
			>
		</div>
	{/if}
{:else if !go}
	<div style="height:90vh" class="flex justify-center items-center">
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
					<RangeSlider
						class="pl-4"
						name="range-slider"
						bind:value={slider}
						{max}
						{min}
						step={5}
					/>
				{/if}
				{#if !classroom && card.type !== 'choice' && card.type !== 'choices'}
					<button
						on:click={() => {
							virtualKeyboardMode.update((state) => {
								return !state
							})
						}}
						class="btn-icon variant-filled-primary"
						><iconify-icon icon="mdi:keyboard" /></button
					>
				{/if}
				<div class="flex grow" />

				<CircularProgress number={current + 1} {percentage} pulse={alert} />
			</div>
		{/if}

		<div class="flex justify-center">
			<div id="cards-container" style={`width:${classroom ? 1000 : 600}px`}>
				{#each [cards[current]] as card (current)}
					<QuestionCard
						{card}
						interactive={!classroom && !flash}
						{commit}
						immediateCommit={true}
						flashcard={flash}
					/>
				{/each}
			</div>
		</div>
		<div>
			<a href={`/automaths${query}`}>
				<button class="btn-icon variant-filled-primary"
					><iconify-icon icon="mdi:home" /></button
				>
			</a>
		</div>
	</div>
{:else}
	Pas de questions
{/if}

<style>
	#cards-container {
		margin-top: 20px;
		margin-bottom: 20px;
		position: relative;
		/* display: flex; */
		/* flex-direction: column; */
		/* overflow-x: hidden; */
		/* height: 500px; */
		/* max-height: 70vh; */
		/* width: 100%; */
	}

	.magnify-icon {
		font-size: 0.9em;
		width: 1.8em;
	}
</style>
