<script lang="ts">
	// import '@skeletonlabs/skeleton/themes/theme-hamlindigo.css';
	import '../theme.postcss'
	import '@skeletonlabs/skeleton/styles/all.css'
	import '../app.postcss'
	import { page } from '$app/stores'
	import { AppShell } from '@skeletonlabs/skeleton'
	import { prepareMathlive, touchDevice } from '$lib/stores'
	import TobBar from '$lib/ui/TobBar.svelte'
	import links from '$lib/navlinks'
	import PageHeader from '$lib/ui/PageHeader.svelte'
	import Footer from '$lib/ui/Footer.svelte'
	import Navigation from '$lib/ui/Navigation.svelte'
	import { Drawer, drawerStore } from '@skeletonlabs/skeleton'
	import { onMount } from 'svelte'
	import { getLogger } from '$lib/utils'
	import { supabaseClient } from '$lib/supabaseClients'
	import { invalidate, invalidateAll } from '$app/navigation'
	import type { PageData } from './$types'
	import {
		computePosition,
		autoUpdate,
		flip,
		shift,
		offset,
		arrow,
	} from '@floating-ui/dom'
	import { storePopup } from '@skeletonlabs/skeleton'

	type ScrollEvent = UIEvent & { currentTarget: EventTarget & HTMLDivElement }

	export let data: PageData

	let { info, fail, warn } = getLogger('Automaths', 'info')
	let header = ''

	onMount(() => {
		// import dynamic de mathlive
		prepareMathlive()

		// detects a touche screen device at the first touch
		//  https://codeburst.io/the-only-way-to-detect-touch-with-javascript-7791a3346685
		window.addEventListener(
			'touchstart',
			function onFirstTouch() {
				touchDevice.set(true)
				window.removeEventListener('touchstart', onFirstTouch, false)
				info('Touch device detected.')
			},
			false,
		)

		// Synchronizing the page store
		// Every PageLoad or LayoutLoad using getSupabase() will update when invalidate('supabase:auth') is called.
		// If some data is not updated on signin/signout you can fall back to invalidateAll().
		const {
			data: { subscription },
		} = supabaseClient.auth.onAuthStateChange(() => {
			invalidateAll()
		})

		return () => {
			subscription.unsubscribe()
		}
	})

	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow })

	$: url = $page.url.pathname
	$: setPageHeader(url)

	function setPageHeader(url: string) {
		const link = links.find((l) => url.includes(l.url))
		header = link ? link.text : ''
	}

	function scrollHandler(event: Event) {
		// console.log((event as ScrollEvent).currentTarget.scrollTop)
	}

	function drawerOpen(): void {
		drawerStore.open({})
	}

	function drawerClose(): void {
		drawerStore.close()
	}
</script>

<Drawer><Navigation {drawerClose} /></Drawer>

<AppShell on:scroll={scrollHandler}>
	<svelte:fragment slot="header">
		<TobBar {drawerOpen} session={data.session} />
	</svelte:fragment>
	<svelte:fragment slot="sidebarLeft">
		{#if !url.includes('assessment')}
			<div id="sidebar-left" class="hidden lg:block lg:w-60">
				<Navigation />
			</div>
		{/if}
	</svelte:fragment>
	<svelte:fragment slot="sidebarRight">
		<div id="sidebar-left" class="hidden lg:block" />
	</svelte:fragment>
	<svelte:fragment slot="pageHeader"
		><PageHeader title={header} /></svelte:fragment
	>
	<!-- Router Slot -->
	<slot />
	<!-- ---- / ---- -->
	<svelte:fragment slot="pageFooter" />
	<svelte:fragment slot="footer">
		{#if url === '/'}
			<Footer />
		{/if}
	</svelte:fragment>
</AppShell>

<svelte:head>
	<title>UbuMaths - Les maths de la chandelle verte</title>
	<meta />
</svelte:head>
