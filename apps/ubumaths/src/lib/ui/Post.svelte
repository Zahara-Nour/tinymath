<script lang="ts">
	import { formatLatexToHtml } from '$lib/stores'
	import SEO from '$lib/components/Seo.svelte'
	import type { Post } from '../../types/type'
	import banner from '$lib/images/banner-raconte.jpg'
	export let post: Post
	const { title, content, metadescription } = post
</script>

<SEO article {title} {metadescription} />

<div class="bg-white">
	<img
		src={banner}
		alt="Raconte-moi les maths"
		class="max-h-40 max-w-full m-auto"
	/>
</div>
<div class="container mx-auto p-4 max-w-screen-md">
	<h1 class="mb-6">{title}</h1>
	<div>
		{@html $formatLatexToHtml(content)}
	</div>
</div>

<style lang="postcss">
	div :global(p) {
		@apply my-2;
	}

	div :global(.iframe-wrapper) {
		@apply flex justify-center my-6;
	}

	.container div :global(img) {
		margin-left: auto;
		margin-right: auto;
		max-width: 350px;
		max-height: 350px;
		@apply my-6;
	}
</style>
