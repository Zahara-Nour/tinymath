<script lang="ts">
	import type { ActionData, PageData } from './$types'

	export let form: ActionData
	export let data: PageData
</script>

<main>
	{#if form?.success}
		<!-- this message is ephemeral; it exists because the page was rendered in
	   response to a form submission. it will vanish if the user reloads -->
		<p>Successfully registered! Welcome, {data.session?.user.email}</p>
	{:else if data.session?.user}
		<p>You are already logged in as {data.session.user.email}</p>
	{:else}
		{#if form?.error}
			<p class="error">{form.error}</p>
		{/if}
		<h1>Register</h1>
		<form action="?/register" method="POST" class="auth-form">
			<label for=""> Email </label>
			<input type="text" name="email" />
			<label for=""> Password </label>
			<input type="password" name="password" />
			<button class="btn btn-primary">Register</button>
		</form>
	{/if}
</main>
