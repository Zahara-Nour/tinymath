<script lang="ts">
	import { drawVipCards } from '$lib/vips/cards'
	import type { SupabaseClient } from '@supabase/supabase-js'
	import type { Database } from '../../../types/supabase'
	import IconCards from '$lib/icones/IconCards.svelte'
	import VipCardsByCategory from './VIPCardsByCategory.svelte'
	import {
		toastStore,
		type ModalSettings,
		modalStore,
	} from '@skeletonlabs/skeleton'
	import VipCardUI from '$lib/vips/VipCard.svelte'
	import DrawnCards from './DrawnCards.svelte'
	import { createEventDispatcher } from 'svelte'
	import {
		isTeacher,
		type CardWallet,
		type StudentProfile,
		type User,
	} from '../../../types/type'

	export let student: StudentProfile
	export let db: SupabaseClient<Database>
	export let short = false
	export let user: User

	let commons: CardWallet
	let uncommons: CardWallet
	let rares: CardWallet
	let legendaries: CardWallet
	let pendingVip = false
	let modalComponent
	let disabled = false

	const dispatch = createEventDispatcher()

	$: updateCards(student.vips)

	function updateCards(vips: CardWallet) {
		commons = vips.filter((c) => c.card.rarity === 'common')
		uncommons = vips.filter((c) => c.card.rarity === 'uncommon')
		rares = vips.filter((c) => c.card.rarity === 'rare')
		legendaries = vips.filter((c) => c.card.rarity === 'legendary')
	}

	async function onDrawCard() {
		disabled = true
		const { error, draws } = await drawVipCards(student)

		if (error) {
			toastStore.trigger({
				message: error.message,
				background: 'bg-error-500',
			})
		} else {
			updateCards(student.vips)
			dispatch('updateGidouilles', {
				text: 'Gidouilles updated',
			})
			// force update
			student.gidouilles = student.gidouilles
			modalComponent = {
				// Pass a reference to your custom component
				ref: DrawnCards,
				// Add the component properties as key/value pairs
				props: { cards: draws, student, user },
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
		disabled = false
	}
</script>

<div class="mt-8 card">
	<header class="card-header flex gap-2 items-center">
		<h3 class="card-title">
			{`cartes VIP de ${student.firstname}`}
		</h3>
		{#if isTeacher(user)}
			<button
				class="btn-icon variant-filled-primary"
				disabled={disabled || student.gidouilles < 3}
				on:click={onDrawCard}
			>
				<IconCards />
			</button>
		{/if}
	</header>
	<section class="p-4 flex flex-col w-full max-w-full shadow-md">
		{#if Object.keys(commons).length}
			<VipCardsByCategory
				on:updateVips={() => {
					updateCards(student.vips)
					dispatch('updateVips', {
						text: 'Vips updated',
					})
				}}
				{short}
				{student}
				{db}
				wallet={commons}
				category="commons"
				{user}
			/>
		{/if}
		{#if Object.keys(uncommons).length}
			<VipCardsByCategory
				on:updateVips={() => {
					updateCards(student.vips)
					dispatch('updateVips', {
						text: 'Vips updated',
					})
				}}
				{short}
				{student}
				{db}
				wallet={uncommons}
				category="uncommons"
				{user}
			/>
		{/if}
		{#if Object.keys(rares).length}
			<VipCardsByCategory
				on:updateVips={() => {
					updateCards(student.vips)
					dispatch('updateVips', {
						text: 'Vips updated',
					})
				}}
				{short}
				{student}
				{db}
				wallet={rares}
				category="rares"
				{user}
			/>
		{/if}
		{#if Object.keys(legendaries).length}
			<VipCardsByCategory
				on:updateVips={() => {
					updateCards(student.vips)
					dispatch('updateVips', {
						text: 'Vips updated',
					})
				}}
				{short}
				{student}
				{db}
				wallet={legendaries}
				category="legendaries"
				{user}
			/>
		{/if}
	</section>
</div>
