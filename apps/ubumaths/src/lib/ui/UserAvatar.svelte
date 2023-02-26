<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms'
	import { goto } from '$app/navigation'
	import { supabaseClient } from '$lib/db'
	import IconUser from '$lib/icones/IconUser.svelte'
	import { user } from '$lib/stores'
	import { Avatar, popup } from '@skeletonlabs/skeleton'
	import type { Provider, Session } from '@supabase/supabase-js'

	export let place = 'TopBar'

	const signInWithProvider = async (provider: Provider) => {
		await supabaseClient.auth.signInWithOAuth({
			provider: provider,
		})
	}

	const submitSocialLogin: SubmitFunction = async ({ action, cancel }) => {
		switch (action.searchParams.get('provider')) {
			case 'google':
				await signInWithProvider('google')
				break
			case 'discord':
				await signInWithProvider('discord')
				break
			case 'github':
				await signInWithProvider('github')
				break
			default:
				break
		}
		cancel()
	}

	// if JS enabled, we'll use this to submit the logout form
	let submitLogout: SubmitFunction = async ({ cancel }) => {
		const { error } = await supabaseClient.auth.signOut()
		if (error) {
			console.log(error)
		}
		cancel()
		goto('/')
	}
</script>

{#if !$user.isGuest()}
	<div>
		<span
			use:popup={{
				event: 'click',
				target: 'avatarMenu',
				placement: 'right',
			}}
		>
			<Avatar
				border="border-4 border-surface-300-600-token hover:!border-primary-500"
				cursor="cursor-pointer"
				src={$user.avatar}
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
								>Déconnexion</button
							>
						</form>
					</li>
					{#if place === 'TopBar'}
						<li>
							<a href="/dashboard">
								<span class="flex-auto">Dashboard</span>
							</a>
						</li>
					{/if}
				</ul>
			</nav>
		</div>
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
			><IconUser />
		</button>
	</span>
	<div class="card variant-filled-surface p-2 shadow-xl" data-popup="loginMenu">
		<nav class="list-nav">
			<!-- (optionally you can provde a label here) -->
			<ul>
				<li>
					<form class="socials" method="POST" use:enhance={submitSocialLogin}>
						<button formaction="?/login&provider=google" class="btn btn-ghost"
							>Connexion</button
						>
					</form>
				</li>
			</ul>
		</nav>
	</div>
{/if}
