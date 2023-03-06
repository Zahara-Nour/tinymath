<script lang="ts">
	export let n: number
	export let status = ''
</script>

<button
	class={'btn h-20 w-20 size text-6xl flex items-center justify-center font-bold ' +
		(status === 'selected'
			? 'variant-filled-primary'
			: status === 'selected-third'
			? 'variant-filled-secondary'
			: 'variant-filled-surface')}
	style="font-family:'Baloo 2', sans-serif;"
	on:click
	disabled={status === 'not_available'}
>
	{n}
</button>
