<script lang="ts">
	// import Spinner from './Spinner.svelte'
	import Question from './Question.svelte'
	import { formatLatexToHtml } from '$lib/stores'
	import { formatToLatex } from '$lib/utils'
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

	$: description = $formatLatexToHtml(formatToLatex(card.description))
	$: subdescription = $formatLatexToHtml(formatToLatex(card.subdescription))
</script>

<div bind:clientHeight={h} bind:clientWidth={w} class={`${$$props.class}`}>
	<div
		class="card shadow-xl variant-filled-soft p-4 flex flex-col justify-between"
		style={height ? `height:${height}px;` : width ? `width:${width}px;` : ''}
	>
		{#if showDescription}
			<header class="header flex items-center justify-between pb-2 border-b-2">
				<div class="flex justify-left items-center">
					<div class="flex flex-col justify-start">
						<span class="font-bold text-primary-500">
							{@html $formatLatexToHtml(description)}
						</span>

						{#if subdescription}
							<span class="text-primary-500">
								{@html $formatLatexToHtml(subdescription)}
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
			<div class=" flex flex-col items-start">
				<span
					class="correction-title text-success-500 font-bold mb-4 pt-4"
					style={`font-size:1rem;`}
				>
					Correction
				</span>
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

		<footer class="footer flex justify-end">
			{#if flashcard}
				<button
					on:click={toggleFlip}
					class=" btn-icon-magnify variant-filled-primary"
					><iconify-icon icon="mdi:orbit-variant" /></button
				>
			{:else}
				<button
					style="visibility:hidden;"
					class="btn-icon-magnify variant-filled-primary"
					><iconify-icon icon="mdi:orbit-variant" /></button
				>
			{/if}
		</footer>
	</div>
</div>

<style lang="postcss">
	.correction-title {
		transform: rotate(-45deg);
	}

	.magnify-icon {
		font-size: 0.9em;
		width: 1.8em;
	}

	.btn-icon-magnify {
		@apply btn magnify-icon aspect-square  rounded-full;
	}
</style>
