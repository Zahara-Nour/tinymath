<script>
	import { fullScreen } from '$lib/stores'
	import PageHeader from '$lib/ui/PageHeader.svelte'
	import Trio from './Trio.svelte'
</script>

{#if !$fullScreen}
	<PageHeader title="Trio" />
{/if}
<Trio />
