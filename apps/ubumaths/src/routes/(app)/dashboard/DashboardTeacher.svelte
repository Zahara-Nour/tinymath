<script lang="ts">
	import Gidouille from '$lib/icones/Gidouille.svelte'
	import IconAward from '$lib/icones/IconAward.svelte'
	import UserAvatar from '$lib/ui/UserAvatar.svelte'
	import { AppRail, AppRailTile } from '@skeletonlabs/skeleton'
	import type { SupabaseClient } from '@supabase/supabase-js'
	import { writable, type Writable } from 'svelte/store'
	import type { Database } from '../../../types/supabase'
	import AssessmentMgmt from './AssessmentMgmt.svelte'
	import TeacherAwardMgmt from './TeacherAwardMgmt.svelte'
	import IconAlert from '$lib/icones/IconAlert.svelte'
	import TeacherWarningMgmt from './TeacherWarningMgmt.svelte'
	import { user } from '$lib/stores'
	import IconPost from '$lib/icones/IconPost.svelte'
	import PostMgmt from './PostMgmt.svelte'
	import IconListStatus from '$lib/icones/IconListStatus.svelte'
	import TeacherUsersMgmt from './TeacherUsersMgmt.svelte'
	import IconUsers from '$lib/icones/IconUsers.svelte'

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
		<AppRailTile value={1}
			><span class="text-3xl"><IconListStatus /></span></AppRailTile
		>
		<AppRailTile value={2}
			><span class="text-3xl"><IconAward /></span></AppRailTile
		>
		<AppRailTile value={3}
			><span class="text-3xl"><IconAlert /></span></AppRailTile
		>
		{#if $user.email === 'd.lejolly@voltairedoha.com'}
			<AppRailTile value={4}
				><span class="text-3xl"><IconPost /></span></AppRailTile
			>
		{/if}
		<AppRailTile value={5}
			><span class="text-3xl"><IconUsers /></span></AppRailTile
		>
		<svelte:fragment slot="trail">
			<!-- AppRailTiles -->
		</svelte:fragment>
	</AppRail>
	<div class="container mx-auto p-4">
		{#if $storeValue === 1}
			<AssessmentMgmt {db} />
		{:else if $storeValue === 2}
			<TeacherAwardMgmt {db} />
		{:else if $storeValue === 3}
			<TeacherWarningMgmt {db} />
		{:else if $storeValue === 4}
			<PostMgmt {db} />
		{:else if $storeValue === 5}
			<TeacherUsersMgmt {db} />
		{/if}
	</div>
</div>
