<script lang="ts">
	import CorrectionListItems from './CorrectionListItems.svelte'
	import { onMount } from 'svelte'
	import { correct_color, incorrect_color, unoptimal_color } from '$lib/stores'
	import { Confetti } from 'svelte-confetti'
	import { getLogger } from '$lib/utils'
	import math from 'tinycas'
	import {
		STATUS_CORRECT,
		STATUS_UNOPTIMAL_FORM,
	} from '$lib/questions/correction'
	import type { CorrectedQuestion } from '../../../../types/type'
	import IconHome from '$lib/icones/IconHome.svelte'
	import IconScan from '$lib/icones/IconScan.svelte'
	import IconReload from '$lib/icones/IconReload.svelte'
	import { toastStore } from '@skeletonlabs/skeleton'
	import type { SupabaseClient } from '@supabase/supabase-js'
	import type { Database } from '../../../../types/supabase'

	export let items: CorrectedQuestion[]
	export let assignmentId: number
	export let training
	export let restart
	export let query: string
	export let classroom = false
	export let db: SupabaseClient<Database>

	const { info, fail } = getLogger('Correction', 'info')
	let percent: number
	let displayDetails = false
	const toggleDetails = () => (displayDetails = !displayDetails)
	let colorResult:
		| typeof $correct_color
		| typeof $incorrect_color
		| typeof $unoptimal_color
	let messageResult: string

	let total = 0
	let score = 0

	items.forEach((item) => {
		total += item.points
		score +=
			item.status == STATUS_CORRECT
				? item.points
				: item.status == STATUS_UNOPTIMAL_FORM
				? item.points / 2
				: 0
	})

	// sauvegarde des résultats
	if (assignmentId && !training) {
		db.from('assignments')
			.update({
				mark: score,
				questions: JSON.stringify(items),
				status: 'done',
			})
			.eq('id', assignmentId)
			.then((res) => {
				if (res.error) {
					fail(res.error)
					toastStore.trigger({
						message: 'Erreur lors de la sauvegarde des résultats',
						background: 'bg-red-500',
					})
				}
			})
	}

	// Quand le composant de correction a fini de s'afficher,
	// le score a déjà été calculé, on l'enregistre
	onMount(async () => {
		if (!classroom) {
			percent = score / total

			if (percent === 1) {
				colorResult = $correct_color
				messageResult = 'Perfect !'
			} else if (percent >= 0.8) {
				colorResult = $correct_color
				messageResult = 'Good Job !'
			} else if (percent >= 0.5) {
				colorResult = $unoptimal_color
				messageResult = 'Keep on !'
			} else {
				colorResult = $incorrect_color
				messageResult = 'Try again !'
			}
		}
		// évaluation à sauvegarder
	})

	let displayHelp = false
	let congrats = false

	function toggleDisplayHelp() {
		displayHelp = !displayHelp
	}
</script>

<div>
	{#if score === total}
		<div
			style="
position: fixed;
top: -50px;
left: 0;
height: 100vh;
width: 100vw;
display: flex;
justify-content: center;
overflow: hidden;
pointer-events: none;
z-index:100"
		>
			<Confetti
				x={[-5, 5]}
				y={[0, 0.1]}
				delay={[500, 2000]}
				infinite
				size="15"
				duration="5000"
				amount="300"
				fallDistance="100vh"
			/>
		</div>
	{/if}
	<div class="my-3 flex justify-end">
		<button on:click={toggleDetails} class="btn-icon variant-filled-primary"
			><IconScan /></button
		>
	</div>

	{#if classroom}
		<div class="flex justify-around w-full" style="overflow-x:auto;">
			<div class="w-full">
				<CorrectionListItems items={items.filter((_, i) => i % 2 === 0)} />
			</div>
			<div class="ml-12 w-full">
				<CorrectionListItems items={items.filter((_, i) => i % 2 === 1)} />
			</div>
		</div>
	{:else}
		<div class="flex w-full justify-center">
			<div style="width:650px">
				<CorrectionListItems {items} />
			</div>
		</div>
	{/if}

	{#if !classroom}
		<div
			class={'p-2 flex items-center  justify-around'}
			style={`background:${colorResult}`}
		>
			<div class="flex flex-col items-center justify-around h-full">
				<button
					on:click={() => (restart = true)}
					class="text-black bg-white my-2 btn-icon text-2xl"
					><IconReload /></button
				>
				<a href={`/automaths${query}`}>
					<button class="text-black bg-white my-2 btn-icon text-2xl"
						><IconHome /></button
					>
				</a>
			</div>
			<div class="flex flex-col items-center" style="color:white">
				<div class="my-2" style="font-size:2em; font-family:'pacifico'">
					{messageResult}
				</div>
				<div class="my-2">
					Score : <span style="font-size:1.5em;font-family:'pacifico'"
						>{math(score).toString({ comma: true })}</span
					> <span style="font-size:1.5em;"> / </span><span
						style="font-size:1.5em; font-family:'pacifico'">{total}</span
					>
				</div>
			</div>
			{#if percent === 1}
				<img alt="Great!" src="/images/great-150.png" />
			{:else if percent >= 0.8}
				<img alt="Good job!" src="/images/good-job-150.png" />
			{:else if percent >= 0.5}
				<img alt="Keep on!" src="/images/keep-on-150.png" />
			{:else}
				<img alt="Try again!" src="/images/try-again-150.png" />
			{/if}
		</div>
	{/if}
</div>

<style>
	/* pacifico-regular - latin */
</style>
