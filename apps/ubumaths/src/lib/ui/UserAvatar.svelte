<script lang="ts">
	import IconLogin from '$lib/icones/IconLogin.svelte'
	import IconUser from '$lib/icones/IconUser.svelte'
	import { user } from '$lib/stores'
	import { popup } from '@skeletonlabs/skeleton'

	export let place = 'TopBar'
</script>

{#if !$user.isGuest()}
	{#if place === 'TopBar'}
		<div>
			<span
				use:popup={{
					event: 'click',
					target: 'avatarMenuTop',
					placement: 'bottom',
				}}
			>
				<button class={'text-xl btn-icon variant-filled-primary'}
					><IconUser />
				</button>
			</span>
			<div
				class="card variant-filled-surface p-2 shadow-xl z-100"
				data-popup="avatarMenuTop"
			>
				<nav class="list-nav">
					<!-- (optionally you can provde a label here) -->
					<ul>
						<li>
							<a href="/dashboard">
								<span class="flex-auto">Dashboard</span>
							</a>
						</li>

						<li>
							<a href="/logout" class="btn variant-filled-error">Déconnexion</a>
						</li>
					</ul>
				</nav>
			</div>
		</div>
	{:else}
		<div>
			<span
				use:popup={{
					event: 'click',
					target: 'avatarMenu',
					placement: 'right',
				}}
			>
				<button class={'text-xl btn-icon variant-filled-primary'}
					><IconUser />
				</button>
			</span>
			<div
				class="card variant-filled-surface p-2 shadow-xl z-100"
				data-popup="avatarMenu"
			>
				<nav class="list-nav">
					<!-- (optionally you can provde a label here) -->
					<ul>
						<li>
							<a href="/logout" class="btn variant-filled-error"
								><span class="flex-auto">Déconnexion</span></a
							>
						</li>
					</ul>
				</nav>
			</div>
		</div>
	{/if}
{:else}
	<a href="/login" class={'text-xl btn-icon variant-filled-tertiary'}
		><IconLogin />
	</a>
{/if}
