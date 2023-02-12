<script lang="ts">
	import Button from '$lib/Button.svelte'
	import type { Hst } from '@histoire/plugin-svelte'
	export let Hst: Hst
</script>

<Hst.Story title="Cars" layout={{ type: 'grid', width: 200 }}>
	<Hst.Variant title="default">🚗</Hst.Variant>
	<Hst.Variant title="Fast">🏎️</Hst.Variant>
	<Hst.Variant title="Slow">🚜</Hst.Variant>
</Hst.Story>
<h1>Welcome to your library project</h1>
<p>
	Create your package using @sveltejs/package and preview/showcase your work
	with SvelteKit
</p>
<p>
	Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation
</p>
<Button />
