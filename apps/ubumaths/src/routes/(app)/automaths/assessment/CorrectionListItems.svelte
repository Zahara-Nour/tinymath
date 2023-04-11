<script lang="ts">
	import { correct_color, incorrect_color, unoptimal_color } from '$lib/colors'
	import {
		STATUS_CORRECT,
		STATUS_UNOPTIMAL_FORM,
	} from '$lib/questions/correction'
	import type { CorrectedQuestion } from '../../../types/type'
	import CorrectionItem from '$lib/ui/CorrectionItem.svelte'

	export let items: CorrectedQuestion[]
</script>

{#each items as item}
	{@const color =
		item.status === STATUS_CORRECT
			? correct_color
			: item.status === STATUS_UNOPTIMAL_FORM
			? unoptimal_color
			: incorrect_color}
	<div class="w-full flex justify-start items-start mb-5">
		<div
			class="relative mr-0"
			style={`font-family:'pacifico';color:white;background:${color}; border-radius: 50%;width:2.5em; height:2.5em`}
		>
			<span
				class="absolute"
				style="font-size:1.8em;display:inline-block; top: 50%;left: 50%;transform: translate(-50%, -60%);margin: 0;"
			>
				{item.num}
			</span>
		</div>
		<CorrectionItem {item} />
	</div>
{/each}
