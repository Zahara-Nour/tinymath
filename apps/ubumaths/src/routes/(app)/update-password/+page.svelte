<script lang="ts">
	import { toastStore } from '@skeletonlabs/skeleton'
	import { Pulse } from 'svelte-loading-spinners'

	export let form

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
	<h1 class="mb-4">Réinitialisation du mot de passe</h1>
	<div class="p-4 card w-96 max-w-full">
		<form name="myform" action="?/update" method="POST">
			<label class="mt-4 label" for=""> Mot de passe </label>
			<input class="input" type="password" name="password" />
			<div class="flex justify-center">
				<button
					on:click={() => {
						pending = true
						document.myform.submit()
					}}
					disabled={pending}
					type="submit"
					class="mt-4 btn variant-filled-primary">Valider</button
				>
			</div>
		</form>
	</div>
	{#if pending}
		<span class="mt-8">
			<Pulse size="60" color="#ffc400" unit="px" duration="1s" />
		</span>
	{/if}
</div>
