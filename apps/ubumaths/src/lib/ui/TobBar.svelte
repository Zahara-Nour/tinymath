<script lang="ts">
	import { AppBar } from '@skeletonlabs/skeleton'
	import { LightSwitch } from '@skeletonlabs/skeleton'
	import { fontSize } from '$lib/stores'
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
		<img src="/images/gidouille.png" alt="gidouille" class="w-8 mr-4" />

		<div class="inline-block">
			<a href="/">
				<strong
					class="hidden lg:text-xl lg:inline-block lg:text-primary-500 lg:mr-6 lg:uppercase"
					style="font-family: 'Baloo 2', sans-serif;">Ubumaths</strong
				>
			</a>
		</div>
	</svelte:fragment>
	<svelte:fragment slot="trail">
		<LightSwitch />
		<UserAvatar />

		<button on:click={decrease} class="text-xl btn-icon variant-filled-primary"
			><IconDecrease /></button
		>
		<button on:click={increase} class="text-xl btn-icon variant-filled-primary"
			><IconIncrease /></button
		>

		<Burger class=" btn btn-sm mr-4 lg:hidden" handleClick={drawerOpen} />
	</svelte:fragment>
</AppBar>

<style lang="postcss">
	.active {
		@apply border-b-4 border-primary-500;
	}
</style>
