<script lang="ts">
	import type { ActionData } from './$types'

	export let form: ActionData
</script>

<main>
	{#if form?.error}
		<p class="error">{form.error}</p>
	{/if}
	<h1>Login</h1>
	<form action="?/login" method="POST" class="auth-form">
		<label for=""> Email </label>
		<input type="text" name="email" />
		<label for=""> Password </label>
		<input type="password" name="password" />
		<button type="submit" class="btn btn-primary">Login</button>
	</form>
	<form class="socials" method="POST">
		<button formaction="?/login&provider=github" class="btn btn-ghost"
			>Github</button
		>
		<button formaction="?/login&provider=discord" class="btn btn-ghost"
			>Discord</button
		>
		<button formaction="?/login&provider=google" class="btn btn-ghost"
			>Google</button
		>
	</form>
</main>
