<script lang="ts">
	import {
		isStudent,
		type CardWallet,
		type StudentProfile,
		type User,
		type VipCard,
	} from '../../../types/type'
	import type { SupabaseClient } from '@supabase/supabase-js'
	import type { Database } from '../../../types/supabase'
	import VipCardUI from '$lib/vips/VipCard.svelte'
	import { drawVipCards, useVipCard } from '$lib/vips/cards'
	import { createEventDispatcher } from 'svelte'
	import {
		toastStore,
		type ModalSettings,
		modalStore,
	} from '@skeletonlabs/skeleton'
	import DrawnCards from './DrawnCards.svelte'

	const dispatch = createEventDispatcher()

	export let wallet: CardWallet
	export let student: StudentProfile
	export let db: SupabaseClient<Database>
	export let category = ''
	export let user: User
	export let short = false

	let disabled = false
	let modalComponent

	async function onUseCard(card: VipCard) {
		console.log('using card', card.name)
		disabled = true
		if (card.effect) {
			console.log('effect', card.effect)
			if (card.effect.name === 'draw') {
				const { error, draws } = await drawVipCards(
					student,
					card.effect.param,
					0,
				)
				if (error) {
					toastStore.trigger({
						message: error.message,
						background: 'bg-error-500',
					})
					return
				} else {
					console.log('drawns cards', draws)
					dispatch('updateVips', {
						text: 'Vips updated',
					})
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
			}
		}
		const error = await useVipCard(card, student)
		if (error) {
			console.log("La carte n'a pas puêtre utilisée : " + error.message)
			toastStore.trigger({
				message: "La carte n'a pas pu être utilisée : " + error.message,
			})
		} else {
			console.log('La carte a été utilisée avec succès')
			console.log('vips', student.vips)
			dispatch('updateVips', {
				text: 'Vips updated',
			})
		}
		disabled = false
	}
</script>

<div class="mt-6">
	<div class="font-bold text-2xl mb-4">{category}</div>
	<div class="flex gap-8 flex-wrap justify-center items-center">
		{#each wallet as { card, count } (card.name)}
			{#if count > 0}
				<div class="flex flex-col items-center">
					<div class="relative">
						{#if count > 1}
							<span
								class="badge-icon variant-filled-success absolute -top-0 -right-0 z-10 w-10 h-10"
								><span class="text-white text-xl">{count}</span></span
							>
							<VipCardUI on:updateVips {card} {user} {student} {short} />
						{:else}
							<VipCardUI on:updateVips {card} {user} {student} {short} />
						{/if}
					</div>
					{#if isStudent(user) && card.effect}
						<div>
							<button
								class="btn mt-2 variant-filled-primary"
								{disabled}
								on:click={() => onUseCard(card)}
							>
								Use
							</button>
						</div>
					{/if}
				</div>
			{/if}
		{/each}
	</div>
</div>
