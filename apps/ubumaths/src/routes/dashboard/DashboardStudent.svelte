<script lang="ts">
	import IconUsers from '$lib/icones/IconUsers.svelte'
	import UserAvatar from '$lib/ui/UserAvatar.svelte'
	import { AppRail, AppRailTile } from '@skeletonlabs/skeleton'
	import { writable, type Writable } from 'svelte/store'

	const storeValue: Writable<number> = writable(1)
</script>

<AppRail selected={storeValue}>
	<svelte:fragment slot="lead">
		<AppRailTile label="Tile" title="Tile" value={1}
			><UserAvatar place={'Rail'} /></AppRailTile
		>
		<AppRailTile label="Tile" title="Tile" value={2}><IconUsers /></AppRailTile>
	</svelte:fragment>
	<!-- AppRailTiles -->
	<svelte:fragment slot="trail">
		<!-- AppRailTiles -->
	</svelte:fragment>
</AppRail>
