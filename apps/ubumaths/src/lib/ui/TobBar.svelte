<script lang="ts">
	import { AppBar, popup } from '@skeletonlabs/skeleton'
	import { LightSwitch } from '@skeletonlabs/skeleton'
	import { fontSize } from '$lib/stores'
	import links from '$lib/navlinks'
	import { page } from '$app/stores'
	import { get } from 'svelte/store'
	import Burger from './Burger.svelte'
	import UserAvatar from './UserAvatar.svelte'
	import IconIncrease from '$lib/icones/IconIncrease.svelte'
	import IconDecrease from '$lib/icones/IconDecrease.svelte'

	export let drawerOpen: () => void

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
		<Burger handleClick={drawerOpen} />
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
				<div>
					<a
						use:popup={{
							event: 'hover',
							target: link.text,
							placement: 'bottom',
						}}
						class:active
						class="px-2 mx-2 pb-2"
						href={link.url}
					>
						{link.text}
					</a>
					<div
						class="text-xs text-center card variant-filled-primary p-2 whitespace-nowrap shadow-xl"
						data-popup={link.text}
					>
						{link.tooltip}
						<!-- Arrow -->
						<div class="arrow variant-filled-primary" />
					</div>
				</div>
			{/each}
		</div>
	</svelte:fragment>
	<svelte:fragment slot="trail">
		<UserAvatar />

		<button on:click={decrease} class="text-xl btn-icon variant-filled-primary"
			><IconDecrease /></button
		>
		<button on:click={increase} class="text-xl btn-icon variant-filled-primary"
			><IconIncrease /></button
		>
		<LightSwitch />
	</svelte:fragment>
</AppBar>

<style lang="postcss">
	.active {
		@apply border-b-4 border-primary-500;
	}
</style>
