<script lang="ts">
	import Gidouille from '$lib/icones/Gidouille.svelte'
	import IconAward from '$lib/icones/IconAward.svelte'
	import IconUsers from '$lib/icones/IconUsers.svelte'
	import UserAvatar from '$lib/ui/UserAvatar.svelte'
	import { AppRail, AppRailTile } from '@skeletonlabs/skeleton'
	import type { SupabaseClient } from '@supabase/supabase-js'
	import { writable, type Writable } from 'svelte/store'
	import type { Database } from '../../../types/supabase'
	import AssignmentsMgmt from './AssignmentsMgmt.svelte'
	import StudentAwardMgmt from './StudentAwardMgmt.svelte'
	import IconAlert from '$lib/icones/IconAlert.svelte'
	import StudentWarningMgmt from './StudentWarningMgmt.svelte'

	export let db: SupabaseClient<Database>

	const storeValue: Writable<number> = writable(1)
</script>

<div class="flex h-full">
	<AppRail background="bg-surface-100-800-token" selected={storeValue}>
		<svelte:fragment slot="lead">
			<AppRailTile
				><a href="/"><Gidouille class=" text-primary-500" /></a></AppRailTile
			>
			<AppRailTile><UserAvatar place={'Rail'} /></AppRailTile>
		</svelte:fragment>
		<!-- AppRailTiles -->
		<AppRailTile value={1}
			><span class="text-3xl"><IconUsers /></span></AppRailTile
		>
		<AppRailTile value={2}
			><span class="text-3xl"><IconAward /></span></AppRailTile
		>
		<AppRailTile value={3}
			><span class="text-3xl"><IconAlert /></span></AppRailTile
		>
		<svelte:fragment slot="trail">
			<!-- AppRailTiles -->
		</svelte:fragment>
	</AppRail>
	<div class="container mx-auto p-4">
		{#if $storeValue === 1}
			<AssignmentsMgmt />
		{:else if $storeValue === 2}
			<StudentAwardMgmt {db} />
		{:else if $storeValue === 3}
			<StudentWarningMgmt {db} />
		{/if}
	</div>
</div>
