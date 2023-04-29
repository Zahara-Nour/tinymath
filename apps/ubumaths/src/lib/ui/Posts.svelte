<script lang="ts">
	import type { Post } from '../../types/type'
	export let posts: Post[]
</script>

{#if posts}
	{#each posts as post}
		<div class="block card p-3 my-6 card-hover">
			<header class="card-header">
				<a href="/post/{post.id}">
					<h3>{post.title}</h3>
				</a>
			</header>
			<section class="p-4">{post.summary}</section>
			<footer class="card-footer">
				<div class="flex justify-end gap-2">
					<span>Publié :</span>
					<span>Mise-à-jour :</span>
				</div>
			</footer>
		</div>
	{/each}
{:else}
	No posts
{/if}
