<script lang="ts">
	// import Spinner from './Spinner.svelte'
	import Question from './Question.svelte'
	import { formatToHtml } from '$lib/stores'
	import { formatToLatex } from '$lib/utils'
	import { mdc_colors } from '$lib/colors'
	import type { CorrectedQuestion } from '$lib/type'

	export let toggleFlip = () => {}
	export let card: CorrectedQuestion
	export let showDescription = false
	export let height = 0
	export let width = 0
	export let h = 0
	export let w = 0
	export let masked = false
	export let interactive = false
	// export let commit = null
	export let correction = false
	export let simpleCorrection = card.simpleCorrection
	export let detailedCorrection = card.detailedCorrection
	export let immediateCommit = false
	export let flashcard = false

	$: description = $formatToHtml(formatToLatex(card.description))
	$: subdescription = $formatToHtml(formatToLatex(card.subdescription))
	$: if (!masked)
		console.log('front card detailedCorrection', card.num, detailedCorrection)
</script>

<div bind:clientHeight={h} bind:clientWidth={w} class={`${$$props.class}`}>
	<div
		class="card variant-filled-soft p-4 flex flex-col  justify-between"
		style={height ? `height:${height}px;` : width ? `width:${width}px;` : ''}
	>
		{#if showDescription}
			<header class="header flex items-center justify-between">
				<div class="flex justify-left items-center">
					<div style="margin-left:3rem">
						<span class="relative" style={'color:var(--mdc-theme-primary'}>
							{@html $formatToHtml(description)}
						</span>

						{#if subdescription}
							<span class="relative" style={'color:var(--mdc-theme-on-surface'}
								>{@html $formatToHtml(subdescription)}</span
							>
						{/if}
					</div>
					<button
						on:click={() => (correction = !correction)}
						class={correction
							? 'variant-filled-primary'
							: 'variant-filled-secondary'}>C</button
					>
					<button
						on:click={() => (interactive = !interactive)}
						class={correction
							? 'variant-filled-primary'
							: 'variant-filled-secondary'}>I</button
					>
				</div>
				<span>{card.id}</span>
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
			{immediateCommit}
		/>

		{#if flashcard}
			<footer class="footer flex justify-end">
				<button on:click={toggleFlip} class="btn-icon variant-filled-primary"
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
