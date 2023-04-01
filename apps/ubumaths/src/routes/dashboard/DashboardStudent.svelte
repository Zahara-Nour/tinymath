<script lang="ts">
	import Gidouille from '$lib/icones/Gidouille.svelte'
	import IconAward from '$lib/icones/IconAward.svelte'
	import IconUsers from '$lib/icones/IconUsers.svelte'
	import UserAvatar from '$lib/ui/UserAvatar.svelte'
	import { AppRail, AppRailTile } from '@skeletonlabs/skeleton'
	import type { SupabaseClient } from '@supabase/supabase-js'
	import { writable, type Writable } from 'svelte/store'
	import type { Database } from '../../types/supabase'
	import AssignmentsMgmt from './AssignmentsMgmt.svelte'
	import StudentAwardMgmt from './StudentAwardMgmt.svelte'

	export let db: SupabaseClient<Database>

	const storeValue: Writable<number> = writable(1)
</script>

<div class="flex h-full">
	<AppRail selected={storeValue}>
		<svelte:fragment slot="lead">
			<AppRailTile
				><a href="/"><Gidouille class=" text-primary-500" /></a></AppRailTile
			>
			<AppRailTile><UserAvatar place={'Rail'} /></AppRailTile>
		</svelte:fragment>
		<!-- AppRailTiles -->
		<AppRailTile value={1}><IconUsers /></AppRailTile>
		<AppRailTile value={2}><IconAward /></AppRailTile>
		<svelte:fragment slot="trail">
			<!-- AppRailTiles -->
		</svelte:fragment>
	</AppRail>
	<div class="container mx-auto p-4">
		{#if $storeValue === 1}
			<AssignmentsMgmt />
		{:else if $storeValue === 2}
			<StudentAwardMgmt {db} />
		{/if}
	</div>
</div>
