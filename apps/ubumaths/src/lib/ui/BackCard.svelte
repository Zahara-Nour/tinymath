<script lang="ts">
	// import Spinner from './Spinner.svelte'
	import math from 'tinycas'
	import 'iconify-icon'
	import { formatLatexToHtml } from '$lib/stores'
	import { mdc_colors, correct_color } from '$lib/colors'
	import CorrectionLine from './CorrectionLine.svelte'
	import {
		isQuestionChoice,
		isQuestionChoices,
		type AnsweredQuestion,
		type Choice,
		type Line,
	} from '$lib/type'
	import { magnify_3xl } from '$lib/utils'

	export let card: AnsweredQuestion
	export let toggleFlip = () => {}
	export let h = 0
	export let w = 0
	export let height = 0
	export let width = 0
	export let correction = false
	export let detailedCorrection: Line[] = []

	function getSolution(card: AnsweredQuestion) {
		let nSol = -1
		let s: string | Choice

		function replaceSol() {
			nSol += 1
			return math(card.solutions![nSol]).latex
		}

		if (isQuestionChoices(card)) {
			s = '<div class="flex flex-wrap justify-start">'
			card.choices.forEach((choice, i) => {
				let color = 'grey'
				if (card.solutions.includes(i)) {
					color = correct_color
				}

				s += `<span
					class="rounded-lg  m-2 p-1"
					style="border: 4px solid ${color}"
				>`

				if (choice.image) {
					s += `<img src="${choice.imageBase64}" style="max-width:min(400px,80%);max-height:40vh;" alt="choice ${i}"/>`
				} else {
					s += `<div class="text-base " style="{font-size:1rem}">`
					s += choice.text as string
					s += '</div>'
				}
				s += '</span>'
			})

			s += '</div>'
		} else if (isQuestionChoice(card)) {
			s = card.choices[card.solutions[0]]
			if (s.text) {
				s = s.text
			} else if (s.image) {
				s = `<img src=${s.image}>`
			}
		} else {
			if (card.answerField && card.type !== 'equation') {
				s = $formatLatexToHtml(
					card.answerField.replace(/\?/g, replaceSol),
				) as string
			} else {
				s = card.solutions![0] as string
				s = '$$' + math(s).latex + '$$'
			}
		}
		return s
	}

	$: solution = $formatLatexToHtml(getSolution(card))
	$: details = detailedCorrection || []
</script>

<div bind:clientHeight={h} bind:clientWidth={w} class={`${$$props.class}`}>
	<div
		class="card p-4 flex flex-col items-start justify-between"
		style={height ? `height:${height}px;` : width ? `width:${width}px;` : ''}
	>
		<!-- correction des réponses de l'utilisateur -->

		<!-- si mode correction, on affiche la correction détaillée -->
		{#if correction}
			<div
				class="correction-title text-success-500 font-bold mb-4"
				style={`font-size:1rem;`}
			>
				Détails
			</div>

			{#each details as line}
				<div class="correction-line">
					<CorrectionLine {line} />
				</div>
			{/each}

			<div class=" w-full flex justify-end">
				<button
					on:click={toggleFlip}
					class="btn-icon-magnify variant-filled-primary"
					><iconify-icon icon="mdi:orbit-variant" /></button
				>
			</div>
		{:else}
			<!-- solution générique -->
			<div class="text-success-500">Réponse :</div>
			<div class="my-5" style={`font-size:${magnify_3xl};`}>
				{@html solution}
			</div>
			{#if card.imageCorrection}
				{#await card.imageCorrectionBase64P}
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
			{#if details}
				<div class="my-2 relative">
					{#each details as line}
						<div class=" correction-line">
							<CorrectionLine {line} />
						</div>
					{/each}
				</div>
			{/if}
			<footer class="footermt-3 w-full flex justify-end">
				<button on:click={toggleFlip} class="btn-icon variant-filled-primary"
					><iconify-icon icon="mdi:orbit-variant" /></button
				>
			</footer>
		{/if}
	</div>
</div>

<style lang="postcss">
	.correction-line {
		margin-top: 9px;
		margin-bottom: 9px;
	}

	.correction-line:first-child {
		margin-top: 0px;
		margin-bottom: 9px;
	}

	.correction-line:last-child {
		margin-top: 9px;
		margin-bottom: 0px;
	}

	.correction-title {
		transform: rotate(-45deg);
	}

	.magnify-icon {
		font-size: 0.9em;
		width: 1.5em;
	}

	.btn-icon-magnify {
		@apply btn magnify-icon aspect-square  rounded-full;
	}
</style>
