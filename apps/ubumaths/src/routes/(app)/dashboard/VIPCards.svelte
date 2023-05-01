<script lang="ts">
	import { objectMap } from '$lib/utils'
	import VipCard from '$lib/vips/VipCard.svelte'
	import type { StudentProfile } from '../../../types/type'
	import vipCards from '$lib/vips/cards'
	import { updateVip } from '$lib/db'
	import type { SupabaseClient } from '@supabase/supabase-js'
	import type { Database } from '../../../types/supabase'
	import IconCards from '$lib/icones/IconCards.svelte'
	import VipCardsByCategory from './VIPCardsByCategory.svelte'
	import {
		toastStore,
		type ModalSettings,
		modalStore,
	} from '@skeletonlabs/skeleton'

	export let student: StudentProfile
	export let db: SupabaseClient<Database>

	let commons: Record<string, number> = {}
	let uncommons: Record<string, number> = {}
	let rares: Record<string, number> = {}
	let legendaries: Record<string, number> = {}
	let pendingVip = false
	let modalComponent

	updateCards(student.vips)

	function updateCards(vips: Record<string, number>) {
		commons = objectMap(vips, (count, name) => {
			const card = vipCards.find((c) => c.name === name)!
			return count > 0 && card.rarity === 'common' ? count : 0
		})

		uncommons = objectMap(vips, (count, name) => {
			const card = vipCards.find((c) => c.name === name)!
			return count > 0 && card.rarity === 'uncommon' ? count : 0
		})
		rares = objectMap(vips, (count, name) => {
			const card = vipCards.find((c) => c.name === name)!
			return count > 0 && card.rarity === 'rare' ? count : 0
		})
		legendaries = objectMap(vips, (count, name) => {
			const card = vipCards.find((c) => c.name === name)!
			return count > 0 && card.rarity === 'legendary' ? count : 0
		})
		console.log(
			'update cards',
			vips,
			{ ...commons },
			{ ...uncommons },
			{ ...rares },
			{ ...legendaries },
		)
	}

	async function drawVipCard() {
		if (student) {
			pendingVip = true

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

			const { error } = await updateVip(
				db,
				student.id,
				!student.vips[card.name]
					? { ...student.vips, [card.name]: 1 }
					: {
							...student.vips,
							[card.name]: student.vips[card.name] + 1,
					  },
			)
			if (error) {
				console.log(error.message)
				toastStore.trigger({
					message: 'La mise à jour des cartes VIP a échoué.',
					background: 'bg-error-500',
				})
			} else {
				if (!student.vips[card.name]) {
					student.vips[card.name] = 1
				} else {
					student.vips[card.name]++
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
				updateCards(student.vips)
			}

			pendingVip = false
		}
	}
</script>

<div class="mt-8 card">
	<header class="card-header flex gap-2 items-center bg-surface-500 text-black">
		<h3 class="card-title">
			{`cartes VIP de ${student.firstname}`}
		</h3>
		<button
			class="btn-icon variant-filled-primary"
			disabled={pendingVip}
			on:click={drawVipCard}
		>
			<IconCards />
		</button>
	</header>
	<section
		class="p-4 flex flex-col w-full max-w-full bg-surface-500 text-black shadow-md"
	>
		{#if Object.keys(commons).length}
			<VipCardsByCategory {student} {db} cards={commons} category="commons" />
		{/if}
		{#if Object.keys(uncommons).length}
			<VipCardsByCategory
				{student}
				{db}
				cards={uncommons}
				category="uncommons"
			/>
		{/if}
		{#if Object.keys(rares).length}
			<VipCardsByCategory {student} {db} cards={rares} category="rares" />
		{/if}
		{#if Object.keys(legendaries).length}
			<VipCardsByCategory
				{student}
				{db}
				cards={legendaries}
				category="legendaries"
			/>
		{/if}
	</section>
</div>
