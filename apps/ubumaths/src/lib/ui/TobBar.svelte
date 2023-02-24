<script lang="ts">
	import { AppBar, Avatar, tooltip } from '@skeletonlabs/skeleton'
	import { LightSwitch } from '@skeletonlabs/skeleton'
	import { fontSize } from '$lib/stores'
	import links from '$lib/navlinks'
	import { page } from '$app/stores'
	import { get } from 'svelte/store'
	import type { Session } from '@supabase/supabase-js'

	export let drawerOpen: () => void
	export let session: Session | null

	$: if (session) console.log('session', session.user.user_metadata.avatar_url)

	function increase() {
		const newSize = get(fontSize) + 1
		fontSize.set(newSize)
		document.getElementsByTagName('html')[0].style.fontSize = `${newSize}px`
	}

	function decrease() {
		const newSize = get(fontSize) - 1
		fontSize.set(newSize)
		document.getElementsByTagName('html')[0].style.fontSize = `${newSize}px`
	}
</script>

<AppBar class="shadow-2xl">
	<svelte:fragment slot="lead">
		<img
			src="/images/gidouille.png"
			alt="gidouille"
			class="hidden lg:inline-block lg:w-8 lg:mr-4"
		/>
		<button class="lg:hidden btn btn-sm mr-4" on:click={drawerOpen}>
			<span>
				<svg viewBox="0 0 100 80" class="fill-token w-4 h-4">
					<rect width="100" height="20" />
					<rect y="30" width="100" height="20" />
					<rect y="60" width="100" height="20" />
				</svg>
			</span>
		</button>
		<div class="inline-block">
			<a href="/">
				<strong
					class="text-xl text-primary-500 mr-6 uppercase"
					style="font-family: 'Baloo 2', sans-serif;">Ubumaths</strong
				>
			</a>
		</div>
		<div class="hidden lg:inline-block">
			{#each links as link}
				{@const active = $page.url.pathname.includes(link.url)}
				<a
					use:tooltip={{
						content: link.tooltip,
						position: 'bottom',
					}}
					class:active
					class="px-2 mx-2 pb-2"
					href={link.url}
				>
					{link.text}
				</a>
			{/each}
		</div>
	</svelte:fragment>
	<svelte:fragment slot="trail">
		{#if session}
			<Avatar
				border="border-4 border-surface-300-600-token hover:!border-primary-500"
				cursor="cursor-pointer"
				src={session.user.user_metadata.avatar_url}
			/>
		{/if}
		<button on:click={decrease} class="text-xl btn-icon variant-filled-primary"
			><iconify-icon icon="mdi:format-font-size-decrease" /></button
		>
		<button on:click={increase} class="text-xl btn-icon variant-filled-primary"
			><iconify-icon icon="mdi:format-font-size-increase" /></button
		>
		<LightSwitch />
	</svelte:fragment>
</AppBar>

<style lang="postcss">
	.active {
		@apply border-b-4 border-primary-500;
	}
</style>
