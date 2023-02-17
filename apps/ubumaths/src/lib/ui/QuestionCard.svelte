<script lang="ts">
	import BackCard from './BackCard.svelte'
	import FrontCard from './FrontCard.svelte'
	// import { fontSize } from '$lib/stores'
	import type { CorrectedQuestion } from '$lib/type'

	export let card: CorrectedQuestion
	export let interactive = false
	export let flashcard = false
	export let showDescription = false
	export let correction = false
	export let immediateCommit = false

	let updatedFlashCard = flashcard

	let flip = false
	const toggleFlip = () => (flip = !flip)

	let hfront_masked = 0 // height front masked
	let hback_masked = 0 // width back masked

	let height: number // height for displayed card
	let width = 0

	let simpleCorrection = card.simpleCorrection
	let detailedCorrection = card.detailedCorrection

	async function updateHeight() {
		// console.log('updateHeight')npm
		height = Math.max(hfront_masked, hback_masked)
		// console.log('updated height', height)
		// console.log('height', height)
	}

	// TODO: a revoir
	// $: if (card) {
	// 	updatedFlashCard =
	// 		flashcard === null
	// 			? (correction &&
	// 					!!card.correctionDetails &&
	// 					!!card.correctionDetails.length) ||
	// 			  (!interactive && !correction)
	// 			: flashcard
	// }

	// $: console.log('interactive', interactive)
	// $: console.log('correction', correction)
	// $: console.log('flashcard', updatedFlashCard)

	$: if (card) {
		// console.log('changing card')
		flip = false
	}

	// $: console.log('hback_masked', hback_masked)
	// $: console.log('hfront_masked', hfront_masked)
	// $: console.log('height', height)
	// $: if (updatedFlashCard && hfront_masked && hback_masked) {
	// 	updateHeight()
	// }

	// $: if (!updatedFlashCard && hfront_masked) {
	// 	updateHeight()
	// }

	$: if (hfront_masked || hback_masked) {
		updateHeight()
	}

	// $: if ($fontSize) {
	// 	// console.log('changing size')
	// 	height = 0
	// }

	$: console.log('updatedFlashCard', updatedFlashCard)
	$: console.log(
		'QuestionCard detailedCorrection',
		card.num,
		detailedCorrection,
	)
</script>

<div
	class={`card ${$$props.class}`}
	style={height ? `height:${height}px;` : ''}
>
	<div class="flipper" class:flip style={height ? 'height:100%;' : ''}>
		<div class="front" style={height ? 'height:100%' : ''}>
			<FrontCard
				{card}
				{toggleFlip}
				flashcard={updatedFlashCard}
				{showDescription}
				{height}
				bind:interactive
				bind:correction
				bind:w={width}
				bind:simpleCorrection
				bind:detailedCorrection
				{immediateCommit}
			/>
		</div>
		{#if updatedFlashCard}
			<div class="back" style={height ? 'height:100%;' : ''}>
				<BackCard
					{card}
					{toggleFlip}
					{height}
					{correction}
					{simpleCorrection}
					{detailedCorrection}
				/>
			</div>
		{/if}
	</div>
</div>

<div
	class="absolute"
	style={(width ? `width:${width}px;` : '') + 'top:-100%;left:-100000%;'}
>
	<!-- <div > -->
	<FrontCard
		{card}
		flashcard={updatedFlashCard}
		{showDescription}
		bind:h={hfront_masked}
		masked={true}
		{interactive}
		{correction}
		{immediateCommit}
	/>

	{#if updatedFlashCard}
		<BackCard
			{card}
			bind:h={hback_masked}
			masked={true}
			{correction}
			{simpleCorrection}
			{detailedCorrection}
		/>
	{/if}
</div>

<style>
	.card {
		width: 100%;
		height: 100%;
		perspective: 1000px;
	}

	.flip {
		transform: rotateY(180deg);
	}

	.flipper {
		transition: 0.6s;
		transform-style: preserve-3d;
		height: 100%;
		position: relative;
		width: 100%;
	}

	/* hide back of pane during swap */
	.front,
	.back {
		-webkit-backface-visibility: hidden;
		backface-visibility: hidden;
		height: 100%;
		width: 100%;
		position: absolute;
		top: 0;
		left: 0;
	}

	/* front pane, placed above back */
	.front {
		z-index: 2;
		/* for firefox 31 */
		transform: rotateY(0deg);
	}

	/* back, initially hidden pane */
	.back {
		transform: rotateY(180deg);
	}
</style>
