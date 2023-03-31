<script lang="ts">
	import PageHeader from '$lib/ui/PageHeader.svelte'
	import { getLogger, objectMap } from '$lib/utils'
	import {
		Accordion,
		AccordionItem,
		ListBox,
		ListBoxItem,
		popup,
		toastStore,
		type PopupSettings,
	} from '@skeletonlabs/skeleton'
	import type { Student, StudentProfile, Teacher } from '$lib/type'
	import IconPlus from '$lib/icones/IconPlus.svelte'
	import IconMinus from '$lib/icones/IconMinus.svelte'
	import Gidouille from '$lib/icones/Gidouille.svelte'
	import { user } from '$lib/stores'
	import type { SupabaseClient } from '@supabase/supabase-js'
	import type { Database } from '../../../types/supabase'
	import { enhance } from '$app/forms'
	import { updateGidouille } from '$lib/db'
	import IconCards from '$lib/icones/IconCards.svelte'

	export let db: SupabaseClient<Database>

	let pendingVip = false

	async function drawVipCard() {
		if (u.gidouilles >= 3) {
			pendingVip = true
			const { error } = await updateGidouille(db, u.id, (u.gidouilles -= 3))
			if (error) {
				console.log(error.message)
				toastStore.trigger({
					message: 'Le retrait de gidouilles a échoué.',
					background: 'bg-error-500',
				})
			} else {
				u.gidouilles -= 3
				// force update
				u = u
			}
			pendingVip = false
		}
	}

	let { warn, trace, fail } = getLogger('StudentAwardMgmt', 'warn')
	let u = $user as Student
</script>

<PageHeader title="Récompenses / Avertissements" />

<div class="mt-8 card">
	<header class="card-header"><h3 class="card-title">Gidouilles</h3></header>
	<section class="p-4">
		<div
			class="flex  justify-between items-center w-full max-w-full text-black bg-surface-500 shadow-md rounded-md p-2 mb-2"
		>
			<div class="flex">
				<div class="text-xl font-bold overflow-hidden mr-2">
					Gidouilles : {u.gidouilles}
				</div>
				<div class="text-primary-700">
					<Gidouille class="text-white" />
				</div>
			</div>
			<button
				class="btn-icon variant-filled-primary"
				disabled={pendingVip || u.gidouilles < 3}
				on:click={() => drawVipCard()}
			>
				<IconCards />
			</button>
		</div>
	</section>
</div>
