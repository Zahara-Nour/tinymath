<script lang="ts">
	import type { Hst } from '@histoire/plugin-svelte'
	export let Hst: Hst
</script>

<Hst.Story title="Cars" layout={{ type: 'grid', width: 200 }}>
	<Hst.Variant title="default">🚗</Hst.Variant>
	<Hst.Variant title="Fast">🏎️</Hst.Variant>
	<Hst.Variant title="Slow">🚜</Hst.Variant>
</Hst.Story>
