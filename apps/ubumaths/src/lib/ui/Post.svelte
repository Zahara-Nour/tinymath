<script lang="ts">
	import SEO from '$lib/components/Seo.svelte'
	import type { Post } from '../../types/type'
	export let post: Post
	const { title, content, metadescription } = post
</script>

<SEO article {title} {metadescription} />

<div class="container mx-auto p-4">
	<h1 class="mb-6">{title}</h1>
	<div>
		{@html content}
	</div>
</div>

<style lang="postcss">
	div :global(p) {
		@apply my-2;
	}

	div :global(.iframe-wrapper) {
		@apply flex justify-center my-6;
	}
</style>
