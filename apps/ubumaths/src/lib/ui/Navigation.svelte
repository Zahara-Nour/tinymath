<script lang="ts">
	import links from '$lib/navlinks'
	import { page } from '$app/stores'

	export let drawerClose = () => {}
</script>

<nav class="list-nav p-4">
	<ul>
		{#each links as link}
			{@const active = $page.url.pathname.includes(link.url)}
			<li>
				<a href={link.url} on:click={drawerClose}>
					<span class:active class="px-2">{link.text}</span>
				</a>
			</li>
		{/each}
	</ul>
</nav>

<style lang="postcss">
	.active {
		@apply border-b-4 rounded-none border-primary-500;
	}
</style>
