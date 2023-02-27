<script lang="ts">
	import { goto } from '$app/navigation'
	import { user } from '$lib/stores'
	import DashboardAdmin from './DashboardAdmin.svelte'
	import DashboardStudent from './DashboardStudent.svelte'
	import DashboardTeacher from './DashboardTeacher.svelte'
</script>

{#if $user.isAdmin()}
	<DashboardAdmin />
{:else if $user.isTeacher()}
	<DashboardTeacher />
{:else if $user.isStudent()}
	<DashboardStudent />
{:else}
	Vous n'êtes pas autorisé à voir cette page
{/if}
