<script lang="ts">
	import QuestionCard from '$lib/ui/QuestionCard.svelte'
	import type { Game } from './types'
	import games from './games'
	import type { AnsweredQuestion, Timer } from '../../../../types/type'
	import generateQuestion from '$lib/questions/generateQuestion'
	import {
		prepareAnsweredQuestion,
		prepareCorrectedQuestion,
	} from '$lib/questions/correction'
	import CircularProgress from '$lib/ui/CircularProgress.svelte'
	import { onDestroy } from 'svelte'
	import { createTimer } from '$lib/timer'
	import { tick as svelte_tick } from 'svelte'
	import { toastStore } from '@skeletonlabs/skeleton'
	import { page } from '$app/stores'

	let game: Game
	let draws: Array<AnsweredQuestion> = []
	const results: number[] = []
	let availables: Array<number> = []
	let chosen = ''
	let current = -1
	let percentage = 100
	let timer: Timer
	let delay: number
	let finish = false
	let pause = false

	let question: AnsweredQuestion
	let drawStackRef: HTMLDivElement

	$: chosen = $page.url.searchParams.get('game')
		? JSON.parse(decodeURI($page.url.searchParams.get('game') as string))
		: ''

	onDestroy(() => {
		if (timer) timer.stop()
	})

	$: start(chosen)

	function start(chosen: string) {
		if (chosen) {
			game = games[chosen]
			console.log('game', game, games, Object.keys(games))
			console.log(Object.keys(games)[1] === chosen)
			console.log(chosen)
			console.log(Object.keys(games)[1])
			if (game.length !== 90) {
				console.log('Le jeu doit contenir 90 questions')
				toastStore.trigger({
					message: 'Le jeu doit contenir 90 questions',
					background: 'bg-error-500',
				})
			}
			const solutions = game
				.map(
					(q) =>
						prepareCorrectedQuestion(
							prepareAnsweredQuestion(generateQuestion({ ...q, id: '' })),
						).solutions[0] as string,
				)
				.sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
			console.log('solutions', solutions)
			availables = Array(game.length)
				.fill(0)
				.map((_, i) => i)
			drawQuestion()
		}
	}
	function top(secondsRemaining: number) {
		// top toutes les 1s
		console.log('top', secondsRemaining)
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
		if (ev.code === 'Space') {
			ev.preventDefault()
			togglePause()
		}
	}

	async function drawQuestion() {
		if (timer) timer.stop()
		current++
		if (current) {
			draws.push(question)
			draws = draws
			console.log('draws.push', question)
			await svelte_tick()
			drawStackRef.scrollTop = drawStackRef.scrollHeight
		}
		if (current < game.length) {
			console.log('availables', availables)
			const n = availables[Math.floor(Math.random() * availables.length)]
			console.log('n', n)
			availables.splice(availables.indexOf(n), 1)
			console.log('availables', availables)
			const q = game[n]
			console.log('q', q)
			question = prepareAnsweredQuestion(generateQuestion({ ...q, id: '' }))
			// delay = question.delay || question.defaultDelay || 10
			delay = 1
			percentage = 0
			timer = createTimer({
				delay,
				top,
				tick,
				timeout: drawQuestion,
			})
			timer.start()
		} else {
			finish = true
		}
	}

	function tick(msRemaining: number) {
		// top toutes les 10ms
		// en ms
		percentage = ((msRemaining / 1000) * 100) / delay
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if chosen}
	<div class="overflow-y-hidden" style={'height:90vh'}>
		<div class="flex h-full overflow-y-hidden">
			<div class="flex items-center justify-center grow h-full">
				{#if finish}
					Finish !
				{:else}
					<CircularProgress number={current + 1} {percentage} />
					<QuestionCard class="max-w-xl" card={question} />
				{/if}
			</div>
			<div
				class="h-full max-h-full w-64 overflow-y-auto"
				bind:this={drawStackRef}
			>
				{#each draws as draw}
					<QuestionCard class="max-w-xl" card={draw} />
				{/each}
			</div>
		</div>
	</div>
{:else}
	<h1>Choisir un jeu :</h1>
	<div
		class="flex flex-col items-center justify-center gap-16 text-4xl h-full"
		style="font-family: 'Baloo 2', sans-serif;"
	>
		{#each Object.entries(games) as [description, game] (description)}
			<a
				style="text-decoration:none"
				href="/jeux/bingo?game={encodeURI(JSON.stringify(description))}"
				>{description}</a
			>
		{/each}
	</div>
{/if}
