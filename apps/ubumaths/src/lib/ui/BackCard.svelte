<script lang="ts">
	// import Spinner from './Spinner.svelte'
	import math from 'tinycas'
	import { formatLatexToHtml } from '$lib/stores'
	import { correct_color } from '$lib/stores'
	import CorrectionLine from './CorrectionLine.svelte'
	import {
		isQuestionChoice,
		isQuestionChoices,
		type AnsweredQuestion,
		type Choice,
		type Line,
		isQuestionResultOrRewrite,
		isQuestionFillIn,
		isQuestionAnswerField,
	} from '../../types/type'
	import { magnify_3xl } from '$lib/utils'
	import IconOrbitVariant from '$lib/icones/IconOrbitVariant.svelte'
	import { putSolutions } from '$lib/questions/correctionItem'

	export let card: AnsweredQuestion
	export let toggleFlip = () => {}
	export let h = 0
	export let w = 0
	export let height = 0
	export let width = 0
	export let correction = false
	export let detailedCorrection: Line[] = []
	const classBtnIconMagnify = 'btn aspect-square rounded-full'

	function getSolution(card: AnsweredQuestion) {
		let nSol = -1
		let s: string | Choice

		function replaceSol() {
			nSol += 1
			return (
				`\\textcolor{${$correct_color}}{` +
				math(card.solutions![nSol]).latex +
				'}'
			)
		}

		if (isQuestionFillIn(card)) {
			console.log('putSolutions', putSolutions(card.expression_latex, card))
			s = '$$' + putSolutions(card.expression_latex, card) + '$$'
		} else if (isQuestionChoices(card)) {
			s = '<div class="flex flex-wrap justify-start">'
			card.choices.forEach((choice, i) => {
				let color = 'grey'
				if (card.solutions.includes(i)) {
					color = $correct_color
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
				s =
					`<span
					class="rounded-lg  m-2 p-1"
					style="border: 4px solid ${$correct_color}"
				>` +
					s.text +
					'</span>'
			} else if (s.image) {
				s = `<img src=${s.image}>`
			}
		} else if (isQuestionResultOrRewrite(card)) {
			s = '$$' + putSolutions(card.answerFormat_latex, card) + '$$'
		} else if (isQuestionAnswerField(card)) {
			if (card.solutions?.length > 1) {
				s = putSolutions(
					card.answerField.replace(/\\text\{(.*?)\}/g, (_, p1) => p1),
					card,
					/\.\.\./g,
				)

				console.log('s', s)
			} else {
				s =
					`$$\\textcolor{${$correct_color}}{` +
					math(card.solutions![0]).latex +
					'}$$'
			}
		} else {
			s = card.solutions![0] as string
			s = '$$' + math(s).latex + '$$'
		}
		return s
	}

	$: solution = $formatLatexToHtml(getSolution(card))
	$: details = detailedCorrection || []
	$: console.log('detailed', detailedCorrection)
</script>

<div bind:clientHeight={h} bind:clientWidth={w} class={`${$$props.class}`}>
	<div
		class="card shadow-xl p-4 flex flex-col items-center justify-between"
		style={height ? `height:${height}px;` : width ? `width:${width}px;` : ''}
	>
		<!-- correction des réponses de l'utilisateur -->

		<!-- si mode correction, on affiche la correction détaillée -->
		{#if correction}
			<div class="w-full flex flex-col items-start justify-between">
				<span
					class="correction-title text-success-500 font-bold mb-4"
					style={`font-size:1rem;`}
				>
					Détails
				</span>
			</div>
			<div class="z-0 relative">
				{#each details as line}
					<div class="correction-line">
						<CorrectionLine {line} />
					</div>
				{/each}
			</div>
		{:else}
			<!-- solution générique -->
			<div class="">Réponse :</div>
			<div class="my-5 z-0 relative" style={`font-size:${magnify_3xl};`}>
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
				<div class="my-2 z-0 relative">
					{#each details as line}
						<div class=" correction-line">
							<CorrectionLine {line} />
						</div>
					{/each}
				</div>
			{/if}
		{/if}
		<footer class="footer w-full flex justify-end">
			<button
				on:click={toggleFlip}
				class={classBtnIconMagnify + ' variant-filled-primary'}
				><IconOrbitVariant /></button
			>
		</footer>
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
		width: 1.8em;
	}
</style>
