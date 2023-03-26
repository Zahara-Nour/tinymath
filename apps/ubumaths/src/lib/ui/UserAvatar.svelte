<script lang="ts">
	import IconLogin from '$lib/icones/IconLogin.svelte'
	import IconUser from '$lib/icones/IconUser.svelte'
	import { user } from '$lib/stores'
	import { popup } from '@skeletonlabs/skeleton'
	import { get } from 'svelte/store'

	export let place = 'TopBar'
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
			<!-- <Avatar
				border="border-4 border-surface-300-600-token hover:!border-primary-500"
				cursor="cursor-pointer"
				src={$user.avatar}
			/> -->
			<button class={'text-xl btn-icon variant-filled-primary'}
				><IconUser />
			</button>
		</span>
		<div
			class="card variant-filled-surface p-2 shadow-xl"
			data-popup="avatarMenu"
		>
			<nav class="list-nav">
				<!-- (optionally you can provde a label here) -->
				<ul>
					<li>
						<a href="/logout" class="btn variant-filled-error">Déconnexion</a>
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
			><IconLogin />
		</button>
	</span>
	<div class="card variant-filled-surface p-2 shadow-xl" data-popup="loginMenu">
		<nav class="list-nav">
			<!-- (optionally you can provde a label here) -->
			<ul>
				<li>
					<!-- <form class="socials" method="POST" use:enhance={submitSocialLogin}>
						<button formaction="?/login&provider=google" class="btn btn-ghost"
							>Connexion</button
						>
					</form> -->
					<!-- <form method="POST">
						<button formaction="?/login" class="btn btn-ghost">Connexion</button
						>
					</form> -->
					<a class="btn btn-ghost" href="/login">Connexion</a>
				</li>
			</ul>
		</nav>
	</div>
{/if}
