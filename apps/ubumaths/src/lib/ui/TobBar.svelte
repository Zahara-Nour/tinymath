<script lang="ts">
	import {
		AppBar,
		Avatar,
		popup,
		type PopupSettings,
	} from '@skeletonlabs/skeleton'
	import { LightSwitch } from '@skeletonlabs/skeleton'
	import { fontSize } from '$lib/stores'
	import links from '$lib/navlinks'
	import { page } from '$app/stores'
	import { get } from 'svelte/store'
	import type { Session } from '@supabase/supabase-js'
	import { enhance, type SubmitFunction } from '$app/forms'
	import { supabaseClient } from '$lib/supabaseClients'

	export let drawerOpen: () => void
	export let session: Session | null
	// if JS enabled, we'll use this to submit the logout form
	let submitLogout: SubmitFunction = async ({ cancel }) => {
		const { error } = await supabaseClient.auth.signOut()
		if (error) {
			console.log(error)
		}
		// prevent the form submission from actually going through
		cancel()
	}

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
		{#if session}
			<span
				use:popup={{
					event: 'click',
					target: 'avatarMenu',
					placement: 'bottom',
				}}
			>
				<Avatar
					border="border-4 border-surface-300-600-token hover:!border-primary-500"
					cursor="cursor-pointer"
					src={session.user.user_metadata.avatar_url}
				/>
			</span>
			<div
				class="card variant-filled-surface p-2 shadow-xl"
				data-popup="avatarMenu"
			>
				<nav class="list-nav">
					<!-- (optionally you can provde a label here) -->
					<ul>
						<li>
							<form action="/logout" method="POST" use:enhance={submitLogout}>
								<button type="submit" class="btn variant-filled-error"
									>Logout</button
								>
							</form>
						</li>
						<li>
							<a href="/profile">
								<span class="flex-auto">Profile</span>
							</a>
						</li>
					</ul>
				</nav>
			</div>
		{:else}
			<span
				use:popup={{
					event: 'click',
					target: 'loginMenu',
					placement: 'bottom',
				}}
			>
				<button class={'text-xl btn-icon variant-filled-primary'}
					><iconify-icon icon="fa:user-circle-o" />
				</button>
			</span>
			<div
				class="card variant-filled-surface p-2 shadow-xl"
				data-popup="loginMenu"
			>
				<nav class="list-nav">
					<!-- (optionally you can provde a label here) -->
					<ul>
						<li>
							<a href="/login">
								<span class="flex-auto">Connexion</span>
							</a>
						</li>
					</ul>
				</nav>
			</div>
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
