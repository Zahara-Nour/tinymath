<script lang="ts">
	import Gidouille from '$lib/icones/Gidouille.svelte'
	import IconUsers from '$lib/icones/IconUsers.svelte'
	import UserAvatar from '$lib/ui/UserAvatar.svelte'
	import { AppRail, AppRailTile } from '@skeletonlabs/skeleton'
	import { writable, type Writable } from 'svelte/store'
	import UserMgmt from './UserMgmt.svelte'

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
		<AppRailTile value={1}><IconUsers /></AppRailTile>
		<svelte:fragment slot="trail">
			<!-- AppRailTiles -->
		</svelte:fragment>
	</AppRail>
	<div class="container mx-auto p-4">
		{#if $storeValue === 1}
			<UserMgmt />
		{/if}
	</div>
</div>
