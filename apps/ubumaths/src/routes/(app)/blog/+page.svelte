<script>
	export let data
</script>

{#if data.posts}
	{#each data.posts as post}
		<div>
			<a href="/post/{post.id}"><h3>{post.title}</h3></a>
			{post.summary}
		</div>
	{/each}
{:else}
	No posts
{/if}
