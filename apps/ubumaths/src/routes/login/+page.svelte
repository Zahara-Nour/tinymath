<script lang="ts">
	import { toastStore } from '@skeletonlabs/skeleton'
	import type { ActionData } from './$types'

	export let form: ActionData

	if (form?.error) {
		toastStore.trigger({
			message: form.error,
			background: 'bg-error-500',
		})
	}
</script>

<h1>Login</h1>
<div class="mt-16 flex items-center justify-center">
	<div class="p-4 card w-96 max-w-full">
		<form action="?/login" method="POST" class="auth-form">
			<label class="label" for=""> Email </label>
			<input class="input" type="text" name="email" />
			<label class="mt-4 label" for=""> Password </label>
			<input class="input" type="password" name="password" />
			<div class="flex justify-center">
				<button type="submit" class="mt-4 btn variant-filled-primary"
					>Login</button
				>
			</div>
		</form>
	</div>
</div>
