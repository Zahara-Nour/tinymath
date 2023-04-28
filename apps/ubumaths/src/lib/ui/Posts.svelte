<script lang="ts">
	import type { Post } from '../../types/type'
	export let posts: Post[]
</script>

{#if posts}
	{#each posts as post}
		<div>
			<a href="/post/{post.id}">
				<h3>{post.title}</h3>
			</a>
			{post.summary}
		</div>
	{/each}
{:else}
	No posts
{/if}
