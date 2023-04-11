<script lang="ts">
	import { toastStore } from '@skeletonlabs/skeleton'
	import { Jumper, Pulse } from 'svelte-loading-spinners'
	import type { ActionData } from './$types'

	export let form: ActionData

	let pending = false

	if (form?.error) {
		toastStore.trigger({
			message: form.error,
			background: 'bg-error-500',
		})
	}

	$: if (form) pending = false
</script>

<div class="mt-16 flex flex-col items-center justify-center">
	<h1 class="mb-4">Identifiez-vous :</h1>
	<div class="p-4 card w-96 max-w-full">
		<form name="myform" action="?/login" method="POST" class="auth-form">
			<label class="label" for=""> Email </label>
			<input class="input" type="text" name="email" />
			<label class="mt-4 label" for=""> Password </label>
			<input class="input" type="password" name="password" />
			<div class="flex justify-center">
				<button
					on:click={() => {
						pending = true
						document.myform.submit()
					}}
					disabled={pending}
					type="submit"
					class="mt-4 btn variant-filled-primary">Connexion</button
				>
			</div>
			<a href="/password-recovery" class="mt-4 text-center block"
				>Mot de passe oublié ?</a
			>
		</form>
	</div>
	{#if pending}
		<span class="mt-8">
			<Pulse size="60" color="#ffc400" unit="px" duration="1s" />
		</span>
	{/if}
</div>
