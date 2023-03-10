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
		fullScreen,
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
		fetchAssignments,
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
	import type { Assignment, ExtraInfo, User, UserProfile } from '$lib/type'
	import { createUser } from '$lib/users'
	import AssessmentMgmt from './dashboard/AssessmentMgmt.svelte'
	import Basket from './automaths/Basket.svelte'
	import IconFullscreen from '$lib/icones/IconFullscreen.svelte'

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
						"D??sol?? mais Ubumaths est r??serv?? pour l'instant aux ??l??ves du lyc??e Voltaire de Doha.",
					background: 'bg-error-500',
				})
				supabaseClient.auth.signOut()
			} else {
				// get user data from supabase
				const { data, error } = await getUserByEmail(session.user.email)

				if (error) {
					fail(error.message)
					toastStore.trigger({
						message: "Les donn??es utilisateurs n'ont pu ??tre r??cup??r??es.",
						background: 'bg-error-500',
					})
				} else if (!data) {
					toastStore.trigger({
						message:
							"Le compte n'existe pas. Il faut demander ?? M. Le Jolly de le cr??er.",
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
								message: "Les donn??es utilisateurs n'ont pu ??tre mises ?? jour.",
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
							message: "Les classes de l'utilisateur n'ont pu ??tre r??cup??r??es.",
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
							message: "Les ??l??ves de l'utilisateur n'ont pu ??tre r??cup??r??s.",
							background: 'bg-warning-500',
						})
					}

					let assignments: Assignment[] = []
					if (data.role === 'student') {
						const { data: dataAssignments, error } = await fetchAssignments(
							data.id,
						)
						if (error) {
							warn(error.message)
							toastStore.trigger({
								message: "Les ??valuations ?? faire n'ont pu ??tre r??cup??r??es.",
								background: 'bg-warning-500',
							})
						} else if (!dataAssignments) {
							warn('no assignments found')
							toastStore.trigger({
								message: 'Aucune donn??e re??ue pour les ??valuations ?? faire.',
								background: 'bg-warning-500',
							})
						} else if (dataAssignments.length) {
							assignments = dataAssignments.map((assignment) => ({
								...assignment,
								questions: [],
								basket: JSON.parse(assignment.basket as string),
							}))
						}
					}

					const u = createUser({
						...data,
						...extraInfo,
						classIdsNames,
						studentsIdsNames: userStudents,
						assignments,
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
			{#if $user.assignments?.length && url.includes('assessment')}
				<div class="p-4 bg-error-500 text-white">
					Tu as <a href="/dashboard">des ??valuations</a> ?? faire !
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
