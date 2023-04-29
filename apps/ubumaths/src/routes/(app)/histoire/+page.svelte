<script>
	import Posts from '$lib/ui/Posts.svelte'
	export let data
</script>

<div class="container mx-auto p-4 max-w-screen-md">
	<Posts posts={data.posts} />
</div>
