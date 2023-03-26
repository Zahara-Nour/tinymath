<script lang="ts">
	// import '@skeletonlabs/skeleton/themes/theme-hamlindigo.css';
	import '../theme.postcss'
	import '@skeletonlabs/skeleton/styles/all.css'
	import '../app.postcss'
	import { page } from '$app/stores'
	import { AppShell, Modal, Toast, toastStore } from '@skeletonlabs/skeleton'
	import {
		connected,
		fullScreen,
		prepareMathlive,
		touchDevice,
		user,
	} from '$lib/stores'
	import TobBar from '$lib/ui/TobBar.svelte'
	import links from '$lib/navlinks'
	import Footer from '$lib/ui/Footer.svelte'
	import Navigation from '$lib/ui/Navigation.svelte'
	import { Drawer, drawerStore } from '@skeletonlabs/skeleton'
	import { onMount } from 'svelte'
	import { getLogger, isEmptyObject } from '$lib/utils'
	import { invalidate } from '$app/navigation'
	import type { LayoutData, PageData } from './$types'
	import {
		computePosition,
		autoUpdate,
		flip,
		shift,
		offset,
		arrow,
	} from '@floating-ui/dom'
	import { storePopup } from '@skeletonlabs/skeleton'
	import type { Session } from '@supabase/supabase-js'
	import { createUser, guest } from '$lib/users'
	import IconFullscreen from '$lib/icones/IconFullscreen.svelte'
	import { isStudent } from '$lib/type'

	type ScrollEvent = UIEvent & { currentTarget: EventTarget & HTMLDivElement }

	export let data: LayoutData

	let { info, fail, warn } = getLogger('Layout', 'info')
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
		// The usage of invalidate tells sveltekit that the root +layout.ts load function should be executed whenever the session updates to keep the page store in sync.
		// If some data is not updated on signin/signout you can fall back to invalidateAll().
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(() => {
			invalidate('supabase:auth')
		})

		return () => subscription.unsubscribe()
	})

	// poper store initialized with Floating UI
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow })

	$: ({ supabase } = data)
	$: url = $page.url.pathname
	$: setPageHeader(url)
	$: manageSession(data.session)

	function setPageHeader(url: string) {
		const link = links.find((l) => url.includes(l.url))
		header = link ? link.text : ''
	}

	function manageSession(session: Session | null) {
		console.log('session', session)
		console.log('userProfile', data.userProfile)
		data.errors.forEach((error) =>
			toastStore.trigger({
				message: error,
				background: 'bg-error-500',
			}),
		)

		if (session) {
			if (data.userProfile.role !== 'guest') {
				toastStore.trigger({
					message: `Bienvenue ${
						data.userProfile.firstname || data.userProfile.email
					}`,
					background: 'bg-success-500',
				})
				info(`User ${data.userProfile.email} signed in.`)
			}
		} else {
			// Signed out
			if (!$user.isGuest()) {
				info(`User ${$user.firstname || $user.email} signed out.`)
				toastStore.trigger({
					message: `Bye ${
						data.userProfile.firstname || data.userProfile.email
					}`,
					background: 'bg-success-500',
				})
			}
		}
		user.set(createUser(data.userProfile))
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

<svelte:head>
	<title>UbuMaths - Les maths de la chandelle verte</title>
	<meta />
</svelte:head>

<Drawer><Navigation {drawerClose} /></Drawer>

<AppShell
	on:scroll={scrollHandler}
	slotSidebarLeft="bg-surface-100-800-token"
	regionPage="relative"
	slotPageHeader="sticky top-0 z-10"
>
	<svelte:fragment slot="header">
		{#if !url.includes('dashboard') && !$fullScreen}
			<TobBar {drawerOpen} />
		{/if}
	</svelte:fragment>
	<svelte:fragment slot="sidebarLeft">
		{#if !url.includes('assessment') && !url.includes('dashboard') && !$fullScreen}
			<div id="sidebar-left" class="hidden lg:block lg:w-60">
				<Navigation />
			</div>
		{/if}
	</svelte:fragment>
	<svelte:fragment slot="sidebarRight">
		<div id="sidebar-left" class="hidden lg:block" />
	</svelte:fragment>
	<svelte:fragment slot="pageHeader">
		<div>
			{#if $fullScreen}
				<button
					class="btn-icon variant-filled-primary"
					on:click={() => fullScreen.update((state) => !state)}
				>
					<IconFullscreen />
				</button>
			{/if}
			{#if isStudent($user) && $user.assignments?.length && !url.includes('assessment') && !url.includes('dashboard')}
				<div class="p-4 bg-error-500 text-white">
					Tu as <a href="/dashboard">des évaluations</a> à faire !
				</div>
			{/if}
		</div>
	</svelte:fragment>

	<!-- Router Slot -->

	<slot />
	<!-- ---- / ---- -->
	<svelte:fragment slot="pageFooter" />
	<svelte:fragment slot="footer">
		{#if url === '/' && !$fullScreen}
			<Footer />
		{/if}
	</svelte:fragment>
</AppShell>

<Toast />
<Modal />
