<script lang="ts">
	import PageHeader from '$lib/ui/PageHeader.svelte'
	import { getLogger, objectMap } from '$lib/utils'
	import {
		modalStore,
		toastStore,
		type ModalSettings,
	} from '@skeletonlabs/skeleton'
	import type { Student } from '../../types/type'
	import Gidouille from '$lib/icones/Gidouille.svelte'
	import { user } from '$lib/stores'
	import type { SupabaseClient } from '@supabase/supabase-js'
	import type { Database } from '../../types/supabase'
	import { updateGidouille, updateVip } from '$lib/db'
	import IconCards from '$lib/icones/IconCards.svelte'
	import vipCards from '$lib/vips/cards'
	import VipCard from '$lib/vips/VipCard.svelte'

	export let db: SupabaseClient<Database>

	let pendingVip = false
	let { warn, trace, fail } = getLogger('StudentAwardMgmt', 'warn')
	let u = $user as Student

	// import MyCustomComponent from '...';

	let modalComponent

	async function drawVipCard() {
		if (u.gidouilles >= 3) {
			pendingVip = true
			const { error } = await updateGidouille(db, u.id, u.gidouilles - 3)
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
				const alea = Math.random()

				const rarity =
					alea < 0.5
						? 'common'
						: alea < 0.8
						? 'uncommon'
						: alea < 0.95
						? 'rare'
						: 'legendary'
				const cards = vipCards.filter((c) => c.rarity === rarity)
				const card = cards[Math.floor(Math.random() * cards.length)]
				console.log('card', card.name)

				const { error } = await updateVip(db, u.id, u.vips)
				if (error) {
					console.log(error.message)
					toastStore.trigger({
						message: 'La mise à jour des cartes VIP a échoué.',
						background: 'bg-error-500',
					})
				} else {
					if (!u.vips[card.name]) {
						u.vips[card.name] = 1
					} else {
						u.vips[card.name]++
					}
					modalComponent = {
						// Pass a reference to your custom component
						ref: VipCard,
						// Add the component properties as key/value pairs
						props: { name: card.name },
						// Provide a template literal for the default component slot
						slot: '<p>Skeleton</p>',
					}
					const d: ModalSettings = {
						backdropClasses: '!bg-surface-800 text-black',
						type: 'component',
						// Pass the component directly:
						component: modalComponent,
					}
					modalStore.trigger(d)
				}
			}
			pendingVip = false
		}
	}
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

<div class="mt-8 card">
	<header class="card-header"><h3 class="card-title">cartes VIP</h3></header>
	<section class="p-4">
		<div
			class="flex  flex-wrap justify-between items-center w-full max-w-full text-black bg-surface-500 shadow-md rounded-md p-2 mb-2"
		>
			<div class="flex gap-4 flex-wrap">
				{#each Object.entries(u.vips) as [name, count]}
					{#if count > 0}
						<div class="relative inline-block">
							{#if count > 1}
								<span
									class="badge-icon variant-filled-success absolute -top-0 -right-0 z-10 w-10 h-10"
									><span class="text-white text-xl">{count}</span></span
								>
								<VipCard {name} />
							{:else}
								<VipCard {name} />
							{/if}
						</div>
					{/if}
				{/each}
			</div>
		</div>
	</section>
</div>
