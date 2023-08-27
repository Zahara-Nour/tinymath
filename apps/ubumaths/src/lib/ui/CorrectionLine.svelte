<script lang="ts">
	import { correct_color } from '$lib/stores'
	import type { Line } from '../../types/type'
	export let line: Line

	const classBadgeCorrect =
		'badge-icon variant-filled-success absolute -top-4 -right-2 z-10 text-success-500'
	const classBadgeIncorrect =
		'badge-icon variant-filled-error absolute -top-4 -right-2 z-10 text-error-500'

	const classAnswerSolution = 'p-2 border-4 border-success-500 rounded-lg'
	const classAnswerNotSolution = 'p-2 border-4 border-grey-500 rounded-lg'
</script>

{#if line}
	{#if typeof line === 'object'}
		{#if line.html}
			<span style="word-break:break-word;white-space:normal;">
				{@html line.html}
			</span>
		{:else if line.choices}
			{#each line.choices as choice, i}
				<div class="mx-2 relative inline-block">
					{#if choice.badge}
						<span
							class={choice.badge === 'correct'
								? classBadgeCorrect
								: classBadgeIncorrect}
							><span
								class={choice.badge === 'correct'
									? 'text-success-500'
									: 'text-error-500'}>..</span
							></span
						>
					{/if}
					<span
						class={choice.solution
							? classAnswerSolution
							: classAnswerNotSolution}
					>
						{#if choice.html}
							{@html choice.html}
						{:else if choice.image}
							<img src={choice.image} alt={`choice ${i}`} />
						{/if}
					</span>
				</div>
			{/each}
		{/if}
	{:else}
		<span
			style="display:inline-block;word-break:break-word;white-space:normal;"
		>
			{@html line}
		</span>
	{/if}
{/if}
