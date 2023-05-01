<script>
	import Post from '$lib/ui/Post.svelte'

	export let data
</script>

<div class="container mx-auto p-4 max-w-screen-md">
	{#if data.post}
		<Post post={data.post} />
	{:else}
		No post
	{/if}
</div>
