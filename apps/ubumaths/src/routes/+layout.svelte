<script lang="ts">
	// import '@skeletonlabs/skeleton/themes/theme-hamlindigo.css';
	import '../theme.postcss'
	import '@skeletonlabs/skeleton/styles/all.css'
	import '../app.postcss'
	import { page } from '$app/stores'
	import { AppShell } from '@skeletonlabs/skeleton'
	import { prepareMathlive } from '$lib/stores'
	import TobBar from '$lib/ui/TobBar.svelte'
	import links from '$lib/navlinks'
	import PageHeader from '$lib/ui/PageHeader.svelte'
	import Footer from '$lib/ui/Footer.svelte'

	prepareMathlive()
	let header = ''

	function setPageHeader(url: string) {
		const link = links.find((l) => url.includes(l.url))
		header = link ? link.text : ''
	}

	type ScrollEvent = UIEvent & { currentTarget: EventTarget & HTMLDivElement }
	function scrollHandler(event: Event) {
		// console.log((event as ScrollEvent).currentTarget.scrollTop)
	}

	$: setPageHeader($page.url.pathname)
</script>

<AppShell on:scroll={scrollHandler}>
	<svelte:fragment slot="header">
		<TobBar />
	</svelte:fragment>
	<svelte:fragment slot="sidebarLeft">
		<div id="sidebar-left" class="hidden lg:block">Sidebar Left</div>
	</svelte:fragment>
	<svelte:fragment slot="sidebarRight">
		<div id="sidebar-left" class="hidden lg:block">Sidebar Right</div>
	</svelte:fragment>
	<svelte:fragment slot="pageHeader"
		><PageHeader title={header} /></svelte:fragment
	>
	<!-- Router Slot -->
	<slot />
	<!-- ---- / ---- -->
	<svelte:fragment slot="pageFooter">Page Footer</svelte:fragment>
	<svelte:fragment slot="footer"><Footer /></svelte:fragment>
</AppShell>

<svelte:head>
	<title>UbuMaths - Les maths de la chandelle verte</title>
	<meta />
</svelte:head>
