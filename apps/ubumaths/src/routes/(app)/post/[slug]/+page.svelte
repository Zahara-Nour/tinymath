<script>
	import Post from '$lib/ui/Post.svelte'

	export let data
</script>

{#if data.post}
	<Post post={data.post} />
{:else}
	No post
{/if}
