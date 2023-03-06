<script lang="ts">
	export let n: number
	export let status = ''
</script>

<button
	class={'btn my-1 h-24 w-24 size text-3xl flex items-center justify-center ' +
		(status === 'selected'
			? 'variant-filled-primary'
			: 'variant-filled-surface')}
	on:click
	disabled={status === 'not_available'}
>
	{n}
</button>
