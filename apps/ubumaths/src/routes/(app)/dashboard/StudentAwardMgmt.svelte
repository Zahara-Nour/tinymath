<script lang="ts">
	import PageHeader from '$lib/ui/PageHeader.svelte'
	import { getLogger, objectMap } from '$lib/utils'
	import type { Student } from '../../../types/type'
	import Gidouille from '$lib/icones/Gidouille.svelte'
	import { user } from '$lib/stores'
	import type { SupabaseClient } from '@supabase/supabase-js'
	import type { Database } from '../../../types/supabase'
	import VipCards from './VIPCards.svelte'

	export let db: SupabaseClient<Database>

	let { warn, trace, fail } = getLogger('StudentAwardMgmt', 'warn')
	let u = $user as Student

	function handleUpdateGidouilles() {
		u = u
	}
</script>

<PageHeader title="Récompenses" />

<div class="mt-8 card">
	<header class="card-header"><h3 class="card-title">Gidouilles</h3></header>
	<section class="p-4">
		<div
			class="flex justify-between items-center w-full max-w-full text-black bg-surface-500 shadow-md rounded-md p-2 mb-2"
		>
			<div class="flex">
				<div class="text-xl font-bold overflow-hidden mr-2">
					Gidouilles : {u.gidouilles}
				</div>
				<div class="text-primary-700">
					<Gidouille class="text-white" />
				</div>
			</div>
		</div>
	</section>
</div>

<VipCards
	on:updateGidouilles={handleUpdateGidouilles}
	{db}
	student={u}
	user={u}
/>
