<script lang="ts">
	import { Toast, toastStore } from '@skeletonlabs/skeleton'
	import type { ActionData, PageData } from './$types'

	export let form: ActionData
	export let data: PageData

	if (form?.error) {
		toastStore.trigger({
			message: form.error,
			background: 'bg-error-500',
		})
	}

	if (data.session?.user) {
		toastStore.trigger({
			message: 'Vous êtes déjà connecté en tant que ' + data.session.user.email,
			background: 'bg-error-500',
		})
	}
</script>

<h1>Inscription</h1>
{#if !data.session?.user}
	<div class="mt-16 flex items-center justify-center">
		<div class="p-4 card w-96 max-w-full">
			<form action="?/register" method="POST" class="auth-form">
				<label class="label" for=""> Email </label>
				<input class="input" type="text" name="email" />
				<label class="mt-4  label" for=""> Password </label>
				<input class="input" type="password" name="password" />
				<div class="flex justify-center">
					<button class="mt-4 btn variant-filled-primary">Register</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<Toast />
