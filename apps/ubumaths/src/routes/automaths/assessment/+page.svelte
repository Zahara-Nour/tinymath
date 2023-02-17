<script lang="ts">
	import generate from '$lib/questions/generateQuestion'
	import { afterUpdate, onDestroy, onMount, setContext } from 'svelte'
	import datas, { getQuestion } from '$lib/questions/questions.js'
	import { getLogger, shuffle } from '$lib/utils'
	import { createTimer } from '$lib/timer'
	import { page } from '$app/stores'
	import { virtualKeyboardMode, touchDevice, mathliveReady } from '$lib/stores'
	import { goto } from '$app/navigation'

	import { fetchImage } from '$lib/images'
	import Correction from './Correction.svelte'
	import type {
		AnsweredQuestion,
		Basket,
		Commit,
		CorrectedQuestion,
		GeneratedQuestion,
		QuestionWithID,
		Time,
		Timer,
	} from '$lib/type'
	import CorrectionItem from '$lib/ui/CorrectionItem.svelte'
	import Spinner from '$lib/ui/Spinner.svelte'
	import QuestionCard from '$lib/ui/QuestionCard.svelte'
	import { RangeSlider } from '@skeletonlabs/skeleton'
	import CircularProgress from '$lib/ui/CircularProgress.svelte'
	import {
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
	let commit: Commit
	let ref: HTMLElement
	let fontSize: number
	let remaining: Time
	let commits: Commit[] = []
	let query: string

	type TestParams = {
		courseAuxNombres?: boolean
		flash?: boolean
		classroom?: boolean
	}
	setContext('test-params', testParams)

	function decodeUrlParam(param: string): any {
		const urlParam = $page.url.searchParams.get(param)
		if (urlParam === null) return null
		return JSON.parse(decodeURI(urlParam))
	}

	onMount(() => {
		if (ref) {
			const style = window.getComputedStyle(ref)
			fontSize = parseInt(
				style.getPropertyValue('font-size').replace('px', ''),
				10,
			)
		}
	})

	afterUpdate(() => {
		if (ref) {
			const style = window.getComputedStyle(ref)
			fontSize = parseInt(
				style.getPropertyValue('font-size').replace('px', ''),
				10,
			)
		}
	})

	function countDown(remaining: number) {
		percentage = (remaining * 100) / delay
		alert = remaining < 5000
	}

	onDestroy(() => {
		timer.stop()
	})

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
			if (q.image) {
				q.imageBase64P = fetchImage(q.image)
			}
			if (q.imageCorrection) {
				q.imageCorrectionBase64P = fetchImage(q.imageCorrection)
			}
			if (q.choices) {
				q.choices.forEach((choice) => {
					if (choice.image) {
						choice.imageBase64P = fetchImage(choice.image)
						choice.imageBase64P.then((base64) => {
							choice.base64 = base64
						})
					}
				})
			}
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
			const tick = () => {
				remaining = 
			}
			timer = createTimer(7 * 60, tick, commit.exec)
			remaining = timer.getTime()
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
				if (slider && basket.length === 1) {
					delay = slider * 1000
				} else {
					delay = card.delay
						? card.delay * 1000
						: card.defaultDelay
						? card.defaultDelay * 1000
						: 20000
					slider = delay / 1000
				}
				slider = Math.max(5, slider)
				// slider = Math.min(slider, 60)
				percentage = 0
				alert = false
				start = Date.now()
				previous = 0
				timer = createTimer(delay, countDown, commit)
			}
		} else if (!flash) {
			finish = true
		}
	}

	function togglePause() {
		if (pause) {
			start = Date.now()
		} else {
			previous = elapsed
		}
		pause = !pause
	}

	function handleKeydown(ev) {
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

	initTest()

	// le bouton restart a été appuyé après la correction
	$: if (restart) {
		initTest()
	}
	$: virtualKeyboardMode.set($touchDevice)
	$: delay = slider * 1000

	commit = {
		exec: function () {
			if (this.hook) {
				this.hook()
			}
			if (!courseAuxNombres) {
				change()
			}
		},
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
		style=" min-height: calc(100vh - 146px);"
	>
		<div style="width:900px">
			<QuestionCard card={generatedExemple} flashcard />
		</div>
		<div class="mt-2 flex justify-end">
			<button on:click={generateExemple} class="btn-icon variant-filled-primary"
				><iconify-icon icon="mdi:restart" /></button
			>
			<button on:click={beginTest} class="btn-icon variant-filled-primary"
				><iconify-icon icon="mdi:rocket-launch-outline" /></button
			>
		</div>
	</div>
{:else if finish}
	{#if showCorrection}
		<Correction items={cards} {query} {classroom} bind:restart />
	{:else}
		<div style="height:90vh" class="flex justify-center items-center">
			<button
				on:click={() => {
					showCorrection = true
				}}
				class="variant-filled-primary">Afficher la correction</button
			>
		</div>
	{/if}
{:else if !go}
	<div style="height:90vh" class="flex justify-center items-center">
		<button
			on:click={() => {
				beginTest()
			}}
			class="variant-filled-primary">Let's go !</button
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
					<div class=" p-2 elevation-{4} rounded-lg">
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
	<div bind:this={ref}>
		{#if !flash}
			<div class={' my-1 flex justify-start items-center'}>
				{#if classroom}
					<RangeSlider
						name="range-slider"
						bind:value={slider}
						{max}
						{min}
						step={5}
						ticked>Label</RangeSlider
					>
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

				<CircularProgress
					number={current + 1}
					fontSize={classroom ? 2.5 * fontSize : fontSize * 1.8}
					{percentage}
					pulse={alert}
				/>
			</div>
		{/if}

		<div class="flex justify-center">
			<div id="cards-container" style={`width:${classroom ? 1000 : 600}px`}>
				{#each [cards[current]] as card (current)}
					<QuestionCard
						{card}
						interactive={!classroom && !flash}
						{commit}
						magnify={classroom ? 2.5 : 1}
						immediateCommit={true}
						flashcard={flash}
					/>
				{/each}
			</div>
		</div>
		<div>
			<a href={`/automaths + ${query}`}>
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
</style>
