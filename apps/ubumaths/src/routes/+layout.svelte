<script lang="ts">
	// import '@skeletonlabs/skeleton/themes/theme-hamlindigo.css';
	import '../theme.postcss'
	import '@skeletonlabs/skeleton/styles/all.css'
	import '../app.postcss'
	import { page } from '$app/stores'
	import {
		AppShell,
		Modal,
		Toast,
		toastStore,
		type ToastSettings,
	} from '@skeletonlabs/skeleton'
	import {
		connected,
		guest,
		prepareMathlive,
		touchDevice,
		user,
	} from '$lib/stores'
	import TobBar from '$lib/ui/TobBar.svelte'
	import links from '$lib/navlinks'
	import PageHeader from '$lib/ui/PageHeader.svelte'
	import Footer from '$lib/ui/Footer.svelte'
	import Navigation from '$lib/ui/Navigation.svelte'
	import { Drawer, drawerStore } from '@skeletonlabs/skeleton'
	import { onMount } from 'svelte'
	import { getLogger, isEmptyObject } from '$lib/utils'
	import {
		addUser,
		fetchClassStudentsIdsNames,
		fetchUserClassIdsNames,
		getUserByEmail,
		supabaseClient,
		updateUserInfo,
	} from '$lib/db'
	import { goto, invalidate, invalidateAll } from '$app/navigation'
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
	import type { Session } from '@supabase/supabase-js'
	import type { ExtraInfo, User, UserProfile } from '$lib/type'
	import { createUser } from '$lib/users'

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

	// poper store initialized with Floating UI
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow })

	$: url = $page.url.pathname
	$: setPageHeader(url)
	$: authorize(data.session)

	function setPageHeader(url: string) {
		const link = links.find((l) => url.includes(l.url))
		header = link ? link.text : ''
	}

	async function authorize(session: Session | null) {
		if (session && $user.isGuest()) {
			info('User is signed in.')

			console.log('session', session)

			if (
				!session.user.email?.includes('voltairedoha.com') &&
				session.user.email !== 'zahara.alnour@gmail.com'
			) {
				toastStore.trigger({
					message:
						"Désolé mais Ubumaths est réservé pour l'instant aux élèves du lycée Voltaire de Doha.",
					background: 'bg-error-500',
				})
				supabaseClient.auth.signOut()
			} else {
				// get user data from supabase
				const { data, error } = await getUserByEmail(session.user.email)

				if (error) {
					fail(error.message)
					toastStore.trigger({
						message: "Les données utilisateurs n'ont pu être récupérées.",
						background: 'bg-error-500',
					})
				} else if (!data) {
					toastStore.trigger({
						message:
							"Le compte n'existe pas. Il faut demander à M. Le Jolly de le créer.",
						background: 'bg-error-500',
					})
				} else {
					// update user data in supabase
					const extraInfo: ExtraInfo = {}
					if (!data.firstname && session.user.user_metadata.firstname)
						extraInfo.firstname = session.user.user_metadata.firstname
					if (!data.lastname && session.user.user_metadata.lastname)
						extraInfo.lastname = session.user.user_metadata.firstname
					if (!data.fullname && session.user.user_metadata.full_name)
						extraInfo.fullname = session.user.user_metadata.full_name
					if (!data.user_id) extraInfo.user_id = session.user.id
					console.log('extra info', extraInfo, 'data', data, 'session', session)
					if (!isEmptyObject(extraInfo)) {
						console.log('updating user info', extraInfo, data.id)
						// const result = await updateUserInfo(data.id, extraInfo)
						const { error } = await updateUserInfo(data.id, extraInfo)
						if (error) {
							warn(error.message)
							toastStore.trigger({
								message: "Les données utilisateurs n'ont pu être mises à jour.",
								background: 'bg-warning-500',
							})
						}
					}

					// fetch user classes
					const { data: dataUserClasses, error } = await fetchUserClassIdsNames(
						data.id,
					)
					let classIdsNames: { className: string; id: number }[] = []
					if (error || !dataUserClasses) {
						warn(error?.message || 'no data returned for user classes')
						toastStore.trigger({
							message: "Les classes de l'utilisateur n'ont pu être récupérées.",
							background: 'bg-warning-500',
						})
					} else {
						console.log('dataUserClasses', dataUserClasses)
						classIdsNames = dataUserClasses
					}

					// fetch user students
					let userStudents: {
						[index: number]: {
							id: number
							firstname: string
							lastname: string
							fullname: string
						}[]
					} = {}
					try {
						const results = await Promise.all(
							data.classes.map((c) => fetchClassStudentsIdsNames(c)),
						)
						if (!results.some((result) => result.error)) {
							results.forEach((result, i) => {
								if (result.data) {
									console.log('result.data', result.data)
									userStudents[data.classes[i]] = result.data.map(
										(student) => ({
											id: student.id,
											firstname: student.firstname,
											lastname: student.lastname,
											fullname: student.fullname,
										}),
									)
								}
							})
						}
					} catch (e) {
						fail((e as Error).message)
						userStudents = {}
						toastStore.trigger({
							message: "Les élèves de l'utilisateur n'ont pu être récupérés.",
							background: 'bg-warning-500',
						})
					}

					const u = createUser({
						...data,
						...extraInfo,
						classIdsNames,
						studentsIdsNames: userStudents,
						avatar: session.user.user_metadata.avatar_url,
					})
					user.set(u)
					connected.set(true)
					toastStore.trigger({
						message: `Bienvenue ${u.firstname || u.fullname || u.email}`,
						background: 'bg-success-500',
					})
					console.log('u', u)
				}
			}
		} else if (!session && !$user.isGuest()) {
			user.set(guest)
			connected.set(false)
			info('User is not signed in.')
		}
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

<AppShell on:scroll={scrollHandler} slotSidebarLeft="bg-surface-100-800-token">
	<svelte:fragment slot="header">
		{#if !url.includes('dashboard')}
			<TobBar {drawerOpen} />
		{/if}
	</svelte:fragment>
	<svelte:fragment slot="sidebarLeft">
		{#if !url.includes('assessment') && !url.includes('dashboard')}
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

<Toast />
<Modal />
