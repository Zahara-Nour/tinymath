<script lang="ts">
	// import Spinner from './Spinner.svelte'
	import Question from './Question.svelte'
	import { formatToHtml } from '$lib/stores'
	import { formatToLatex } from '$lib/utils'
	import { mdc_colors } from '$lib/colors'
	import type {
		AnsweredQuestion,
		Commit,
		CorrectedQuestion,
		Line,
	} from '$lib/type'

	export let toggleFlip = () => {}
	export let card: AnsweredQuestion
	export let showDescription = false
	export let height = 0
	export let width = 0
	export let h = 0
	export let w = 0
	export let masked = false
	export let interactive = false
	export let commit: Commit
	export let correction = false
	export let simpleCorrection: Line[] = []
	export let detailedCorrection: Line[] = []
	export let immediateCommit = false
	export let flashcard = false

	$: description = $formatToHtml(formatToLatex(card.description))
	$: subdescription = $formatToHtml(formatToLatex(card.subdescription))
</script>

<div bind:clientHeight={h} bind:clientWidth={w} class={`${$$props.class}`}>
	<div
		class="card variant-filled-soft p-4 flex flex-col  justify-between"
		style={height ? `height:${height}px;` : width ? `width:${width}px;` : ''}
	>
		{#if showDescription}
			<header class="header flex items-center justify-between pb-2 border-b-2">
				<div class="flex justify-left items-center">
					<div class="flex flex-col justify-start">
						<span class="font-bold text-primary-500">
							{@html $formatToHtml(description)}
						</span>

						{#if subdescription}
							<span class="text-primary-500">
								{@html $formatToHtml(subdescription)}
							</span>
						{/if}
					</div>
				</div>

				<span
					><button
						on:click={() => (correction = !correction)}
						class={'mx-1 btn-icon ' +
							(correction
								? 'variant-filled-primary'
								: 'variant-filled-surface')}>C</button
					>
					<button
						on:click={() => (interactive = !interactive)}
						class={'mx-1 btn-icon ' +
							(interactive
								? 'variant-filled-primary'
								: 'variant-filled-surface')}>I</button
					>
					<span class="ml-2">{card.id}</span>
				</span>
			</header>
		{/if}
		{#if correction}
			<div
				class="correction-title"
				style={` color:${mdc_colors['lime-500']}; font-size:1rem; position:absolute;top:1.5em;left:-6px`}
			>
				Correction
			</div>
		{/if}

		<Question
			question={card}
			{masked}
			{correction}
			{interactive}
			bind:simpleCorrection
			bind:detailedCorrection
			{commit}
			{immediateCommit}
		/>

		{#if flashcard}
			<footer class="footer flex justify-end">
				<button
					on:click={toggleFlip}
					class="text-xl btn-icon variant-filled-primary"
					><iconify-icon icon="mdi:orbit-variant" /></button
				>
			</footer>
		{/if}
	</div>
</div>

<style>
	.correction-title {
		transform: rotate(-45deg);
	}
</style>
