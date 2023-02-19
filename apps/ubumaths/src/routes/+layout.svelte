<script>
	// import '@skeletonlabs/skeleton/themes/theme-hamlindigo.css';
	import '../theme.postcss'
	import '@skeletonlabs/skeleton/styles/all.css'
	import '../app.postcss'

	import { AppShell, AppBar, tooltip } from '@skeletonlabs/skeleton'
	import { LightSwitch } from '@skeletonlabs/skeleton'
	import { fontSize, prepareMathlive } from '$lib/stores'
	import links from '$lib/navlinks'
	import { page } from '$app/stores'
	import { get } from 'svelte/store'

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
	prepareMathlive()
</script>

<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				<img src="/images/gidouille.png" alt="gidouille" class="w-8 mr-2" />
				<div class="inline-block">
					<a href="/">
						<strong class="text-xl uppercase text-primary-500 mr-6"
							>Ubumaths</strong
						>
					</a>
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
				<button
					on:click={decrease}
					class="text-xl btn-icon variant-filled-primary"
					><iconify-icon icon="mdi:format-font-size-decrease" /></button
				>
				<button
					on:click={increase}
					class="text-xl btn-icon variant-filled-primary"
					><iconify-icon icon="mdi:format-font-size-increase" /></button
				>
				<LightSwitch />
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<!-- Page Route Content -->

	<slot />
</AppShell>

<svelte:head>
	<title>UbuMaths - Les maths de la chandelle verte</title>
	<meta />
</svelte:head>

<style lang="postcss">
	.active {
		@apply border-b-4 border-primary-500;
	}
</style>
