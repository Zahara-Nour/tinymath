<script lang="ts">
	import { goto } from '$app/navigation'
	import { user } from '$lib/stores'
	import DashboardAdmin from './DashboardAdmin.svelte'
	import DashboardStudent from './DashboardStudent.svelte'
	import DashboardTeacher from './DashboardTeacher.svelte'

	export let data
</script>

{#if $user.isAdmin()}
	<DashboardAdmin db={data.supabase} />
{:else if $user.isTeacher()}
	<DashboardTeacher db={data.supabase} />
{:else if $user.isStudent()}
	<DashboardStudent db={data.supabase} />
{:else}
	Vous n'êtes pas autorisé à voir cette page
{/if}
