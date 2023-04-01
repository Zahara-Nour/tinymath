<script lang="ts">
	import type { CorrectedQuestion } from '../../types/type'
	import QuestionCard from './QuestionCard.svelte'
	export let item: CorrectedQuestion

	const { simpleCorrection: correction, coms } = item
</script>

<div class="ml-3 grow flex flex-wrap ">
	<div
		class="mr-3 mb-4 w-full"
		style="word-break: break-word ;min-width: 100px; white-space: normal;"
	>
		<QuestionCard
			card={item}
			correction={true}
			flashcard={!!item.correctionDetails}
		/>
	</div>
	<div>
		{#if coms.length}
			{#each coms as com}
				<div class=" mb-1 relative" style="font-family: 'Handlee', cursive;">
					{@html com}
				</div>
			{/each}
		{/if}
	</div>
</div>
