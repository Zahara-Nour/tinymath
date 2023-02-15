<script lang="ts">
	import type { Hst } from '@histoire/plugin-svelte'
	export let Hst: Hst
	import CorrectionLine from '$lib/ui/CorrectionLine.svelte'
</script>

<Hst.Story>
	<CorrectionLine line={'Texte'} />
</Hst.Story>
