<script lang="ts">
	import { DateTime } from 'luxon'
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
			<footer class="card-footer flex">
				<div class="flex-grow" />
				<div class="flex flex-col justify-end gap-2">
					<div>
						<span class="text-xs text-primary-500-400-token"
							>Publié :
						</span><span class="text-xs text-tertiary-500-400-token"
							>{DateTime.fromSQL(
								post.published_at.replace(/T/, ' '),
							).toLocaleString(DateTime.DATE_FULL)}</span
						>
					</div>
					<div>
						<span class="text-xs text-primary-500-400-token"
							>Mise-à-jour :
						</span><span class="text-xs text-tertiary-500-400-token"
							>{DateTime.fromSQL(
								post.updated_at.replace(/T/, ' '),
							).toLocaleString(DateTime.DATE_FULL)}</span
						>
					</div>
				</div>
			</footer>
		</div>
	{/each}
{:else}
	No posts
{/if}
